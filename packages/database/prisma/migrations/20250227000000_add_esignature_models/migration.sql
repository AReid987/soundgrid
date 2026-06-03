-- Add e-signature models for custom signing system
-- Wave 2: Custom E-Signature System

-- Create ContractParty table (flexible multi-party support)
CREATE TABLE "contract_parties" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "userId" TEXT,
    "personaId" TEXT,
    "identityVerified" BOOLEAN NOT NULL DEFAULT false,
    "signingOrder" INTEGER NOT NULL DEFAULT 0,
    
    CONSTRAINT "contract_parties_pkey" PRIMARY KEY ("id")
);

-- Create SigningKey table (RSA key pairs)
CREATE TABLE "signing_keys" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "publicKey" TEXT NOT NULL,
    "privateKey" TEXT NOT NULL,
    "keyAlgorithm" TEXT NOT NULL DEFAULT 'RSA-4096',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    
    CONSTRAINT "signing_keys_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "signing_keys_userId_key" UNIQUE ("userId")
);

-- Create Signature table (signature records)
CREATE TABLE "signatures" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "partyId" TEXT NOT NULL,
    "signerId" TEXT NOT NULL,
    "signatureImage" TEXT NOT NULL,
    "signatureHash" TEXT NOT NULL,
    "signedData" TEXT NOT NULL,
    "publicKey" TEXT NOT NULL,
    "signedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "isValid" BOOLEAN NOT NULL DEFAULT true,
    
    CONSTRAINT "signatures_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "signatures_partyId_key" UNIQUE ("partyId"),
    CONSTRAINT "signatures_contractId_partyId_key" UNIQUE ("contractId", "partyId")
);

-- Create AuditEvent table (audit trail)
CREATE TABLE "audit_events" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "actorId" TEXT,
    "details" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "audit_events_pkey" PRIMARY KEY ("id")
);

-- Add new columns to Contract table
ALTER TABLE "contracts" 
ADD COLUMN IF NOT EXISTS "createdById" TEXT,
ADD COLUMN IF NOT EXISTS "terms" JSONB,
ADD COLUMN IF NOT EXISTS "draftPdfUrl" TEXT,
ADD COLUMN IF NOT EXISTS "finalPdfUrl" TEXT,
ADD COLUMN IF NOT EXISTS "documentHash" TEXT,
ADD COLUMN IF NOT EXISTS "expiresAt" TIMESTAMP(3);

-- Create indexes
CREATE INDEX "contract_parties_contractId_idx" ON "contract_parties"("contractId");
CREATE INDEX "contract_parties_userId_idx" ON "contract_parties"("userId");

CREATE INDEX "signing_keys_userId_idx" ON "signing_keys"("userId");

CREATE INDEX "signatures_contractId_idx" ON "signatures"("contractId");
CREATE INDEX "signatures_signerId_idx" ON "signatures"("signerId");
CREATE INDEX "signatures_signedAt_idx" ON "signatures"("signedAt");

CREATE INDEX "audit_events_contractId_idx" ON "audit_events"("contractId");
CREATE INDEX "audit_events_eventType_idx" ON "audit_events"("eventType");
CREATE INDEX "audit_events_createdAt_idx" ON "audit_events"("createdAt");

-- Add foreign keys
ALTER TABLE "contract_parties" 
ADD CONSTRAINT "contract_parties_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "contract_parties" 
ADD CONSTRAINT "contract_parties_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "contract_parties" 
ADD CONSTRAINT "contract_parties_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "personas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "signing_keys" 
ADD CONSTRAINT "signing_keys_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "signatures" 
ADD CONSTRAINT "signatures_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "signatures" 
ADD CONSTRAINT "signatures_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "contract_parties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "signatures" 
ADD CONSTRAINT "signatures_signerId_fkey" FOREIGN KEY ("signerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "audit_events" 
ADD CONSTRAINT "audit_events_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "audit_events" 
ADD CONSTRAINT "audit_events_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "contracts" 
ADD CONSTRAINT "contracts_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
