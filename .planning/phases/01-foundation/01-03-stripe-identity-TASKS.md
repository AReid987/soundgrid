# Plan 01-03: Stripe Identity Integration for Verification

## Goal
Integrate Stripe Identity to verify user identities before they can receive payouts.

## Requirements Coverage
- AUTH-02: Integrated Identity Verification via Stripe Identity for any payout recipient

## Tasks

### 1. Stripe Setup
- [ ] Install Stripe SDK
- [ ] Configure Stripe client
- [ ] Add environment variables

### 2. Identity Verification Session
- [ ] Create server action to initiate verification session
- [ ] Generate verification link/client secret
- [ ] Store session ID on user record

### 3. Verification Flow UI
- [ ] Create identity verification page
- [ ] Display verification status
- [ ] Handle verification start/completion

### 4. Webhook Handler
- [ ] Create webhook endpoint for Stripe events
- [ ] Handle `identity.verification_session.verified`
- [ ] Handle `identity.verification_session.canceled`
- [ ] Handle `identity.verification_session.requires_input`
- [ ] Update user record on verification status change

### 5. Payout Gate
- [ ] Check verification status before contract/payment creation
- [ ] Display warning if not verified
- [ ] Block payout-related actions for unverified users

## Success Criteria
1. User can initiate identity verification
2. Stripe Identity modal/flow opens
3. Verification status updates automatically via webhook
4. Unverified users see warnings on payout-related pages
5. Payout actions blocked for unverified users

## TDD Tests
- Create verification session
- Webhook handler for verification events
- Payout gate middleware
