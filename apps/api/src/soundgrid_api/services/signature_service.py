"""
E-Signature Cryptographic Service
Handles RSA key generation, document signing, and signature verification
"""

import hashlib
import base64
from datetime import datetime, timedelta
from typing import Tuple, Optional
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.backends import default_backend
from cryptography.fernet import Fernet
import structlog

from ..database import get_prisma

logger = structlog.get_logger()


class SignatureService:
    """Service for cryptographic signature operations"""
    
    KEY_SIZE = 4096
    KEY_ALGORITHM = "RSA-4096"
    
    def __init__(self, encryption_key: Optional[str] = None):
        """
        Initialize the signature service
        
        Args:
            encryption_key: Key for encrypting private keys at rest
        """
        self.encryption_key = encryption_key
        self._cipher = Fernet(encryption_key.encode()) if encryption_key else None
    
    def generate_key_pair(self) -> Tuple[str, str]:
        """
        Generate a new RSA 4096-bit key pair
        
        Returns:
            Tuple of (public_key_pem, private_key_pem)
        """
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=self.KEY_SIZE,
            backend=default_backend()
        )
        
        # Serialize private key
        private_pem = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption()
        ).decode()
        
        # Serialize public key
        public_key = private_key.public_key()
        public_pem = public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        ).decode()
        
        logger.info("Generated new RSA key pair", key_algorithm=self.KEY_ALGORITHM)
        
        return public_pem, private_pem
    
    def encrypt_private_key(self, private_key_pem: str) -> str:
        """
        Encrypt a private key for secure storage
        
        Args:
            private_key_pem: The private key in PEM format
            
        Returns:
            Base64-encoded encrypted key
        """
        if not self._cipher:
            raise ValueError("Encryption key not configured")
        
        encrypted = self._cipher.encrypt(private_key_pem.encode())
        return base64.b64encode(encrypted).decode()
    
    def decrypt_private_key(self, encrypted_key: str) -> str:
        """
        Decrypt a private key
        
        Args:
            encrypted_key: Base64-encoded encrypted key
            
        Returns:
            The decrypted private key in PEM format
        """
        if not self._cipher:
            raise ValueError("Encryption key not configured")
        
        decrypted = self._cipher.decrypt(base64.b64decode(encrypted_key))
        return decrypted.decode()
    
    def hash_document(self, document: bytes) -> str:
        """
        Generate SHA-256 hash of a document
        
        Args:
            document: Document bytes
            
        Returns:
            Hex-encoded SHA-256 hash
        """
        return hashlib.sha256(document).hexdigest()
    
    def sign_document(self, document: bytes, private_key_pem: str) -> str:
        """
        Sign a document with RSA private key using PSS padding
        
        Args:
            document: Document bytes to sign
            private_key_pem: Private key in PEM format
            
        Returns:
            Base64-encoded signature
        """
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
    
    def verify_signature(
        self, 
        document: bytes, 
        signature_b64: str, 
        public_key_pem: str
    ) -> bool:
        """
        Verify an RSA signature
        
        Args:
            document: Original document bytes
            signature_b64: Base64-encoded signature
            public_key_pem: Public key in PEM format
            
        Returns:
            True if signature is valid, False otherwise
        """
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
        except Exception as e:
            logger.warning("Signature verification failed", error=str(e))
            return False
    
    async def create_signing_key(self, user_id: str) -> dict:
        """
        Create and store a new signing key for a user
        
        Args:
            user_id: The user's ID
            
        Returns:
            The created signing key record
        """
        prisma = await get_prisma()
        
        # Generate key pair
        public_key, private_key = self.generate_key_pair()
        
        # Encrypt private key if encryption is configured
        if self._cipher:
            private_key = self.encrypt_private_key(private_key)
        
        # Store in database
        signing_key = await prisma.signingkey.create(
            data={
                "userId": user_id,
                "publicKey": public_key,
                "privateKey": private_key,
                "keyAlgorithm": self.KEY_ALGORITHM,
                "expiresAt": datetime.utcnow() + timedelta(days=365 * 2)  # 2 years
            }
        )
        
        logger.info("Created signing key for user", user_id=user_id)
        
        return signing_key
    
    async def get_signing_key(self, user_id: str) -> Optional[dict]:
        """
        Get a user's signing key
        
        Args:
            user_id: The user's ID
            
        Returns:
            The signing key record or None
        """
        prisma = await get_prisma()
        
        return await prisma.signingkey.find_unique(
            where={"userId": user_id}
        )
    
    async def revoke_signing_key(self, user_id: str) -> dict:
        """
        Revoke a user's signing key
        
        Args:
            user_id: The user's ID
            
        Returns:
            The updated signing key record
        """
        prisma = await get_prisma()
        
        signing_key = await prisma.signingkey.update(
            where={"userId": user_id},
            data={"revokedAt": datetime.utcnow()}
        )
        
        logger.info("Revoked signing key for user", user_id=user_id)
        
        return signing_key
    
    async def get_private_key(self, user_id: str) -> str:
        """
        Get a user's decrypted private key
        
        Args:
            user_id: The user's ID
            
        Returns:
            The decrypted private key in PEM format
        """
        signing_key = await self.get_signing_key(user_id)
        
        if not signing_key:
            raise ValueError(f"No signing key found for user {user_id}")
        
        if signing_key.get("revokedAt"):
            raise ValueError(f"Signing key for user {user_id} has been revoked")
        
        private_key = signing_key["privateKey"]
        
        # Decrypt if necessary
        if self._cipher:
            private_key = self.decrypt_private_key(private_key)
        
        return private_key
    
    async def get_public_key(self, user_id: str) -> str:
        """
        Get a user's public key
        
        Args:
            user_id: The user's ID
            
        Returns:
            The public key in PEM format
        """
        signing_key = await self.get_signing_key(user_id)
        
        if not signing_key:
            raise ValueError(f"No signing key found for user {user_id}")
        
        return signing_key["publicKey"]


# Global service instance
_signature_service: Optional[SignatureService] = None


def get_signature_service(encryption_key: Optional[str] = None) -> SignatureService:
    """Get or create the global signature service instance"""
    global _signature_service
    
    if _signature_service is None:
        _signature_service = SignatureService(encryption_key)
    
    return _signature_service
