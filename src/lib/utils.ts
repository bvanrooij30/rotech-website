/**
 * Utility functions for the Ro-Tech website
 */

/**
 * Escape HTML to prevent XSS attacks
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Sanitize HTML content by escaping dangerous characters
 * This is a basic sanitization - for production, consider using DOMPurify
 */
export function sanitizeHtml(html: string): string {
  // Remove script tags and their content
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  
  // Remove event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, "");
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, "");
  
  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, "");
  
  // Remove data: URLs that could be dangerous
  sanitized = sanitized.replace(/data:text\/html/gi, "");
  
  return sanitized;
}

/**
 * Convert markdown-like text to safe HTML
 * Basic implementation - for production, use a proper markdown parser
 */
export function markdownToHtml(text: string): string {
  // Escape HTML first
  let html = escapeHtml(text);
  
  // Convert markdown headers
  html = html.replace(/^### (.*$)/gim, "<h3>$1</h3>");
  html = html.replace(/^## (.*$)/gim, "<h2>$1</h2>");
  html = html.replace(/^# (.*$)/gim, "<h1>$1</h1>");
  
  // Convert bold
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  
  // Convert italic
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  
  // Convert links (basic)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  
  // Convert line breaks
  html = html.replace(/\n/g, "<br>");
  
  // Wrap paragraphs
  html = html.split("<br><br>").map(para => {
    if (para.trim()) {
      return `<p>${para}</p>`;
    }
    return para;
  }).join("");
  
  return sanitizeHtml(html);
}
