<!-- cspell:ignore Turbopack Geist PostCSS -->


# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` (starts Next.js with Turbopack)
- **Build**: `npm run build` (builds with Turbopack)
- **Production server**: `npm run start`
- **Lint**: `eslint` (ESLint with Next.js and TypeScript configs)

## Project Architecture

This is a Next.js 15.5.3 application using the App Router pattern with:

- **Framework**: Next.js 15 with Turbopack for fast development and builds
- **Language**: TypeScript with strict mode enabled
- **Styling**: Tailwind CSS v4 with PostCSS
- **Fonts**: Geist font family (Geist and Geist Mono) from Google Fonts
- **Structure**: App Router pattern with source files in `src/app/`
- **Path aliases**: `@/*` maps to `./src/*`

### Key Files
- `src/app/layout.tsx`: Root layout with font configuration and metadata
- `src/app/page.tsx`: Home page component
- `src/app/globals.css`: Global styles with Tailwind directives
- `next.config.ts`: Next.js configuration (currently minimal)
- `eslint.config.mjs`: ESLint flat config with Next.js and TypeScript rules
- `tsconfig.json`: TypeScript configuration with Next.js plugin and path mapping

### Tech Stack Details
- React 19.1.0 with Next.js 15.5.3
- TypeScript with ES2017 target
- Tailwind CSS with PostCSS processing
- ESLint with Next.js core-web-vitals and TypeScript configs
- Turbopack for both development and production builds

## Documentation

- **Supabase**: See `.claude/spabase_document.md` for Supabase setup and usage instructions
- **Clerk Authentication**: See `.claude/clerk_document.md` for authentication, subscription, and billing implementation
- **Clerk + Supabase Integration**: See `.claude/clerk_supabase_integration.md` for integrating Clerk authentication with Supabase
- **Tailwind CSS**: See `.claude/tailwind_document.md` for Tailwind CSS setup and usage instructions