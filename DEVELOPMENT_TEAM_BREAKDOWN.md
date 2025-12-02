# Sourdough Suite - Complete Development Team Breakdown

## Executive Summary

**Sourdough Suite** is a tools-first scientific bread baking platform that has evolved from a comprehensive research platform into a focused WordPress plugin concept. The platform emphasizes manual content curation over AI generation, with scientific calculators as the primary value proposition.

### Current Strategic Position
- **Primary Focus**: Scientific baking calculators and tools
- **Secondary Focus**: Manually curated research article summaries
- **Target Market**: Professional bakers, culinary schools, home baking enthusiasts
- **Revenue Model**: Free tools to build user base, premium features for professionals
- **Brand Positioning**: "Recipe Validator Stamp of Approval" - scientific authority in baking

---

## Technical Architecture

### Technology Stack

#### Frontend
- **React 18** with TypeScript - Component-based UI
- **Vite** - Fast development server and build tool
- **Tailwind CSS** - Utility-first styling framework
- **Wouter** - Lightweight client-side routing (not React Router)
- **Radix UI** - Accessible headless component library
- **Shadcn/ui** - Pre-built component system
- **React Query (TanStack Query)** - Data fetching and caching
- **React Hook Form** - Form management with Zod validation

#### Backend
- **Node.js** with Express.js - RESTful API server
- **TypeScript** - Type-safe server development
- **Drizzle ORM** - Type-safe database operations
- **PostgreSQL** (Neon) - Primary database
- **Multi-AI Integration**: OpenAI GPT-4o, Google Gemini 2.0 Flash, Claude 3.7 Sonnet

#### Build & Deployment
- **Vite** - Frontend bundling
- **ESBuild** - Server-side bundling
- **Replit** - Development and hosting platform
- **PostgreSQL** - Cloud database (Neon)

### Project Structure
```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route components
│   │   ├── lib/            # Utility functions
│   │   └── hooks/          # Custom React hooks
├── server/                 # Backend Express application
│   ├── routes.ts           # Main API routes
│   ├── admin-routes.ts     # Admin panel routes
│   ├── mobile-api.ts       # Mobile-specific endpoints
│   └── chat-service.ts     # AI chat functionality
├── shared/                 # Shared TypeScript types
│   └── schema.ts           # Database schema definitions
├── public/                 # Static assets
└── attached_assets/        # User-uploaded files and design assets
```

---

## Core Features & Functionality

### 1. Scientific Calculators (Primary Value Proposition)

#### Hydration Calculator
- **Purpose**: Calculate precise water-to-flour ratios
- **File**: `client/src/pages/HydrationConverterPage.tsx`
- **Features**: 
  - Ingredient input with automatic percentage calculations
  - Baker's percentage conversion
  - Hydration analysis with recommendations

#### Timeline Calculator
- **Purpose**: Plan fermentation schedules working backward from desired bake time
- **File**: `client/src/pages/TimelineCalculatorPage.tsx`
- **Features**:
  - Multi-step timeline planning
  - Temperature-based fermentation adjustments
  - Notification scheduling

#### Recipe Validator
- **Purpose**: Analyze recipes for scientific accuracy and improvement suggestions
- **File**: `client/src/pages/RecipeValidatorPage.tsx`
- **Features**:
  - AI-powered recipe analysis
  - Baker's percentage validation
  - Improvement recommendations

#### Baker's Calculator
- **Purpose**: Convert between different measurement units and calculate baker's percentages
- **File**: `client/src/pages/BakersCalculatorPage.tsx`
- **Features**:
  - Unit conversions (grams, ounces, cups)
  - Baker's percentage calculations
  - Scaling recipes up/down

### 2. Research Hub (Secondary Focus)

#### Manual Content Curation
- **Philosophy**: Human-reviewed quality over AI generation
- **File**: `client/src/pages/ResearchHubNew.tsx`
- **Features**:
  - Tabbed interface: Featured, Recent, Topics
  - "Manual Review" and "Quality Control" badges
  - Search functionality for curated articles
  - Integration with tools via "Apply Research" sections

#### Research Articles
- **File**: `client/src/pages/ResearchArticlePage.tsx`
- **Features**:
  - Markdown content rendering
  - Research grade indicators
  - Cross-references to relevant calculators
  - "Apply This Research" tool suggestions

### 3. Admin Panel

#### Quality Control Dashboard
- **File**: `client/src/pages/QualityControlDashboard.tsx`
- **Purpose**: Manage article review workflow
- **Features**:
  - PDF upload and processing
  - AI-powered content analysis
  - Manual review and approval system
  - Topic management

#### Simple Admin Dashboard
- **File**: `client/src/pages/SimpleAdminDashboard.tsx`
- **Purpose**: Article management and publication
- **Features**:
  - Create/edit articles
  - AI summarization tools
  - Publication workflow

### 4. AI Services

#### Multi-LLM Architecture
- **Primary**: OpenAI GPT-4o for recipe generation
- **Secondary**: Google Gemini 2.0 Flash for consensus validation
- **Tertiary**: Claude 3.7 Sonnet for content analysis

#### Chat Services
- **File**: `server/chat-service.ts`
- **Features**:
  - Article-specific Q&A
  - Research summarization
  - Mobile-optimized chat interface

---

## Database Schema

### Core Tables

#### Research Articles (`research_articles`)
```sql
- id: Primary key
- title: Article title
- slug: URL-friendly identifier
- content: Markdown content
- executiveSummary: AI-generated summary
- fullContent: Complete article text
- isPublished: Publication status
- confidenceScore: Research quality rating
- createdAt/updatedAt: Timestamps
```

#### Research Topics (`research_topics`)
```sql
- id: Primary key
- name: Topic name
- description: Topic description
- slug: URL-friendly identifier
- sourceCount: Number of related articles
```

#### Users (`users`)
```sql
- id: Primary key
- username: Unique username
- email: Email address
- subscriptionTier: free/premium/master
- stripeCustomerId: Payment integration
```

#### Recipes (`bread_recipes`)
```sql
- id: Primary key
- name: Recipe name
- ingredients: JSON array
- instructions: Step-by-step instructions
- bakingTime: Total time required
- difficulty: beginner/intermediate/advanced
```

---

## API Endpoints

### Research API (`/api/research/`)
- `GET /topics` - List all research topics
- `GET /articles` - List published articles
- `GET /articles/:slug` - Get specific article
- `GET /search` - Search articles and topics

### Admin API (`/api/admin/`)
- `POST /upload-pdf` - Upload research documents
- `GET /articles/pending-review` - Articles awaiting approval
- `POST /articles/:id/review` - Approve/reject articles

### Tools API (`/api/tools/`)
- `POST /calculate` - Perform calculations
- `POST /validate-recipe` - Recipe validation
- `POST /generate-timeline` - Timeline generation

### Mobile API (`/api/mobile/`)
- `POST /chat` - AI chat interface
- `GET /search/suggestions` - Search suggestions
- `POST /calculate/suggest` - Calculator recommendations

---

## User Experience Flow

### Primary User Journey: Tools-First Approach

1. **Homepage** (`client/src/pages/HomePage.tsx`)
   - Large, prominent calculator cards
   - Quick access to hydration, timeline, recipe validator
   - Scientific credibility messaging

2. **Tools Page** (`client/src/pages/Tools.tsx`)
   - Comprehensive calculator suite
   - Scientific foundation emphasis
   - Cross-references to supporting research

3. **Research Integration**
   - "Apply This Research" sections in articles
   - Tools quick access in research hub
   - Bidirectional navigation between theory and practice

### Navigation Structure
- **Mobile**: Home → Tools → Research → Recipes (4 tabs)
- **Desktop**: Full navigation with scientific emphasis
- **Cross-linking**: Strong connections between calculators and research

---

## Development Environment

### Setup Requirements
1. **Node.js** 18+ 
2. **PostgreSQL** database (provided by Replit/Neon)
3. **Environment Variables**:
   - `DATABASE_URL` - PostgreSQL connection
   - `OPENAI_API_KEY` - OpenAI integration
   - `GOOGLE_API_KEY` - Gemini integration

### Development Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run db:push      # Push schema changes to database
npm run check        # TypeScript type checking
```

### Development Workflow
1. **Frontend Development**: Hot reloading with Vite
2. **Backend Development**: TypeScript compilation with tsx
3. **Database Changes**: Drizzle ORM with schema migrations
4. **Testing**: Manual testing in development environment

---

## Current Issues & Technical Debt

### Known Issues
1. **Database Seeding Error**: Numeric field overflow in research topics
   - Error: `numeric field overflow` in confidence scores
   - Location: `server/seed-research-topics.ts`
   - Fix needed: Adjust precision/scale for numeric fields

2. **Routing Inconsistencies**: 
   - Multiple tool routing patterns (`/tools/` vs `/ai/`)
   - Some routes reference non-existent components

3. **Component Cleanup Needed**:
   - Multiple versions of Tools.tsx files
   - Unused legacy components from e-commerce phase

### Performance Considerations
- **Large Bundle Size**: Many unused Radix UI components
- **Database Queries**: No pagination on research articles
- **AI API Calls**: No caching for repeated requests

---

## Strategic Roadmap

### Phase 1: Core Stability (Immediate)
- Fix database seeding errors
- Consolidate routing patterns
- Remove unused components
- Implement proper error handling

### Phase 2: WordPress Plugin Development
- Convert React components to WordPress blocks
- Implement WordPress database integration
- Create plugin architecture
- Develop admin interface for WordPress

### Phase 3: Enhanced Features
- Advanced calculator features
- User accounts and saved calculations
- Mobile app development
- Premium subscription features

---

## Key Development Guidelines

### Code Standards
- **TypeScript**: Strict typing throughout
- **Component Organization**: Functional components with hooks
- **State Management**: React Query for server state, useState for local
- **Styling**: Tailwind CSS with custom theme configuration
- **Form Handling**: React Hook Form with Zod validation

### Architecture Principles
- **Tools-First**: Calculators are primary value proposition
- **Manual Curation**: Human review over AI generation
- **Scientific Authority**: All claims backed by research
- **Mobile Optimization**: Responsive design for all features
- **Cross-Platform**: Preparation for WordPress plugin conversion

### User Experience Priorities
1. **Calculator Accessibility**: Easy access to core tools
2. **Scientific Credibility**: Clear research backing
3. **Professional Focus**: Target commercial/educational users
4. **Clean Interface**: No misleading or fake interactive elements
5. **Practical Application**: Bridge between theory and practice

---

## Contact & Resources

### Documentation
- **Technical Docs**: `replit.md` (project overview)
- **API Documentation**: In-code comments and TypeScript types
- **Database Schema**: `shared/schema.ts`
- **Component Library**: Shadcn/ui documentation

### Key Files for New Developers
1. `client/src/App.tsx` - Main routing and app structure
2. `server/routes.ts` - Primary API endpoints
3. `shared/schema.ts` - Database schema and types
4. `client/src/pages/HomePage.tsx` - Main landing page
5. `client/src/pages/Tools.tsx` - Primary tools interface

This breakdown provides your development team with a comprehensive understanding of the Sourdough Suite platform's current state, architecture, and development priorities. The focus on tools-first approach with manual content curation represents the strategic direction for the WordPress plugin conversion.