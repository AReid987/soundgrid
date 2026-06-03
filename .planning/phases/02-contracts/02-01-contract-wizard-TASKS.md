# Plan 02-01: Guided Contract Wizard for Core Agreement Types

## Goal
Create a guided wizard that allows users to generate music industry contracts in under 5 minutes.

## Requirements Coverage
- CONT-01: Guided Contract Wizard for 8 core music agreement types
- CONT-05: Basic DAW Integration capturing session start/end to trigger contract drafts

## Tasks

### 1. Contract Type Selection
- [ ] Create contract type selector page
- [ ] Define 8 core contract types with descriptions
- [ ] Design contract type cards

### 2. Contract Templates
- [ ] Define contract template structure
- [ ] Create Producer Agreement template
- [ ] Create Split Sheet template
- [ ] Create Performance Contract template
- [ ] Create Work for Hire template
- [ ] Create Collaboration Agreement template
- [ ] Create Management Agreement template
- [ ] Create Sync License template
- [ ] Create Custom Agreement template

### 3. Contract Wizard Steps
- [ ] Step 1: Contract Type Selection
- [ ] Step 2: Parties Information
- [ ] Step 3: Terms & Conditions
- [ ] Step 4: Payment Terms
- [ ] Step 5: Review & Confirm
- [ ] State management for multi-step form
- [ ] Progress indicator

### 4. Contract Creation Logic
- [ ] Server action to create contract draft
- [ ] Contract data validation with Zod
- [ ] Link contract to parties (personas)
- [ ] Store contract in database

### 5. Contract Preview
- [ ] Generate contract preview from template
- [ ] Show filled-in contract fields
- [ ] Allow editing before finalization

## Success Criteria
1. User can select from 8 contract types
2. Wizard guides through all required fields in under 5 minutes
3. Contract is saved to database with correct status
4. Contract appears in user's contract list
5. Contract can be previewed before sending

## TDD Tests
- Contract creation validation
- Wizard step progression
- Template field population
