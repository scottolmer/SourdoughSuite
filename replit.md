# Sourdough Suite - Sourdough Baking Platform

## Overview

Sourdough Suite is the world's first evidence-based bread science research platform. It integrates peer-reviewed academic research with professional-grade baking tools, serving as a scientific authority for professional bakers, culinary schools, and commercial bakeries. The platform validates claims against academic sources, providing confidence ratings and citation tracking. Its vision is to be the ultimate Professional Baking OS, offering a comprehensive suite of tools and curated educational content to enhance baking precision and knowledge.

## User Preferences

Preferred communication style: Simple, everyday language.
Strategic Direction: Focus on web platform optimization and educational content expansion. WordPress plugin development is no longer pursued.

## System Architecture

### Frontend
- **React with TypeScript**: Component-based UI.
- **Tailwind CSS**: Utility-first styling with custom themes.
- **Wouter**: Client-side routing.
- **Radix UI**: Accessibility-compliant components.
- **React Query**: Data fetching and state management.
- **Shadcn UI Components**: Pre-built themed components.
- **UI/UX Decisions**: Professional design system with a focus on scientific authority, updated color palette (blue #3182ce), responsive design (mobile-first approach, three-panel desktop layout for research, optimized desktop tools page), and clear visual hierarchy.

### Backend
- **Node.js with Express.js**: RESTful API server.
- **TypeScript**: Type-safe development.
- **Drizzle ORM**: Type-safe database operations.
- **Multi-provider AI Integration**: Supports OpenAI GPT-4o, Google Gemini 2.0 Flash, and Claude 3.7 Sonnet for consensus-based AI processing.
- **Subdomain Routing**: Separate routing for app, blog, and store (though store/blog focus has shifted).

### Build System
- **Vite**: Fast development server and production builds.
- **ESBuild**: Server-side bundling.
- **PostCSS**: CSS processing.

### Key Features & Design Patterns
- **AI Services**: Multi-LLM architecture for enhanced accuracy, AI-powered recipe generation, content generation (blog posts, FAQs), personalization, and recipe analysis. Includes an AI-powered article processing dashboard for automated research content integration and an AI baking troubleshooter.
- **Database Schema**: Manages users, sourdough starters, recipes, baking logs, production batches (for professional tools), and content. Focus on structured data with validation.
- **Professional Tools**: Professional Baker's Command Center with production batch tracking, business intelligence metrics (oven utilization, revenue analysis, efficiency monitoring), staff assignments, and real-time production timeline visualization. Mobile Production Dashboard for hands-on kitchen management with quick batch updates and status changes.
- **Baking Tools**: Comprehensive suite including Hydration Calculator, Timeline Calculator (with sleep time handling), Recipe Success Predictor (streamlined single-action analysis), Starter Management, Baker's Calculator, Temperature Calculator, and AI Troubleshooter.
- **Mobile Application**: React Native cross-platform app with offline support and push notifications. Prioritizes a tools-first approach and includes a mobile research hub with AI chat.
- **Content Management**: Focus on manually curated article summaries and educational content (e.g., "Starter School" hub), with SEO optimization and structured data.
- **Data Flow**: User input → Multi-AI processing → Database storage → Real-time updates → Personalization → Professional production tracking.

## External Dependencies

### AI Services
- **OpenAI GPT-4o**: Primary AI provider.
- **Google Gemini 2.0 Flash**: Alternative AI provider for consensus validation.
- **Claude 3.7 Sonnet**: Third AI provider for multi-LLM consensus.

### Database & Infrastructure
- **Neon PostgreSQL**: Cloud-hosted PostgreSQL database.
- **Replit**: Development and hosting platform.

### Third-party Integrations
- **Stripe**: (Previously for e-commerce, but commercial products removed).
- **pdf-parse**: For text extraction from research documents.
- **Web Scraping**: For recipe extraction from external websites, with AI fallback for unstructured data.
- **Google Analytics 4**: (Requires configuration for analytics).