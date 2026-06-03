# Plan 01-01: Project Scaffolding & Core Identity Schema

## Goal
Establish the foundational Next.js project with database schema for multi-persona identity system.

## Requirements Coverage
- AUTH-01: Multi-persona support (schema foundation)
- AUTH-03: OAuth integration foundation
- AUTH-04: RBAC data model

## Tasks

### 1. Project Scaffold
- [ ] Initialize Next.js 15 with TypeScript, Tailwind, App Router
- [ ] Configure ESLint, Prettier
- [ ] Set up environment configuration (.env.example)

### 2. Database Setup
- [ ] Install Prisma + Neon driver
- [ ] Initialize Prisma schema
- [ ] Configure database connection

### 3. Core Identity Schema
- [ ] Design User model (base auth entity)
- [ ] Design Persona model (role-specific profiles)
- [ ] Design Organization model (team/entity grouping)
- [ ] Create migration

### 4. Auth Foundation
- [ ] Install Auth.js (NextAuth v5)
- [ ] Configure OAuth providers (Google, Apple placeholders)
- [ ] Set up auth middleware

### 5. Project Structure
- [ ] Create monorepo-style folder structure
- [ ] Set up shared types
- [ ] Create base layout with design system

## Success Criteria
1. `npm run dev` starts without errors
2. Prisma schema defines User, Persona, Organization models
3. Database connection configured for Neon
4. Auth.js middleware protecting routes
5. Environment variables documented

## TDD Note
Schema design is structural (no TDD). Auth integration will use TDD in 01-02.
