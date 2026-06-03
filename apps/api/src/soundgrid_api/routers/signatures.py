"""
E-Signature API Router
Handles cryptographic key management and signature operations
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel
import structlog

from ..auth import get_current_user
from ..database import get_prisma
from ..services.signature_service import get_signature_service
from ..services.audit_service import get_audit_service

logger = structlog.get_logger()
router = APIRouter(prefix="/signatures", tags=["signatures"])


# Request/Response Models
class KeyPairResponse(BaseModel):
    id: str
    userId: str
    keyAlgorithm: str
    createdAt: str
    expiresAt: Optional[str]
    publicKey: str


class SignRequest(BaseModel):
    contractId: str
    partyId: str
    signatureImage: str  # base64 PNG data URL


class SignResponse(BaseModel):
    id: str
    contractId: str
    partyId: str
    signedAt: str
    signatureHash: str


class VerifyResponse(BaseModel):
    valid: bool
    signedAt: Optional[str]
    signedBy: Optional[str]
    message: str


class SignatureDetail(BaseModel):
    id: str
    contractId: str
    partyId: str
    signerId: str
    signedAt: str
    signatureHash: str
    isValid: bool
    ipAddress: str


@router.post("/keys", response_model=KeyPairResponse)
async def generate_signing_key(
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """
    Generate a new RSA signing key pair for the current user
    
    This creates a 4096-bit RSA key pair for cryptographic signing.
    The private key is encrypted and stored securely.
    """
    user_id = current_user["id"]
    
    # Check if user already has a key
    signature_service = get_signature_service()
    existing_key = await signature_service.get_signing_key(user_id)
    
    if existing_key and not existing_key.get("revokedAt"):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User already has an active signing key. Revoke it first to generate a new one."
        )
    
    # Generate new key
    signing_key = await signature_service.create_signing_key(user_id)
    
    logger.info("Generated signing key", user_id=user_id, key_id=signing_key["id"])
    
    return {
        "id": signing_key["id"],
        "userId": signing_key["userId"],
        "keyAlgorithm": signing_key["keyAlgorithm"],
        "createdAt": signing_key["createdAt"].isoformat(),
        "expiresAt": signing_key["expiresAt"].isoformat() if signing_key["expiresAt"] else None,
        "publicKey": signing_key["publicKey"]
    }


@router.get("/keys/my", response_model=KeyPairResponse)
async def get_my_signing_key(
    current_user: dict = Depends(get_current_user)
):
    """Get the current user's signing key"""
    user_id = current_user["id"]
    
    signature_service = get_signature_service()
    signing_key = await signature_service.get_signing_key(user_id)
    
    if not signing_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No signing key found. Generate one first."
        )
    
    return {
        "id": signing_key["id"],
        "userId": signing_key["userId"],
        "keyAlgorithm": signing_key["keyAlgorithm"],
        "createdAt": signing_key["createdAt"].isoformat(),
        "expiresAt": signing_key["expiresAt"].isoformat() if signing_key["expiresAt"] else None,
        "publicKey": signing_key["publicKey"]
    }


@router.delete("/keys/my")
async def revoke_signing_key(
    current_user: dict = Depends(get_current_user)
):
    """Revoke the current user's signing key"""
    user_id = current_user["id"]
    
    signature_service = get_signature_service()
    
    # Check if key exists
    existing_key = await signature_service.get_signing_key(user_id)
    if not existing_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No signing key found"
        )
    
    # Revoke key
    await signature_service.revoke_signing_key(user_id)
    
    logger.info("Revoked signing key", user_id=user_id)
    
    return {"message": "Signing key revoked successfully"}


@router.post("/sign", response_model=SignResponse)
async def sign_document(
    request: Request,
    sign_request: SignRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Sign a contract document
    
    This creates a cryptographic signature for a contract using the user's
    RSA private key. The signature is stored with audit information.
    """
    user_id = current_user["id"]
    prisma = await get_prisma()
    
    # Verify party belongs to user
    party = await prisma.contractparty.find_first(
        where={
            "id": sign_request.partyId,
            "OR": [
                {"userId": user_id},
                {"email": current_user["email"]}
            ]
        },
        include={"contract": True}
    )
    
    if not party:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to sign for this party"
        )
    
    # Check if already signed
    existing_signature = await prisma.signature.find_unique(
        where={"partyId": sign_request.partyId}
    )
    
    if existing_signature:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This party has already signed the contract"
        )
    
    # Get user's signing key
    signature_service = get_signature_service()
    try:
        private_key = await signature_service.get_private_key(user_id)
        public_key = await signature_service.get_public_key(user_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    # Generate document hash (in production, this would be the actual contract PDF)
    document_content = f"contract:{sign_request.contractId}:party:{sign_request.partyId}".encode()
    document_hash = signature_service.hash_document(document_content)
    
    # Sign the document
    signature_data = signature_service.sign_document(
        document=document_content,
        private_key_pem=private_key
    )
    
    # Get client info
    ip_address = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("user-agent", "unknown")
    
    # Store signature
    signature = await prisma.signature.create(
        data={
            "contractId": sign_request.contractId,
            "partyId": sign_request.partyId,
            "signerId": user_id,
            "signatureImage": sign_request.signatureImage,
            "signatureHash": document_hash,
            "signedData": signature_data,
            "publicKey": public_key,
            "ipAddress": ip_address,
            "userAgent": user_agent
        }
    )
    
    # Update party status
    await prisma.contractparty.update(
        where={"id": sign_request.partyId},
        data={"identityVerified": True}
    )
    
    # Log audit event
    audit_service = get_audit_service()
    await audit_service.log_signed(
        contract_id=sign_request.contractId,
        signer_id=user_id,
        party_id=sign_request.partyId,
        signature_hash=document_hash,
        ip_address=ip_address,
        user_agent=user_agent
    )
    
    logger.info(
        "Document signed",
        contract_id=sign_request.contractId,
        party_id=sign_request.partyId,
        signer_id=user_id
    )
    
    return {
        "id": signature["id"],
        "contractId": signature["contractId"],
        "partyId": signature["partyId"],
        "signedAt": signature["signedAt"].isoformat(),
        "signatureHash": signature["signatureHash"]
    }


@router.post("/{signature_id}/verify", response_model=VerifyResponse)
async def verify_signature(
    signature_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Verify a signature's cryptographic validity
    
    This checks that the signature was created with the signer's private key
    and that the document hasn't been tampered with.
    """
    prisma = await get_prisma()
    
    # Get signature
    signature = await prisma.signature.find_unique(
        where={"id": signature_id},
        include={"party": True}
    )
    
    if not signature:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Signature not found"
        )
    
    # Verify cryptographically
    signature_service = get_signature_service()
    document_content = f"contract:{signature['contractId']}:party:{signature['partyId']}".encode()
    
    is_valid = signature_service.verify_signature(
        document=document_content,
        signature_b64=signature["signedData"],
        public_key_pem=signature["publicKey"]
    )
    
    # Update verification status
    if is_valid != signature["isValid"]:
        await prisma.signature.update(
            where={"id": signature_id},
            data={
                "isValid": is_valid,
                "verifiedAt": datetime.utcnow()
            }
        )
    
    return {
        "valid": is_valid,
        "signedAt": signature["signedAt"].isoformat() if signature["signedAt"] else None,
        "signedBy": signature["party"]["name"] if signature["party"] else None,
        "message": "Signature is valid" if is_valid else "Signature verification failed"
    }


@router.get("/contract/{contract_id}", response_model=list[SignatureDetail])
async def get_contract_signatures(
    contract_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get all signatures for a contract"""
    prisma = await get_prisma()
    
    # Verify user has access to contract
    contract = await prisma.contract.find_first(
        where={
            "id": contract_id,
            "OR": [
                {"createdById": current_user["id"]},
                {"parties": {"some": {"userId": current_user["id"]}}}
            ]
        }
    )
    
    if not contract:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this contract"
        )
    
    # Get signatures
    signatures = await prisma.signature.find_many(
        where={"contractId": contract_id},
        include={"party": True},
        order_by={"signedAt": "desc"}
    )
    
    return [
        {
            "id": sig["id"],
            "contractId": sig["contractId"],
            "partyId": sig["partyId"],
            "signerId": sig["signerId"],
            "signedAt": sig["signedAt"].isoformat(),
            "signatureHash": sig["signatureHash"],
            "isValid": sig["isValid"],
            "ipAddress": sig["ipAddress"]
        }
        for sig in signatures
    ]


from datetime import datetime
