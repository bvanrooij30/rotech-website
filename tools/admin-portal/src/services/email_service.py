"""
Email Service - IMAP/SMTP operations.
Haalt emails op en verstuurt emails via je domein.
"""

import imaplib
import smtplib
import ssl
import email
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from email.header import decode_header
from email.utils import parsedate_to_datetime
from datetime import datetime
from typing import List, Optional, Tuple
from pathlib import Path
import hashlib

from ..database import get_db
from ..database.models import Email, Attachment, EmailAccount
from ..utils.config import Config, logger
from ..utils.helpers import extract_email_address, extract_email_name, sanitize_filename


class EmailService:
    """Service voor email operaties."""
    
    def __init__(
        self,
        host: str = None,
        imap_port: int = None,
        smtp_port: int = None,
        username: str = None,
        password: str = None
    ):
        """
        Initialize email service.
        
        Args:
            host: Email server host (default from config)
            imap_port: IMAP port (default from config)
            smtp_port: SMTP port (default from config)
            username: Email username (default from config)
            password: Email password (default from config)
        """
        self.host = host or Config.EMAIL_HOST
        self.imap_port = imap_port or Config.EMAIL_PORT_IMAP
        self.smtp_port = smtp_port or Config.EMAIL_PORT_SMTP
        self.username = username or Config.EMAIL_USERNAME
        self.password = password or Config.EMAIL_PASSWORD
        
        self._imap: Optional[imaplib.IMAP4_SSL] = None
    
    def connect_imap(self) -> bool:
        """
        Verbind met IMAP server.
        
        Returns:
            True als verbinding succesvol
        """
        try:
            context = ssl.create_default_context()
            self._imap = imaplib.IMAP4_SSL(
                self.host,
                self.imap_port,
                ssl_context=context
            )
            self._imap.login(self.username, self.password)
            logger.info(f"Connected to IMAP: {self.host}")
            return True
        except Exception as e:
            logger.error(f"IMAP connection failed: {e}")
            return False
    
    def disconnect_imap(self):
        """Verbreek IMAP verbinding."""
        if self._imap:
            try:
                self._imap.logout()
            except:
                pass
            self._imap = None
    
    def list_folders(self) -> List[Tuple[str, int]]:
        """
        List all folders and their message counts.
        
        Returns:
            List of (folder_name, message_count) tuples
        """
        if not self._imap:
            if not self.connect_imap():
                return []
        
        try:
            status, folder_list = self._imap.list()
            if status != "OK":
                return []
            
            folders = []
            for folder_data in folder_list:
                # Parse folder name from IMAP response
                if folder_data:
                    parts = folder_data.decode().split(' "/" ')
                    if len(parts) >= 2:
                        folder_name = parts[-1].strip('"')
                        
                        # Get message count
                        try:
                            status, data = self._imap.select(folder_name, readonly=True)
                            if status == "OK":
                                count = int(data[0])
                                folders.append((folder_name, count))
                        except:
                            folders.append((folder_name, 0))
            
            return folders
        except Exception as e:
            logger.error(f"Error listing folders: {e}")
            return []
    
    def check_mailbox_status(self) -> dict:
        """
        Check mailbox status and return diagnostic info.
        
        Returns:
            Dict with folder info and message counts
        """
        if not self._imap:
            if not self.connect_imap():
                return {"error": "Could not connect to IMAP"}
        
        try:
            folders = self.list_folders()
            
            result = {
                "connected": True,
                "folders": {},
                "total_messages": 0
            }
            
            for folder_name, count in folders:
                result["folders"][folder_name] = count
                result["total_messages"] += count
            
            return result
        except Exception as e:
            return {"error": str(e)}
    
    def fetch_emails(
        self,
        folder: str = "INBOX",
        limit: int = 50,
        since_date: Optional[datetime] = None,
        skip_existing: bool = True,
        account_id: Optional[int] = None
    ) -> List[Email]:
        """
        Haal emails op van server.
        
        Args:
            folder: Mailbox folder (INBOX, Sent, etc.)
            limit: Maximum aantal emails
            since_date: Alleen emails na deze datum
            skip_existing: Skip emails die al in database staan
            account_id: Account ID to set on fetched emails
            
        Returns:
            Lijst met nieuwe Email objects
        """
        if not self._imap:
            if not self.connect_imap():
                return []
        
        try:
            status, _ = self._imap.select(folder)
            if status != "OK":
                logger.error(f"Could not select folder: {folder}")
                return []
            
            # Bouw search criteria
            search_criteria = "ALL"
            if since_date:
                date_str = since_date.strftime("%d-%b-%Y")
                search_criteria = f'(SINCE "{date_str}")'
            
            status, message_ids = self._imap.search(None, search_criteria)
            if status != "OK":
                logger.error(f"IMAP search failed for {folder}")
                return []
            
            ids = message_ids[0].split()
            logger.info(f"Found {len(ids)} total messages in {folder} (search: {search_criteria})")
            
            ids = ids[-limit:]  # Laatste X emails
            ids.reverse()  # Nieuwste eerst
            
            new_emails = []
            skipped = 0
            db = get_db()
            
            for msg_id in ids:
                try:
                    email_obj = self._fetch_single_email(msg_id, folder)
                    if email_obj:
                        # Check of al bestaat
                        with db.session() as session:
                            existing = session.query(Email).filter_by(
                                message_id=email_obj.message_id
                            ).first()
                            
                            if existing and skip_existing:
                                skipped += 1
                                continue
                            
                            if not existing:
                                # Set account_id if provided
                                if account_id:
                                    email_obj.account_id = account_id
                                session.add(email_obj)
                                session.commit()
                                new_emails.append(email_obj)
                                logger.debug(f"Fetched email: {email_obj.subject}")
                
                except Exception as e:
                    logger.error(f"Error fetching email {msg_id}: {e}")
                    continue
            
            logger.info(f"Fetched {len(new_emails)} new emails from {folder} (skipped {skipped} existing)")
            return new_emails
            
        except Exception as e:
            logger.error(f"Error fetching emails: {e}")
            return []
    
    def _fetch_single_email(self, msg_id: bytes, folder: str) -> Optional[Email]:
        """Haal een enkele email op en parse naar Email object."""
        status, msg_data = self._imap.fetch(msg_id, "(RFC822)")
        if status != "OK":
            return None
        
        raw_email = msg_data[0][1]
        msg = email.message_from_bytes(raw_email)
        
        # Parse headers
        message_id = msg.get("Message-ID", f"unknown-{hashlib.md5(raw_email).hexdigest()}")
        from_header = msg.get("From", "")
        to_header = msg.get("To", "")
        cc_header = msg.get("Cc", "")
        subject = self._decode_header(msg.get("Subject", ""))
        
        # Parse date
        date_header = msg.get("Date")
        sent_at = datetime.now()
        if date_header:
            try:
                sent_at = parsedate_to_datetime(date_header)
            except:
                pass
        
        # Parse body
        body_text = ""
        body_html = ""
        attachments = []
        
        if msg.is_multipart():
            for part in msg.walk():
                content_type = part.get_content_type()
                content_disposition = str(part.get("Content-Disposition", ""))
                
                if "attachment" in content_disposition:
                    # Save attachment
                    filename = part.get_filename()
                    if filename:
                        att = self._save_attachment(part, filename, message_id)
                        if att:
                            attachments.append(att)
                elif content_type == "text/plain":
                    try:
                        body_text = part.get_payload(decode=True).decode()
                    except:
                        pass
                elif content_type == "text/html":
                    try:
                        body_html = part.get_payload(decode=True).decode()
                    except:
                        pass
        else:
            try:
                body_text = msg.get_payload(decode=True).decode()
            except:
                pass
        
        # Create Email object
        email_obj = Email(
            message_id=message_id,
            from_address=extract_email_address(from_header),
            from_name=extract_email_name(from_header),
            to_address=to_header,
            cc=cc_header if cc_header else None,
            subject=subject,
            body_text=body_text,
            body_html=body_html,
            sent_at=sent_at,
            folder=folder.lower(),
            is_read=False
        )
        
        email_obj.attachments = attachments
        
        return email_obj
    
    def _decode_header(self, header: str) -> str:
        """Decode email header."""
        if not header:
            return ""
        
        try:
            decoded_parts = decode_header(header)
            result = []
            for content, encoding in decoded_parts:
                if isinstance(content, bytes):
                    content = content.decode(encoding or 'utf-8', errors='replace')
                result.append(content)
            return " ".join(result)
        except:
            return header
    
    def _save_attachment(
        self,
        part,
        filename: str,
        email_id: str
    ) -> Optional[Attachment]:
        """Save attachment to disk."""
        try:
            filename = sanitize_filename(self._decode_header(filename))
            
            # Create unique path
            email_hash = hashlib.md5(email_id.encode()).hexdigest()[:8]
            att_dir = Config.ATTACHMENTS_DIR / email_hash
            att_dir.mkdir(parents=True, exist_ok=True)
            
            file_path = att_dir / filename
            
            # Write file
            payload = part.get_payload(decode=True)
            if payload:
                file_path.write_bytes(payload)
                
                return Attachment(
                    filename=filename,
                    mime_type=part.get_content_type(),
                    size=len(payload),
                    file_path=str(file_path)
                )
        
        except Exception as e:
            logger.error(f"Error saving attachment {filename}: {e}")
        
        return None
    
    def send_email(
        self,
        to: str,
        subject: str,
        body: str,
        html: bool = False,
        attachments: List[Path] = None,
        cc: str = None,
        bcc: str = None
    ) -> bool:
        """
        Verstuur een email.
        
        Args:
            to: Ontvanger email
            subject: Onderwerp
            body: Body text (of HTML als html=True)
            html: True als body HTML is
            attachments: Lijst met attachment paths
            cc: CC addresses
            bcc: BCC addresses
            
        Returns:
            True als versturen succesvol
        """
        try:
            # Create message
            if attachments:
                msg = MIMEMultipart()
                if html:
                    msg.attach(MIMEText(body, "html"))
                else:
                    msg.attach(MIMEText(body, "plain"))
                
                # Add attachments
                for att_path in attachments:
                    if att_path.exists():
                        with open(att_path, "rb") as f:
                            part = MIMEBase("application", "octet-stream")
                            part.set_payload(f.read())
                        encoders.encode_base64(part)
                        part.add_header(
                            "Content-Disposition",
                            f"attachment; filename={att_path.name}"
                        )
                        msg.attach(part)
            else:
                content_type = "html" if html else "plain"
                msg = MIMEText(body, content_type)
            
            # Set headers
            msg["From"] = self.username
            msg["To"] = to
            msg["Subject"] = subject
            
            if cc:
                msg["Cc"] = cc
            
            # Send
            context = ssl.create_default_context()
            
            with smtplib.SMTP(self.host, self.smtp_port) as server:
                server.starttls(context=context)
                server.login(self.username, self.password)
                
                recipients = [to]
                if cc:
                    recipients.extend(cc.split(","))
                if bcc:
                    recipients.extend(bcc.split(","))
                
                server.sendmail(self.username, recipients, msg.as_string())
            
            logger.info(f"Email sent to: {to}")
            
            # Save to sent folder in database
            self._save_sent_email(to, subject, body, html)
            
            return True
            
        except Exception as e:
            logger.error(f"Error sending email: {e}")
            return False
    
    def _save_sent_email(self, to: str, subject: str, body: str, is_html: bool):
        """Save sent email to database."""
        db = get_db()
        with db.session() as session:
            email_obj = Email(
                message_id=f"sent-{datetime.now().timestamp()}-{hashlib.md5(to.encode()).hexdigest()[:8]}",
                from_address=self.username,
                from_name="",
                to_address=to,
                subject=subject,
                body_text=body if not is_html else "",
                body_html=body if is_html else "",
                sent_at=datetime.now(),
                folder="sent",
                is_read=True
            )
            session.add(email_obj)
            session.commit()
    
    def test_connection(self) -> Tuple[bool, str]:
        """
        Test email connection.
        
        Returns:
            (success, message)
        """
        try:
            if self.connect_imap():
                self.disconnect_imap()
                return True, "Verbinding succesvol!"
            return False, "Kon niet verbinden met IMAP server"
        except Exception as e:
            return False, str(e)
