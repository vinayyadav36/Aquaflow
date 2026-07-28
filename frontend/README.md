# SALTEDHASH Business OS — Expenses Module

## Overview

The **Expenses Module** is the money-out tracking layer of SALTEDHASH Business OS. It helps small business owners record, categorize, and understand their business spending — fully offline, on-device, and installable as a PWA or APK.

This module is built with a **4-layer architecture** that separates UI from domain logic, making it both a fully functional local-first app and a portable API-ready business module that can later be exposed via REST endpoints.

## Architecture

```
┌─────────────────────────────────────────────────┐
│  UI Layer (React Components & Pages)            │
│  - ExpenseForm, ExpenseList, CategoryPicker     │
│  - ExpensesListPage, NewExpensePage, DetailPage │
├─────────────────────────────────────────────────┤
│  Hook Layer (React Hooks)                       │
│  - useExpenseForm, useExpensesList              │
│  - useExpenseDetail                             │
├─────────────────────────────────────────────────┤
│  API Contract Layer (Internal Services)         │
│  - IExpenseService interface                   │
│  - LocalExpenseService implementation           │
│  - JSON-safe DTOs for all request/response      │
├─────────────────────────────────────────────────┤
│  Domain & Repository Layer                      │
│  - expensesDomain.ts (business rules)           │
│  - expensesValidation.ts (input validation)     │
│  - expensesSelectors.ts (query/summary logic)   │
│  - expensesRepository.ts (Dexie CRUD)           │
│  - expensesMigrationAudit.ts (integrity checks) │
└─────────────────────────────────────────────────┘
```

## Key Features

- **Local-First**: Fully offline. No server required. Data stored in IndexedDB via Dexie.js.
- **API-Ready**: All business logic is wrapped in `IExpenseService` with typed DTOs. The same hooks can work with `RemoteExpenseService` when a backend is available.
- **Quick Entry**: Fast expense recording with amount + category + payment mode.
- **Full Form**: Complete expense form with title, note, date, party linkage, and recurring hints.
- **Lists & Filters**: Search, filter by category/status/payment mode/date, sort by amount/date/category.
- **Category Summary**: Today/Week/Month totals, top category, cash vs digital breakdown.
- **Category Breakdown**: Per-category totals with drill-down into individual expenses.
- **Party Linkage**: Expenses can be linked to parties (suppliers/customers) for timeline views.
- **Recurring Hints**: Identify recurring expenses (daily/weekly/monthly) for future Desk integration.
- **Void Support**: Void expenses while preserving audit history (no hard deletes).
- **Duplicate**: Copy existing expenses with one click.
- **Presets**: Quick-fill from common expense templates (Rent, Supplies, Transport, Utilities).
- **Smart Auto-Title**: Title auto-generates from category name.
- **Monthly Spike Detection**: Warns when a category's latest expense is significantly higher than average.
- **Copy Last Expense**: Quick copy from the most recent expense.
- **Custom Categories**: Add categories beyond the system defaults.
- **Recent Categories**: Recently used categories appear in the picker.
- **PWA Installable**: Manifest + service worker for home-screen installation.
- **Capacitor Ready**: Config included for Android APK packaging.

## Data Model

### Expense
| Field | Type | Description |
|-------|------|-------------|
| id | string | UUID |
| expenseNumber | string | Auto-generated (EXP-00001) |
| title | string | Auto-generated from category if empty |
| amount | number | Must be > 0 |
| category | string | From default list or custom |
| paymentMode | 'cash'/'upi'/'bank'/'card'/'other' | Payment method |
| partyId | string? | Optional party reference |
| partySnapshot | object? | Denormalized party data |
| date | string (ISO) | Date of expense |
| note | string? | Optional note |
| tags | string[]? | Optional tags |
| recurringHint | 'none'/'daily'/'weekly'/'monthly'/'custom' | Recurring identification |
| status | 'recorded'/'voided' | Current state |
| createdAt | string (ISO) | Creation timestamp |
| updatedAt | string (ISO) | Last update timestamp |
| createdSource | 'manual'/'supplier_payment'/'adjustment' | Source of creation |

### ExpenseCategory
| Field | Type |
|-------|------|
| id | string |
| name | string |
| isSystem | boolean |
| createdAt | string |

Default categories: stock purchase, supplier payment, rent, utilities, transport, salary/staff, packaging, marketing, maintenance, subscriptions, food/tea, miscellaneous.

## API Contract Layer

The module exposes these service methods through `IExpenseService`:

| Method | Description | Route (future) |
|--------|-------------|----------------|
| `createExpense(input)` | Create a new expense | `POST /api/expenses` |
| `updateExpense(id, input)` | Update an expense | `PATCH /api/expenses/:id` |
| `getExpenseById(id)` | Get expense details | `GET /api/expenses/:id` |
| `getExpenses(query)` | List expenses with filters | `GET /api/expenses` |
| `voidExpense(id)` | Void an expense | `POST /api/expenses/:id/void` |
| `duplicateExpense(id)` | Duplicate an expense | `POST /api/expenses/:id/duplicate` |
| `getExpenseSummary(query)` | Get summary totals | `GET /api/expenses/summary` |
| `getExpenseCategorySummaryApi(query)` | Get category breakdown | `GET /api/expenses/categories/summary` |

All DTOs are JSON-safe and explicitly typed. The backend JSON Express adapter is quarantined as optional and not required for local app use.

## How Other Modules Can Consume

- **Desk**: Import `expenseService.getExpenseSummary()` for dashboard widgets.
- **Parties**: Call `expenseService.getExpenses({ partyId })` for party timeline.
- **Insights**: Use `expenseService.getExpenseCategorySummaryApi()` for spending analysis.
- **Backend**: Wrap `LocalExpenseService` with Express route handlers for REST API.

## Migration from Vue

The original frontend was built with Vue 3 + Pinia. It has been entirely rewritten to React with the following key changes:

- **State Management**: Pinia stores replaced by Dexie.js (IndexedDB) + React hooks + service classes.
- **Routing**: Vue Router replaced by React Router v7.
- **Styling**: Vue SFC styles → Tailwind CSS 4.
- **Architecture**: Monolithic Vue components → 4-layer modular architecture (UI → Hooks → API Contracts → Domain/Repository).
- **Offline**: Local state → Full offline-first with IndexedDB persistence.
- **API Readiness**: Tightly coupled data access → Isolated service contract layer ready for HTTP exposure.

All previous expense/purchase/supplier-payment related code has been unified into this single Expenses module.

## How the Local Repository Works

The repository layer (`expensesRepository.ts`) uses Dexie.js to interact with IndexedDB:

1. **Database**: `BusinessOSDB` with tables: `expenses`, `expenseCategories`, `expenseSettings`, `parties`.
2. **CRUD**: `createExpenseRecord()`, `updateExpenseRecord()`, `getExpenseRecordById()`, `listExpenseRecords()`.
3. **Settings**: `getNextExpenseNumber()` auto-increments expense numbers.
4. **Party Snapshots**: When linking a party, a denormalized snapshot is stored with the expense.

## How Party-Linked Expenses Work

- When creating/editing an expense, you can optionally link it to a party.
- The expense stores both the `partyId` (reference) and `partySnapshot` (denormalized name/phone/type).
- Linked expenses appear in the party's timeline (via `getExpenses({ partyId })`).
- For supplier-type parties, the expense may reduce the business's payable balance (future feature).

## How Recurring Hints Work

- Expenses can be tagged with a `recurringHint`: `none`, `daily`, `weekly`, `monthly`, or `custom`.
- This is a lightweight identification — no automatic posting is performed.
- The `RecurringHintsList` component shows all recurring expenses for awareness.
- Future Desk integration can use this to show upcoming expected expenses.

## Seed Data

The `seed.ts` initializes the database with realistic demo data:

1. Default expense categories (12 system categories)
2. A mock supplier party (Acme Wholesale Corp)
3. A mock customer party (Green Leaf Cafe)
4. Multiple expenses spanning different dates and categories:
   - Monthly rent (₹12,000, recurring)
   - Supplier payment linked to supplier (₹3,500)
   - Transport expense (₹250)
   - Monthly subscription (₹499, recurring)
   - Voided expense (₹19,900, cancelled)
   - Stock purchase (₹52,500)
   - Utilities (₹1,500)
   - Marketing (₹8,500)
   - Food/tea (₹450)
   - Daily recurring expense (₹250)

Seed data is created through the API service to ensure consistency.

## Getting Started

```bash
# Install dependencies
cd frontend
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## PWA & APK

- **PWA**: The app is installable via browser (manifest + service worker configured).
- **Capacitor**: `capacitor.config.ts` is configured for Android builds. Run `npx cap add android && npx cap sync && npx cap open android` to generate the APK.
- **Offline**: Full offline support via IndexedDB + service worker caching.

## Backend API

The Express backend previously handled expenses JSON storage. This has been moved to an optional adapter path (`backend/src/adapters/expenses-remote`) because the primary product direction is **local-first (Dexie)**.
Remote syncing via a server is strictly an optional future capability and is not wired as the default path for installed PWA/APK use.

## Tech Stack

- React 19
- TypeScript 6
- Vite 8
- Tailwind CSS 4
- Dexie.js 4 (IndexedDB)
- date-fns 4
- lucide-react
- react-router-dom 7
- vite-plugin-pwa
- Vitest (testing)
