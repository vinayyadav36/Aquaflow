# SALTEDHASH Business OS - Frontend Architecture

## React Architecture & Expenses Module

This codebase implements the core of the **SALTEDHASH Business OS**, featuring a fully local-first **Expenses Module**.

### Migration & Architecture Principles

The codebase was rewritten from Vue to React to comply with the new product direction, dropping Pinia in favor of strong React Context/Hooks tied to isolated service classes, and migrating from general state to local-first IndexedDB via `Dexie.js`.

The Expenses module is built to be **API-ready** even though it is completely functional offline and device-first. It employs a **4-Layer Architecture**:

1. **UI Components & Pages (`components/`, `Pages.tsx`)**: Dumb rendering components styled with Tailwind CSS, mapped to React Router. No DB logic lives here.
2. **State & React Hooks (`hooks/`)**: Abstractions over API services handling React states (loading, errors).
3. **API Contracts (`api/contracts.ts`, `api/expenseService.ts`)**: Pure TypeScript interfaces mimicking REST controllers. All I/O goes through `IExpenseService`. When a backend is available, `LocalExpenseService` can be swapped for a `RemoteExpenseService` using exactly the same UI Hooks.
4. **Domain & Repository (`services/`)**: `expensesDomain.ts` handles complex rules, validation, and summaries. `expensesRepository.ts` encapsulates pure `Dexie.js` interactions, protecting the upper layers from database specific implementations.

### Features
* Complete offline-first execution.
* PWA support with manifest configuration for Capacitor Android builds.
* Full module feature set: creating, voiding, copying, filtering, tagging expenses with parties and categorizing them.

### How to run

1. `npm install`
2. `npm run dev`
