# Plan 02-02: Custom E-Signature System

**Wave**: 2  
**Status**: 🚧 IN PROGRESS  
**Duration**: 8-10 hours  
**Backlog Mapping**: E4-5 (Booking contracts), E3-5 (License agreements)

---

## Objective
Build custom ESIGN Act-compliant e-signature system to replace DocuSign. Features RSA cryptographic signatures, PDF generation with embedded signatures, audit trails, and tamper-evident documents.

---

## Requirements

### Functional Requirements
- [ ] RSA key pair generation per user
- [ ] Canvas-based signature capture (SignaturePad)
- [ ] PDF generation with signature fields (ReportLab)
- [ ] Cryptographic signing with SHA-256 + RSA
- [ ] Signature verification endpoint
- [ ] Complete audit trail (who, what, when, IP, user agent)
- [ ] Tamper-evident PDFs with document hash
- [ ] Identity verification via Stripe Identity before signing

### Legal Compliance (ESIGN Act)
- [ ] Intent to sign captured
- [ ] Consent to electronic records
- [ ] Association of signature with record
- [ ] Attribution to signatory
- [ ] Retention of records

---

## Technical Architecture

### Backend (FastAPI)

#### New Services
```python
# apps/api/src/soundgrid_api/services/
signature_service.py      # RSA key management, signing logic
pdf_service.py            # PDF generation and manipulation
audit_service.py          # Audit trail logging
```

#### API Endpoints
```python
# Signature endpoints
POST   /api/v1/signatures/keys              # Generate RSA key pair
GET    /api/v1/signatures/keys/:userId      # Get public key
DELETE /api/v1/signatures/keys/:userId      # Revoke keys

POST   /api/v1/signatures/request           # Request signature
POST   /api/v1/signatures/sign              # Submit signature
GET    /api/v1/signatures/:id               # Get signature details
POST   /api/v1/signatures/:id/verify        # Verify signature
GET    /api/v1/signatures/contract/:id      # List contract signatures

# Audit endpoints
GET    /api/v1/audit/contract/:id           # Get contract audit trail
```

### Database Schema

```prisma
// RSA Keys for signing
model SigningKey {
  id          String   @id @default(cuid())
  userId      String   @unique
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // RSA Key pair (PEM format)
  publicKey   String   // RSA public key
  privateKey  String   // Encrypted private key
  
  // Key metadata
  keyAlgorithm String  @default("RSA-4096")
  createdAt   DateTime @default(now())
  expiresAt   DateTime?
  revokedAt   DateTime?
  
  @@index([userId])
}

// Signature records
model Signature {
  id              String   @id @default(cuid())
  
  // Contract reference
  contractId      String
  contract        Contract @relation(fields: [contractId], references: [id], onDelete: Cascade)
  
  // Signer
  partyId         String
  party           ContractParty @relation(fields: [partyId], references: [id], onDelete: Cascade)
  signerId        String
  signer          User     @relation(fields: [signerId], references: [id])
  
  // Signature data
  signatureImage  String   // S3 URL to signature image (PNG)
  signatureHash   String   // SHA-256 hash of document
  signedData      String   // Base64 RSA signature
  publicKey       String   // Public key used (at time of signing)
  
  // Audit data
  signedAt        DateTime @default(now())
  ipAddress       String
  userAgent       String
  
  // Verification
  verifiedAt      DateTime?
  isValid         Boolean  @default(true)
  
  @@unique([contractId, partyId])
  @@index([contractId])
  @@index([signerId])
  @@index([signedAt])
}

// Audit trail
model AuditEvent {
  id          String   @id @default(cuid())
  
  contractId  String
  contract    Contract @relation(fields: [contractId], references: [id], onDelete: Cascade)
  
  eventType   String   // contract_created, party_added, signature_requested, signed, etc.
  actorId     String?  // User who performed action
  
  details     Json     // Event-specific data
  
  ipAddress   String?
  userAgent   String?
  
  createdAt   DateTime @default(now())
  
  @@index([contractId])
  @@index([eventType])
  @@index([createdAt])
}

// Add to Contract model
model Contract {
  // ... existing fields ...
  
  // Signing
  signatures    Signature[]
  auditEvents   AuditEvent[]
  
  // Final document
  finalPdfUrl   String?
  documentHash  String?   // SHA-256 of final PDF
  
  // Status tracking
  signedAt      DateTime?
  expiresAt     DateTime?
}
```

### Cryptographic Implementation

```python
# apps/api/src/soundgrid_api/services/signature_service.py

from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.backends import default_backend
import hashlib
import base64

class SignatureService:
    def generate_key_pair(self) -> tuple[str, str]:
        """Generate RSA 4096-bit key pair"""
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=4096,
            backend=default_backend()
        )
        
        private_pem = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption()
        )
        
        public_key = private_key.public_key()
        public_pem = public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        )
        
        return public_pem.decode(), private_pem.decode()
    
    def sign_document(self, document: bytes, private_key_pem: str) -> str:
        """Sign document with RSA private key"""
        private_key = serialization.load_pem_private_key(
            private_key_pem.encode(),
            password=None,
            backend=default_backend()
        )
        
        signature = private_key.sign(
            document,
            padding.PSS(
                mgf=padding.MGF1(hashes.SHA256()),
                salt_length=padding.PSS.MAX_LENGTH
            ),
            hashes.SHA256()
        )
        
        return base64.b64encode(signature).decode()
    
    def verify_signature(self, document: bytes, signature_b64: str, public_key_pem: str) -> bool:
        """Verify RSA signature"""
        public_key = serialization.load_pem_public_key(
            public_key_pem.encode(),
            backend=default_backend()
        )
        
        signature = base64.b64decode(signature_b64)
        
        try:
            public_key.verify(
                signature,
                document,
                padding.PSS(
                    mgf=padding.MGF1(hashes.SHA256()),
                    salt_length=padding.PSS.MAX_LENGTH
                ),
                hashes.SHA256()
            )
            return True
        except:
            return False
    
    def hash_document(self, document: bytes) -> str:
        """Generate SHA-256 hash of document"""
        return hashlib.sha256(document).hexdigest()
```

### PDF Service

```python
# apps/api/src/soundgrid_api/services/pdf_service.py

from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.utils import ImageReader
from io import BytesIO

class PDFService:
    def add_signature_to_pdf(
        self, 
        pdf_content: bytes, 
        signature_image: bytes,
        signer_name: str,
        signed_at: datetime,
        x: float = 100,
        y: float = 100
    ) -> bytes:
        """Add visual signature to PDF"""
        # Implementation using reportlab and pypdf
        pass
    
    def generate_signature_page(
        self,
        signatures: list[Signature],
        audit_trail: list[AuditEvent]
    ) -> bytes:
        """Generate audit trail page"""
        buffer = BytesIO()
        c = canvas.Canvas(buffer, pagesize=letter)
        
        # Add signatures section
        c.drawString(100, 750, "SIGNATURES")
        y = 720
        for sig in signatures:
            c.drawString(100, y, f"Signer: {sig.party.name}")
            c.drawString(100, y-20, f"Date: {sig.signed_at.isoformat()}")
            # Add signature image
            if sig.signature_image:
                img = ImageReader(sig.signature_image)
                c.drawImage(img, 100, y-80, width=200, height=60)
            y -= 120
        
        # Add audit trail section
        c.showPage()
        c.drawString(100, 750, "AUDIT TRAIL")
        y = 720
        for event in audit_trail:
            c.drawString(100, y, f"{event.event_type} - {event.created_at.isoformat()}")
            y -= 20
        
        c.save()
        return buffer.getvalue()
```

---

## Frontend Components

### SignaturePad Component
```typescript
// apps/web/app/components/SignaturePad.tsx
'use client';

import { useRef, useEffect, useState } from 'react';

interface SignaturePadProps {
  onChange: (signatureData: string) => void;
  width?: number;
  height?: number;
}

export function SignaturePad({ onChange, width = 600, height = 200 }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set up canvas
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);
  
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const { x, y } = getCoordinates(e, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };
  
  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const { x, y } = getCoordinates(e, canvas);
    ctx.lineTo(x, y);
    ctx.stroke();
  };
  
  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      onChange(canvas.toDataURL('image/png'));
    }
  };
  
  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onChange('');
  };
  
  return (
    <div className="signature-pad">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        className="border border-gray-300 rounded cursor-crosshair touch-none"
      />
      <button onClick={clear} className="mt-2 text-sm text-red-600">
        Clear
      </button>
    </div>
  );
}
```

### Signing Ceremony Page
```typescript
// apps/web/app/(dashboard)/contracts/[id]/sign/page.tsx

interface SigningPageProps {
  params: { id: string };
}

export default async function SigningPage({ params }: SigningPageProps) {
  const contract = await getContract(params.id);
  const user = await getCurrentUser();
  
  // Check if user is a party to this contract
  const party = contract.parties.find(p => p.userId === user.id);
  if (!party) {
    redirect('/dashboard');
  }
  
  // Check if already signed
  if (party.signedAt) {
    redirect(`/contracts/${params.id}`);
  }
  
  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Sign Contract</h1>
      
      {/* Document Preview */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">{contract.title}</h2>
        <PDFViewer url={contract.pdfUrl} />
      </div>
      
      {/* Signature Pad */}
      <SigningForm contractId={contract.id} partyId={party.id} />
    </div>
  );
}
```

---

## Implementation Tasks

### Backend Tasks
- [ ] Create `signature_service.py` with RSA crypto
- [ ] Create `pdf_service.py` for PDF manipulation
- [ ] Create `audit_service.py` for audit logging
- [ ] Add signature endpoints to FastAPI
- [ ] Database migration for signatures and audit tables
- [ ] S3 integration for signature image storage
- [ ] Unit tests for crypto functions
- [ ] Integration tests for signing flow

### Frontend Tasks
- [ ] Create `SignaturePad` component
- [ ] Create signing ceremony page
- [ ] Create signature request email template
- [ ] Add contract status indicators
- [ ] Create audit trail viewer
- [ ] E2E tests for signing flow

### Legal/Compliance
- [ ] ESIGN Act compliance review
- [ ] Terms of service update
- [ ] Privacy policy update

---

## File Structure
```
apps/api/src/soundgrid_api/
├── services/
│   ├── signature_service.py
│   ├── pdf_service.py
│   └── audit_service.py
├── routers/
│   └── signatures.py
└── models/
    └── signature.py

apps/web/app/
├── components/
│   ├── SignaturePad.tsx
│   ├── PDFViewer.tsx
│   └── AuditTrail.tsx
├── (dashboard)/contracts/
│   └── [id]/
│       ├── sign/
│       │   └── page.tsx
│       └── page.tsx
```

---

## Dependencies
- cryptography (Python)
- reportlab (Python)
- pypdf (Python)
- SignaturePad or custom canvas implementation (React)

---

## Success Criteria
- [ ] User can generate RSA key pair
- [ ] User can sign contract with canvas-drawn signature
- [ ] Signature is cryptographically verifiable
- [ ] Audit trail captures all events
- [ ] PDF includes signature image and audit trail
- [ ] ESIGN Act compliance documented

---

## Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| Key security | High | Encrypt private keys at rest, secure key generation |
| Legal validity | High | Consult legal counsel, implement ESIGN requirements |
| Browser compatibility | Medium | Test on all major browsers, touch devices |
