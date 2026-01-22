import { jsPDF } from "jspdf";
import { getFeatureById, type SelectedFeature, type PackageDefinition } from "@/data/packages";
import { formatPrice } from "@/lib/stripe";

interface QuotePDFData {
  quoteNumber: string;
  date: string;
  package: PackageDefinition;
  selectedFeatures: SelectedFeature[];
  totalAmount: number;
  customerName?: string;
  customerEmail?: string;
}

/**
 * Generate a quote PDF for the customer
 */
export function generateQuotePDF(data: QuotePDFData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Colors
  const primaryColor: [number, number, number] = [79, 70, 229]; // Indigo
  const textColor: [number, number, number] = [30, 41, 59]; // Slate 800
  const lightGray: [number, number, number] = [148, 163, 184]; // Slate 400
  
  let y = 20;
  
  // === HEADER ===
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 45, "F");
  
  // Logo/Company name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("RoTech Development", 20, 25);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Professionele Websites & Web Applicaties", 20, 33);
  
  // Quote badge
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(pageWidth - 70, 10, 55, 25, 3, 3, "F");
  doc.setTextColor(...primaryColor);
  doc.setFontSize(8);
  doc.text("GESCHATTE OFFERTE", pageWidth - 65, 18);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(data.quoteNumber, pageWidth - 65, 28);
  
  y = 60;
  
  // === OFFERTE INFO ===
  doc.setTextColor(...textColor);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Geschatte Offerte", 20, y);
  
  y += 10;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...lightGray);
  doc.text(`Datum: ${data.date}`, 20, y);
  
  if (data.customerName) {
    y += 6;
    doc.text(`Klant: ${data.customerName}`, 20, y);
  }
  
  y += 15;
  
  // === DISCLAIMER BOX ===
  doc.setFillColor(254, 243, 199); // Amber 100
  doc.roundedRect(20, y, pageWidth - 40, 20, 3, 3, "F");
  doc.setDrawColor(251, 191, 36); // Amber 400
  doc.setLineWidth(0.5);
  doc.roundedRect(20, y, pageWidth - 40, 20, 3, 3, "S");
  
  doc.setTextColor(146, 64, 14); // Amber 800
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Let op: Dit is een geschatte offerte", 25, y + 7);
  doc.setFont("helvetica", "normal");
  doc.text("De definitieve prijs kan afwijken na bespreking van uw specifieke wensen.", 25, y + 14);
  
  y += 30;
  
  // === PAKKET INFO ===
  doc.setTextColor(...primaryColor);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Geselecteerd Pakket", 20, y);
  
  y += 8;
  doc.setFillColor(238, 242, 255); // Indigo 50
  doc.roundedRect(20, y, pageWidth - 40, 18, 3, 3, "F");
  
  doc.setTextColor(...textColor);
  doc.setFontSize(11);
  doc.text(data.package.name, 25, y + 7);
  doc.setFontSize(9);
  doc.setTextColor(...lightGray);
  doc.text(data.package.subtitle, 25, y + 13);
  
  y += 28;
  
  // === FUNCTIES TABEL ===
  doc.setTextColor(...primaryColor);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Geselecteerde Functies", 20, y);
  
  y += 8;
  
  // Table header
  doc.setFillColor(241, 245, 249); // Slate 100
  doc.rect(20, y, pageWidth - 40, 8, "F");
  doc.setTextColor(...textColor);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Functie", 25, y + 5.5);
  doc.text("Aantal", 120, y + 5.5);
  doc.text("Prijs", pageWidth - 40, y + 5.5, { align: "right" });
  
  y += 10;
  
  // Table rows
  doc.setFont("helvetica", "normal");
  let subtotal = 0;
  
  for (const sf of data.selectedFeatures) {
    const feature = getFeatureById(sf.featureId);
    if (!feature) continue;
    
    const linePrice = feature.price * sf.quantity;
    subtotal += linePrice;
    
    // Check if we need a new page
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    
    // Alternating row colors
    const rowIndex = data.selectedFeatures.indexOf(sf);
    if (rowIndex % 2 === 0) {
      doc.setFillColor(248, 250, 252); // Slate 50
      doc.rect(20, y - 2, pageWidth - 40, 8, "F");
    }
    
    doc.setTextColor(...textColor);
    doc.setFontSize(9);
    
    // Feature name (truncate if too long)
    const featureName = feature.name.length > 45 
      ? feature.name.substring(0, 42) + "..." 
      : feature.name;
    doc.text(featureName, 25, y + 3);
    
    // Quantity
    const quantityText = sf.quantity > 1 ? `${sf.quantity}x` : "1x";
    doc.text(quantityText, 120, y + 3);
    
    // Price
    const priceText = feature.isIncluded ? "Inbegrepen" : formatPrice(linePrice);
    doc.text(priceText, pageWidth - 40, y + 3, { align: "right" });
    
    y += 8;
  }
  
  y += 5;
  
  // === TOTALEN ===
  doc.setDrawColor(203, 213, 225); // Slate 300
  doc.setLineWidth(0.5);
  doc.line(20, y, pageWidth - 20, y);
  
  y += 8;
  
  // Subtotal
  doc.setFontSize(10);
  doc.setTextColor(...lightGray);
  doc.text("Subtotaal (excl. BTW)", 100, y);
  doc.setTextColor(...textColor);
  doc.setFont("helvetica", "bold");
  doc.text(formatPrice(data.totalAmount), pageWidth - 40, y, { align: "right" });
  
  y += 7;
  
  // BTW
  const btw = data.totalAmount * 0.21;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...lightGray);
  doc.text("BTW (21%)", 100, y);
  doc.setTextColor(...textColor);
  doc.text(formatPrice(btw), pageWidth - 40, y, { align: "right" });
  
  y += 10;
  
  // Total
  doc.setFillColor(...primaryColor);
  doc.roundedRect(95, y - 5, pageWidth - 115, 14, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Totaal (incl. BTW)", 100, y + 4);
  doc.text(formatPrice(data.totalAmount + btw), pageWidth - 40, y + 4, { align: "right" });
  
  y += 25;
  
  // === AANBETALING ===
  doc.setFillColor(236, 253, 245); // Emerald 50
  doc.roundedRect(20, y, pageWidth - 40, 15, 3, 3, "F");
  doc.setTextColor(6, 95, 70); // Emerald 800
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Aanbetaling bij akkoord:", 25, y + 6);
  doc.setFont("helvetica", "bold");
  doc.text(`50% = ${formatPrice((data.totalAmount + btw) * 0.5)}`, 25, y + 12);
  
  // === FOOTER ===
  const footerY = 275;
  
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(20, footerY - 10, pageWidth - 20, footerY - 10);
  
  doc.setTextColor(...lightGray);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("RoTech Development", 20, footerY - 3);
  doc.text("www.ro-techdevelopment.dev", 20, footerY + 2);
  
  doc.text("Dit is een automatisch gegenereerde offerte.", pageWidth / 2, footerY - 3, { align: "center" });
  doc.text("De prijs kan afwijken na bespreking.", pageWidth / 2, footerY + 2, { align: "center" });
  
  doc.text(`Gegenereerd op: ${data.date}`, pageWidth - 20, footerY - 3, { align: "right" });
  doc.text("Geldig: 30 dagen", pageWidth - 20, footerY + 2, { align: "right" });
  
  // Save PDF
  const fileName = `RoTech-Offerte-${data.quoteNumber}.pdf`;
  doc.save(fileName);
}

/**
 * Generate a unique quote number
 */
export function generateQuoteNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${year}-${random}`;
}
