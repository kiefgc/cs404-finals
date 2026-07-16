# Next.js 15 Refactoring Log

## Overview

This document summarizes the refactoring work performed to ensure compatibility with Next.js 15 and resolve Prisma schema mismatches in the authentication and library management backend.

## Authentication Backend (`lib/auth/`)

### actions.ts

- **Zod Validation Fix**: Updated error handling from `validation.error.errors[0].message` to `validation.error.issues[0].message` to match Zod API specification
- **Maintained "use server"**: Kept the directive for server actions while removing it from API route handlers

### authUtils.ts

- **Export Cleanup**: Removed duplicate `requireAuth` export from the custom export block, keeping only the direct function export

## API Route Refactoring (`app/api/`)

### Route Handler Updates

- **Export Syntax**: Changed all API route handlers to use direct export syntax:

  ```typescript
  // Before
  export async function GET() { ... }

  // After
  export const GET = withUserData(async (user) => { ... });
  ```

- **"use server" Directive**: Removed from all API route handlers (`route.ts` files) as they are not required and can cause issues

### Library Endpoints

- **Library/Add Route** (`app/api/library/add/route.ts`):
  - Changed `prisma.userGameLibrary` to `prisma.savedGame` to match Prisma schema
  - Updated all related database operations to use the correct model

### User Profile Endpoint

- **User/Profile Route** (`app/api/user/profile/route.ts`):
  - Changed `library: true` include to `saved_games: true`
  - Updated `profileData.library` references to `profileData.saved_games`
  - Added explicit typing: `(lib: { game_id: number }) => lib.game_id`
  - Changed `gamesCount` calculation from `profileData.library.length` to `profileData.saved_games.length`

## Database Schema Alignment

### Prisma Model Corrections

- Updated all references from the non-existent `userGameLibrary` model to the correct `savedGame` model
- Changed relation includes from `library` to `saved_games` to match the actual Prisma schema
- Ensured all database queries use the correct field and model names

## TypeScript Compilation

- **All fixes verified** with `npx tsc` to ensure clean compilation
- Eliminated implicit any errors with proper typing
- Maintained proper type safety throughout the authentication and library management flows

## Security and Functionality

- ✅ All security measures preserved
- ✅ Authentication flows remain intact
- ✅ Protected routes continue to work as designed
- ✅ Library functionality maintains all existing features
- ✅ Proper error handling retained throughout

## Next.js 15 Compatibility

- ✅ Proper async cookies handling: All `cookies()` instances are properly awaited
- ✅ Correct API route handler syntax
- ✅ Proper export patterns for Next.js 15 requirements
- ✅ Maintained Server Actions functionality
