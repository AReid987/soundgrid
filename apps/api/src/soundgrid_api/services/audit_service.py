"""
Audit Service for contract and signature events
"""

from datetime import datetime
from typing import Optional, Any
import structlog

from ..database import get_prisma

logger = structlog.get_logger()


class AuditService:
    """Service for logging and retrieving audit events"""
    
    # Event types
    CONTRACT_CREATED = "contract_created"
    CONTRACT_UPDATED = "contract_updated"
    CONTRACT_DELETED = "contract_deleted"
    PARTY_ADDED = "party_added"
    PARTY_REMOVED = "party_removed"
    PARTY_UPDATED = "party_updated"
    SIGNATURE_REQUESTED = "signature_requested"
    SIGNATURE_VIEWED = "signature_viewed"
    SIGNED = "signed"
    SIGNATURE_VERIFIED = "signature_verified"
    CONTRACT_COMPLETED = "contract_completed"
    CONTRACT_CANCELLED = "contract_cancelled"
    CONTRACT_EXPIRED = "contract_expired"
    
    async def log_event(
        self,
        contract_id: str,
        event_type: str,
        actor_id: Optional[str] = None,
        details: Optional[dict] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> dict:
        """
        Log an audit event
        
        Args:
            contract_id: The contract ID
            event_type: Type of event
            actor_id: User who performed the action
            details: Additional event details
            ip_address: Client IP address
            user_agent: Client user agent
            
        Returns:
            The created audit event
        """
        prisma = await get_prisma()
        
        event = await prisma.auditevent.create(
            data={
                "contractId": contract_id,
                "eventType": event_type,
                "actorId": actor_id,
                "details": details or {},
                "ipAddress": ip_address,
                "userAgent": user_agent
            }
        )
        
        logger.info(
            "Audit event logged",
            contract_id=contract_id,
            event_type=event_type,
            actor_id=actor_id
        )
        
        return event
    
    async def get_contract_audit_trail(
        self,
        contract_id: str,
        limit: int = 100
    ) -> list:
        """
        Get the audit trail for a contract
        
        Args:
            contract_id: The contract ID
            limit: Maximum number of events
            
        Returns:
            List of audit events
        """
        prisma = await get_prisma()
        
        events = await prisma.auditevent.find_many(
            where={"contractId": contract_id},
            order_by={"createdAt": "desc"},
            take=limit,
            include={
                "actor": {
                    "select": {
                        "id": True,
                        "email": True
                    }
                }
            }
        )
        
        return events
    
    async def log_contract_created(
        self,
        contract_id: str,
        actor_id: str,
        contract_type: str,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> dict:
        """Log contract creation"""
        return await self.log_event(
            contract_id=contract_id,
            event_type=self.CONTRACT_CREATED,
            actor_id=actor_id,
            details={"contract_type": contract_type},
            ip_address=ip_address,
            user_agent=user_agent
        )
    
    async def log_party_added(
        self,
        contract_id: str,
        actor_id: str,
        party_id: str,
        party_name: str,
        party_email: str,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> dict:
        """Log party addition"""
        return await self.log_event(
            contract_id=contract_id,
            event_type=self.PARTY_ADDED,
            actor_id=actor_id,
            details={
                "party_id": party_id,
                "party_name": party_name,
                "party_email": party_email
            },
            ip_address=ip_address,
            user_agent=user_agent
        )
    
    async def log_signature_requested(
        self,
        contract_id: str,
        party_id: str,
        party_email: str,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> dict:
        """Log signature request sent"""
        return await self.log_event(
            contract_id=contract_id,
            event_type=self.SIGNATURE_REQUESTED,
            details={
                "party_id": party_id,
                "party_email": party_email
            },
            ip_address=ip_address,
            user_agent=user_agent
        )
    
    async def log_signed(
        self,
        contract_id: str,
        signer_id: str,
        party_id: str,
        signature_hash: str,
        ip_address: str,
        user_agent: str
    ) -> dict:
        """Log document signing"""
        return await self.log_event(
            contract_id=contract_id,
            event_type=self.SIGNED,
            actor_id=signer_id,
            details={
                "party_id": party_id,
                "signature_hash": signature_hash,
                "timestamp": datetime.utcnow().isoformat()
            },
            ip_address=ip_address,
            user_agent=user_agent
        )
    
    async def log_contract_completed(
        self,
        contract_id: str,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> dict:
        """Log contract completion (all parties signed)"""
        return await self.log_event(
            contract_id=contract_id,
            event_type=self.CONTRACT_COMPLETED,
            details={"completed_at": datetime.utcnow().isoformat()},
            ip_address=ip_address,
            user_agent=user_agent
        )
    
    async def get_signing_statistics(
        self,
        contract_id: str
    ) -> dict:
        """
        Get signing statistics for a contract
        
        Args:
            contract_id: The contract ID
            
        Returns:
            Statistics dictionary
        """
        prisma = await get_prisma()
        
        # Count signatures
        signature_count = await prisma.signature.count(
            where={"contractId": contract_id}
        )
        
        # Get last signature
        last_signature = await prisma.signature.find_first(
            where={"contractId": contract_id},
            order_by={"signedAt": "desc"}
        )
        
        # Get all audit events
        events = await prisma.auditevent.find_many(
            where={"contractId": contract_id}
        )
        
        return {
            "signature_count": signature_count,
            "last_signed_at": last_signature.signedAt if last_signature else None,
            "total_events": len(events),
            "event_breakdown": {
                event.eventType: sum(1 for e in events if e.eventType == event.eventType)
                for event in set(events)
            }
        }


# Global service instance
_audit_service: Optional[AuditService] = None


def get_audit_service() -> AuditService:
    """Get or create the global audit service instance"""
    global _audit_service
    
    if _audit_service is None:
        _audit_service = AuditService()
    
    return _audit_service
