# Plan 01-02: Multi-Persona Signup Workflow with OAuth

## Goal
Enable users to select their professional persona during signup and create role-specific profiles.

## Requirements Coverage
- AUTH-01: Multi-persona sign-up workflow (Artist, Producer, Supervisor, Venue, Manager)
- AUTH-03: OAuth Integration (Google, Apple) for frictionless professional onboarding
- AUTH-04: RBAC data isolation foundation

## Tasks

### 1. Persona Selection Flow
- [ ] Create persona selection page (post-oauth)
- [ ] Design persona cards for each type
- [ ] Implement persona selection state

### 2. Persona Profile Creation
- [ ] Create persona detail form (display name, location, genre)
- [ ] Type-specific fields (stage name, venue capacity, company)
- [ ] Avatar upload placeholder
- [ ] Form validation with Zod

### 3. OAuth Integration
- [ ] Configure Google OAuth credentials
- [ ] Test Google sign-in flow
- [ ] Configure Apple OAuth (setup steps)
- [ ] Handle OAuth callbacks properly

### 4. Database Integration
- [ ] Create Persona on selection
- [ ] Link Persona to User
- [ ] Handle multiple personas per user

### 5. Protected Flow
- [ ] Redirect new users to persona setup
- [ ] Skip if personas exist
- [ ] Welcome screen after completion

## Success Criteria
1. User can sign in with Google OAuth
2. First-time users see persona selection screen
3. User can create one or more personas
4. Persona data saves to database
5. User is redirected to dashboard after completion

## TDD Tests
- `createPersona` server action validation
- OAuth session handling
- Persona selection state management
