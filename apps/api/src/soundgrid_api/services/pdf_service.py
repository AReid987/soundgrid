"""
PDF Service for contract generation and signature embedding
"""

import io
from datetime import datetime
from typing import List, Optional
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.platypus import Paragraph, Spacer
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import structlog
import httpx

logger = structlog.get_logger()


class PDFService:
    """Service for PDF generation and manipulation"""
    
    def __init__(self):
        self.page_width, self.page_height = letter
        self.styles = getSampleStyleSheet()
        
        # Custom styles
        self.styles.add(ParagraphStyle(
            name='ContractTitle',
            fontSize=18,
            alignment=TA_CENTER,
            spaceAfter=30,
            fontName='Helvetica-Bold'
        ))
        
        self.styles.add(ParagraphStyle(
            name='ContractHeading',
            fontSize=14,
            spaceAfter=12,
            fontName='Helvetica-Bold'
        ))
        
        self.styles.add(ParagraphStyle(
            name='ContractBody',
            fontSize=11,
            alignment=TA_LEFT,
            spaceAfter=12,
            fontName='Helvetica'
        ))
        
        self.styles.add(ParagraphStyle(
            name='SignatureBlock',
            fontSize=10,
            alignment=TA_LEFT,
            spaceAfter=6,
            fontName='Helvetica'
        ))
    
    def generate_contract_pdf(
        self,
        title: str,
        content: str,
        parties: List[dict],
        signatures: Optional[List[dict]] = None
    ) -> bytes:
        """
        Generate a contract PDF with signatures
        
        Args:
            title: Contract title
            content: Contract content (HTML or plain text)
            parties: List of party information
            signatures: Optional list of signature data
            
        Returns:
            PDF bytes
        """
        buffer = io.BytesIO()
        c = canvas.Canvas(buffer, pagesize=letter)
        
        # Header
        c.setFont("Helvetica-Bold", 18)
        c.drawCentredString(self.page_width / 2, self.page_height - 1 * inch, title)
        
        # Contract content
        y_position = self.page_height - 1.5 * inch
        c.setFont("Helvetica", 11)
        
        # Simple text wrapping (for plain text content)
        lines = content.split('\n')
        for line in lines:
            if y_position < 2 * inch:  # New page if running out of space
                c.showPage()
                y_position = self.page_height - 1 * inch
                c.setFont("Helvetica", 11)
            
            c.drawString(1 * inch, y_position, line[:100])  # Limit line length
            y_position -= 14
        
        # Signature page
        c.showPage()
        c.setFont("Helvetica-Bold", 14)
        c.drawString(1 * inch, self.page_height - 1 * inch, "SIGNATURES")
        
        y_position = self.page_height - 1.5 * inch
        
        for i, party in enumerate(parties):
            if y_position < 3 * inch:
                c.showPage()
                y_position = self.page_height - 1 * inch
            
            # Party info
            c.setFont("Helvetica-Bold", 11)
            c.drawString(1 * inch, y_position, f"Party {i + 1}: {party.get('name', 'Unknown')}")
            y_position -= 20
            
            c.setFont("Helvetica", 10)
            c.drawString(1 * inch, y_position, f"Role: {party.get('role', 'Unknown')}")
            y_position -= 16
            c.drawString(1 * inch, y_position, f"Email: {party.get('email', 'N/A')}")
            y_position -= 30
            
            # Signature area
            sig_data = None
            if signatures:
                sig_data = next(
                    (s for s in signatures if s.get('party_id') == party.get('id')),
                    None
                )
            
            if sig_data and sig_data.get('signature_image_url'):
                # Draw signature image
                try:
                    # Download signature image
                    response = httpx.get(sig_data['signature_image_url'])
                    if response.status_code == 200:
                        img_buffer = io.BytesIO(response.content)
                        c.drawImage(img_buffer, 1 * inch, y_position - 60, width=200, height=60)
                        y_position -= 70
                except Exception as e:
                    logger.error("Failed to load signature image", error=str(e))
                    c.drawString(1 * inch, y_position, "[Signature Image]")
                    y_position -= 20
                
                # Signature details
                signed_at = sig_data.get('signed_at')
                if signed_at:
                    c.setFont("Helvetica", 9)
                    c.drawString(1 * inch, y_position, f"Signed: {signed_at}")
                    y_position -= 14
                
                c.drawString(1 * inch, y_position, f"IP: {sig_data.get('ip_address', 'N/A')}")
                y_position -= 30
            else:
                # Empty signature box
                c.rect(1 * inch, y_position - 60, 200, 60, stroke=1, fill=0)
                c.setFont("Helvetica-Oblique", 10)
                c.drawString(1.2 * inch, y_position - 30, "Sign here")
                y_position -= 80
            
            y_position -= 20
        
        c.save()
        return buffer.getvalue()
    
    def generate_signature_page(
        self,
        signatures: List[dict],
        audit_trail: List[dict]
    ) -> bytes:
        """
        Generate a signature verification page with audit trail
        
        Args:
            signatures: List of signature records
            audit_trail: List of audit events
            
        Returns:
            PDF bytes
        """
        buffer = io.BytesIO()
        c = canvas.Canvas(buffer, pagesize=letter)
        
        # Title
        c.setFont("Helvetica-Bold", 16)
        c.drawCentredString(self.page_width / 2, self.page_height - 1 * inch, 
                          "SIGNATURE VERIFICATION & AUDIT TRAIL")
        
        # Document hash
        c.setFont("Helvetica-Bold", 12)
        c.drawString(1 * inch, self.page_height - 1.5 * inch, "Document Hash:")
        c.setFont("Courier", 9)
        # Placeholder for document hash
        c.drawString(1 * inch, self.page_height - 1.7 * inch, 
                    signatures[0].get('signature_hash', 'N/A') if signatures else 'N/A')
        
        # Signatures section
        y_position = self.page_height - 2.2 * inch
        c.setFont("Helvetica-Bold", 14)
        c.drawString(1 * inch, y_position, "SIGNATURES")
        y_position -= 0.3 * inch
        
        for sig in signatures:
            if y_position < 3 * inch:
                c.showPage()
                y_position = self.page_height - 1 * inch
            
            party = sig.get('party', {})
            
            # Party name
            c.setFont("Helvetica-Bold", 11)
            c.drawString(1 * inch, y_position, party.get('name', 'Unknown'))
            y_position -= 0.2 * inch
            
            # Signature details
            c.setFont("Helvetica", 9)
            c.drawString(1 * inch, y_position, f"Role: {party.get('role', 'N/A')}")
            y_position -= 0.15 * inch
            c.drawString(1 * inch, y_position, f"Email: {party.get('email', 'N/A')}")
            y_position -= 0.15 * inch
            c.drawString(1 * inch, y_position, 
                        f"Signed: {sig.get('signed_at', 'N/A')}")
            y_position -= 0.15 * inch
            c.drawString(1 * inch, y_position, 
                        f"IP Address: {sig.get('ip_address', 'N/A')}")
            y_position -= 0.15 * inch
            c.drawString(1 * inch, y_position, 
                        f"Valid: {'Yes' if sig.get('is_valid') else 'No'}")
            y_position -= 0.3 * inch
            
            # Signature hash
            c.setFont("Courier", 8)
            c.drawString(1 * inch, y_position, "Signature Hash:")
            y_position -= 0.12 * inch
            c.drawString(1 * inch, y_position, 
                        sig.get('signed_data', 'N/A')[:80] + "...")
            y_position -= 0.3 * inch
        
        # Audit trail section
        c.showPage()
        y_position = self.page_height - 1 * inch
        c.setFont("Helvetica-Bold", 14)
        c.drawString(1 * inch, y_position, "AUDIT TRAIL")
        y_position -= 0.3 * inch
        
        c.setFont("Helvetica-Bold", 9)
        c.drawString(1 * inch, y_position, "Timestamp")
        c.drawString(3 * inch, y_position, "Event")
        c.drawString(5 * inch, y_position, "Actor")
        y_position -= 0.15 * inch
        
        c.line(1 * inch, y_position, 7.5 * inch, y_position)
        y_position -= 0.15 * inch
        
        for event in audit_trail:
            if y_position < 1 * inch:
                c.showPage()
                y_position = self.page_height - 1 * inch
            
            c.setFont("Helvetica", 8)
            
            timestamp = event.get('created_at', 'N/A')
            if isinstance(timestamp, datetime):
                timestamp = timestamp.strftime('%Y-%m-%d %H:%M:%S UTC')
            
            c.drawString(1 * inch, y_position, str(timestamp)[:20])
            c.drawString(3 * inch, y_position, event.get('event_type', 'N/A')[:30])
            
            actor = event.get('actor', {})
            actor_name = actor.get('email', 'System') if actor else 'System'
            c.drawString(5 * inch, y_position, actor_name[:25])
            
            y_position -= 0.15 * inch
        
        c.save()
        return buffer.getvalue()
    
    def add_signature_to_existing_pdf(
        self,
        pdf_content: bytes,
        signature_data: dict,
        x: float = 100,
        y: float = 100
    ) -> bytes:
        """
        Add a signature to an existing PDF
        
        Args:
            pdf_content: Original PDF bytes
            signature_data: Signature information
            x: X position
            y: Y position
            
        Returns:
            Modified PDF bytes
        """
        # This would use pypdf or similar to modify existing PDFs
        # For now, we'll just return the original
        # Full implementation would merge the signature page
        logger.info("Adding signature to PDF", x=x, y=y)
        return pdf_content


# Global service instance
_pdf_service: Optional[PDFService] = None


def get_pdf_service() -> PDFService:
    """Get or create the global PDF service instance"""
    global _pdf_service
    
    if _pdf_service is None:
        _pdf_service = PDFService()
    
    return _pdf_service
