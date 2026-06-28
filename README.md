# Dynamic Form Builder Engine

A flexible prototype for dynamically defining, validating, storing, and rendering form responses. Built with Next.js, PostgreSQL, and Prisma.

## Core Features

- **Form Configuration**: Store dynamic form layouts and rules using JSON Schema.
- **Dynamic Validation**: Server-side validation of submissions using `ajv` against stored JSON Schemas.
- **Submission Storage**: Safe storage of user responses with historical integrity.
- **Multi-tenancy**: Organization-based form management powered by Clerk.
- **Real-time Analytics**: Live dashboard stats (Total Forms, Total Responses, Completion Rates) with 10-second polling.
- **Role-Based Access**: Secure access control for managing forms and viewing submissions.

## Tech Stack

- **Frontend**: Next.js 15+ (App Router), React, Tailwind CSS, Shadcn UI.
- **Backend**: Next.js Route Handlers (REST-like API).
- **Database**: PostgreSQL with Prisma ORM.
- **Authentication**: Clerk (Organizations, User Management, Billing).
- **Validation**: Ajv (JSON Schema validation) & Zod (Internal API validation).

## Design Decisions

### 1. Database Schema Choice (PostgreSQL + JSONB)
We chose PostgreSQL for its reliability and robust support for relational data (Organizations, Users, Forms). We utilize the `JSONB` type for `Form.schema` and `FormSubmission.data`.
- **Why?** JSONB allows us to store dynamic form configurations without needing complex schema migrations every time a user adds a field. It provides a perfect balance between relational integrity and document-oriented flexibility.

### 2. Validation Strategy (JSON Schema + Ajv)
Instead of hardcoding validation rules, the engine uses **JSON Schema**.
- **Dynamic Generation**: When a form is created via the UI, a corresponding JSON Schema is generated automatically.
- **Ajv Engine**: On submission, we use the `ajv` library to validate the payload against the stored schema. This supports complex rules like `required`, `pattern` (email), `min/max`, and more.

### 3. Historical Integrity
A key requirement was ensuring that stored submissions stay valid against the configuration version that produced them.
- **Implementation**: Every `FormSubmission` includes a `schemaSnapshot`. This field stores a complete copy of the `Form.schema` at the moment of submission.
- **Benefit**: Even if the form's structure is updated later (e.g., adding or removing fields), we can still reconstruct exactly what the user saw and what rules were applied when they submitted the data.

## Implementation Details

### Error Handling
- **API Consistency**: All API routes follow a standard error response format `{ error: string, details?: any }`.
- **Field-Level Validation**: Validation errors from `ajv` or `zod` are mapped back to specific fields to provide clear user feedback.
- **Auth Resilience**: Graceful handling of Clerk session timeouts and organization access errors.

### Real-time Synchronization
- The dashboard uses a 10-second polling mechanism to fetch the latest statistics and form lists, ensuring data stays in sync without manual page refreshes.

## Project Structure

```
assignment-b/
├── app/                          # Next.js App Router
│   ├── api/                     # API Routes
│   │   ├── dashboard/          # Dashboard stats endpoint
│   │   ├── forms/              # Form CRUD operations
│   │   ├── organizations/      # Organization management
│   │   └── webhooks/           # Webhook integrations (Clerk sync)
│   ├── dashboard/              # Dashboard pages
│   ├── forms/                  # Form viewing and submission pages
│   ├── onboarding/             # Onboarding flow
│   ├── pricing/                # Pricing page
│   └── sign-in/sign-up/        # Authentication pages
├── components/                  # React Components
│   ├── ui/                     # Shadcn UI components
│   ├── billing/                # Billing-related components
│   ├── form-*.tsx              # Form management components
│   ├── dashboard-*.tsx         # Dashboard components
│   └── team-collaboration.tsx  # Team management
├── lib/                         # Utility libraries
│   ├── auth.ts                 # Authentication & authorization
│   ├── clerk-sync.ts           # Clerk webhook sync logic
│   ├── db.ts                   # Prisma client
│   ├── validators.ts           # Form validation (Ajv + Zod)
│   ├── entitlements.ts         # Plan-based feature access
│   └── plans.ts                # Plan configuration
├── prisma/                      # Database
│   ├── schema.prisma           # Database schema
│   └── migrations/             # Database migrations
└── tests/                       # Test files
```

## API Endpoints

### Forms API

#### `GET /api/forms`
- **Purpose**: List all forms for an organization
- **Auth**: Required (organization member)
- **Query Params**: `orgId` (optional)
- **Response**: Array of forms with submission counts

#### `POST /api/forms`
- **Purpose**: Create a new form
- **Auth**: Required (EDITOR or OWNER role)
- **Body**: Form schema definition (validated by Zod)
- **Response**: Created form with generated JSON Schema

#### `GET /api/forms/[id]`
- **Purpose**: Get form details (public endpoint for form viewing)
- **Auth**: Not required (public form access)
- **Response**: Form schema with submission count
- **Side Effect**: Increments page view counter

#### `DELETE /api/forms/[id]`
- **Purpose**: Delete a form
- **Auth**: Required (EDITOR or OWNER role)
- **Response**: Success confirmation

#### `POST /api/forms/[id]/submit`
- **Purpose**: Submit form response
- **Auth**: Not required (public submission)
- **Body**: Form submission data
- **Validation**: Validated against stored JSON Schema using Ajv
- **Response**: Submission ID with schema snapshot

#### `GET /api/forms/[id]/submissions`
- **Purpose**: Get all submissions for a form
- **Auth**: Required (organization member)
- **Query Params**: `page`, `limit`
- **Response**: Paginated submissions list

#### `GET /api/forms/check-limit`
- **Purpose**: Check if organization can create more forms
- **Auth**: Required
- **Response**: `{ allowed, reason, currentForms, limit, plan }`

### Organizations API

#### `GET /api/organizations`
- **Purpose**: List user's organizations
- **Auth**: Required
- **Response**: Array of organizations with user's role

#### `POST /api/organizations`
- **Purpose**: Sync organization from Clerk
- **Auth**: Required
- **Body**: Uses active Clerk organization
- **Response**: Synced organization details

### Dashboard API

#### `GET /api/dashboard/stats`
- **Purpose**: Get dashboard statistics
- **Auth**: Required (organization member)
- **Query Params**: `orgId` (required)
- **Response**: `{ totalForms, totalResponses, teamMembers, avgCompletion }`

### Webhooks API

#### `GET /api/webhooks`
- **Purpose**: List organization webhooks
- **Auth**: Required (organization member)
- **Headers**: `x-organization-id` (optional)
- **Response**: Array of webhooks

#### `POST /api/webhooks`
- **Purpose**: Create webhook
- **Auth**: Required (organization member)
- **Body**: `{ url, events[] }`
- **Response**: Created webhook

#### `DELETE /api/webhooks`
- **Purpose**: Delete webhook
- **Auth**: Required (organization member)
- **Query Params**: `id`
- **Response**: Success confirmation

### Clerk Webhook API

#### `POST /api/webhooks/clerk`
- **Purpose**: Handle Clerk webhook events
- **Auth**: Signature verification via `CLERK_WEBHOOK_SECRET`
- **Events Handled**:
  - `user.created/updated/deleted` - User sync
  - `organization.created/updated/deleted` - Organization sync
  - `organizationMembership.created/updated/deleted` - Member sync
  - `subscription.*` - Billing and plan updates
  - `subscriptionItem.*` - Subscription item updates

## Database Schema

### Core Models

#### Organization
- Multi-tenant container for forms and members
- Fields: `clerkOrgId`, `name`, `slug`, `plan`, `stripeCustomerId`, `subscriptionStatus`
- Relationships: Has many `OrganizationMember`, `Form`, `Webhook`, `ActivityLog`

#### OrganizationMember
- Links users to organizations with roles
- Fields: `organizationId`, `clerkUserId`, `role` (OWNER/EDITOR/VIEWER)
- Unique constraint: `(organizationId, clerkUserId)`
- Roles: OWNER (full access), EDITOR (form management), VIEWER (read-only)

#### User
- User profile data
- Fields: `clerkUserId`, `email`, `firstName`, `lastName`, `avatar`, `defaultOrgId`

#### Form
- Dynamic form definition with JSON Schema
- Fields: `organizationId`, `title`, `description`, `schema` (JSONB), `status` (DRAFT/PUBLISHED/CLOSED/ARCHIVED), `isPublished`, `pageViews`
- Relationships: Has many `FormSubmission`

#### FormSubmission
- User form responses with historical integrity
- Fields: `formId`, `data` (JSONB), `schemaSnapshot` (JSONB), `sourceDevice`, `sourceUrl`, `isStarred`, `tags`
- Key Feature: `schemaSnapshot` preserves validation rules at submission time

#### Webhook
- External webhook integrations
- Fields: `organizationId`, `url`, `events[]`, `isActive`

#### ActivityLog
- Audit trail for organization actions
- Fields: `organizationId`, `clerkUserId`, `action`, `resourceType`, `resourceId`, `details` (JSONB)

### Enums

#### Plan
- `FREE`, `STARTER`, `PROFESSIONAL`, `ENTERPRISE`
- Determines feature limits (forms, webhooks, conditional logic, SSO)

#### MemberRole
- `OWNER`, `EDITOR`, `VIEWER`
- Controls access permissions

#### FormStatus
- `DRAFT`, `PUBLISHED`, `CLOSED`, `ARCHIVED`
- Form lifecycle states

## Authentication & Authorization

### Authentication Flow

1. **Clerk Integration**: Uses Clerk for authentication (sign-in/sign-up)
2. **Session Management**: Clerk middleware handles session validation
3. **User Sync**: Webhooks sync user data to local database on creation/update

### Authorization Layers

#### 1. Authentication Check (`requireAuth`)
- Validates user is authenticated via Clerk
- Returns `{ userId, orgId }` from session

#### 2. Organization Access (`requireOrgAccess`)
- Verifies user is member of the organization
- Syncs organization details from Clerk on access
- Returns `{ organization, member }`

#### 3. Role-Based Access
- **`requireEditorAccess`**: Blocks VIEWER role from mutations
- **`requireFormEditorAccess`**: Checks form ownership + EDITOR/OWNER role
- **`requireFormOrgAccess`**: Checks form organization membership

#### 4. Plan-Based Entitlements (`entitlements.ts`)
- **`canCreateForm`**: Checks form limits based on plan
- **`hasFeature`**: Checks feature access (webhooks, conditional logic, SSO)
- Plan limits enforced at API level

### Authorization Matrix

| Action | VIEWER | EDITOR | OWNER |
|--------|--------|--------|-------|
| View forms | ✅ | ✅ | ✅ |
| View submissions | ✅ | ✅ | ✅ |
| Create forms | ❌ | ✅ | ✅ |
| Edit forms | ❌ | ✅ | ✅ |
| Delete forms | ❌ | ✅ | ✅ |
| Manage members | ❌ | ❌ | ✅ |
| Manage billing | ❌ | ❌ | ✅ |

## Components Overview

### Form Management
- **`form-builder.tsx`**: Dynamic form builder with field types
- **`dynamic-form-renderer.tsx`**: Renders forms from JSON Schema
- **`form-settings.tsx`**: Form status and sharing settings
- **`form-share-export.tsx`**: Form sharing and export options
- **`forms-list.tsx`**: Form list with loading/error states

### Dashboard
- **`dashboard-stats.tsx`**: Real-time statistics display
- **`dashboard-nav.tsx`**: Dashboard navigation
- **`forms-list.tsx`**: Form management table

### Advanced Features
- **`conditional-logic-builder.tsx`**: Form conditional logic editor
- **`form-theme-customizer.tsx`**: Form appearance customization
- **`webhook-integrations.tsx`**: Webhook management
- **`team-collaboration.tsx`**: Team member management

### UI Components
- **`site-header.tsx`**: Application header
- **`page-container.tsx`**: Page layout wrapper
- **`org-switcher.tsx`**: Organization switcher
- **`response-filters.tsx`**: Submission filtering

## Key Libraries

### Validation
- **Zod**: API request validation
- **Ajv**: JSON Schema validation for form submissions

### Database
- **Prisma**: ORM with PostgreSQL
- **JSONB**: Dynamic schema storage

### Authentication
- **Clerk**: Authentication, organizations, billing

### UI
- **Shadcn UI**: Component library
- **Tailwind CSS**: Styling
- **Lucide React**: Icons

## AI Tools Usage

During the development of this project, I used the following AI tools:

### Tools Used
- **Cascade (Cognition AI)**: Primary AI coding assistant for scaffolding, debugging, code generation, and documentation.
- **v0 (Vercel)**: AI-powered UI component generation for rapid prototyping of form interfaces and dashboard layouts.
- **Cursor (Cursor AI)**: AI code editor used for refactoring, code completion, and implementing complex features like webhook integrations.

### How AI Was Used
- **Scaffolding**: Generated initial project structure, including Next.js App Router setup, Prisma schema, and basic API routes.
- **Code Generation**: Wrote form builder components, validation logic using Ajv, webhook handlers for Clerk integration, and dashboard analytics.
- **Debugging**: Identified and fixed issues with Clerk authentication flow, webhook signature verification, and form submission validation.
- **Documentation**: Assisted in writing this README, including design decisions, trade-offs, and setup instructions.
- **Code Review**: Reviewed and refactored code for better structure, error handling, and type safety.

### Verification
All code generated by AI was reviewed and tested. I understand and can explain:
- The database schema and relationships between Organizations, Forms, and FormSubmissions.
- The JSON Schema validation flow using Ajv.
- The Clerk webhook integration and signature verification.
- The role-based access control implementation.
- The frontend component structure and state management.

## Trade-offs & Scaling

### Trade-offs made:
- **Client-Side Polling vs. WebSockets**: For this prototype, we used HTTP polling for real-time updates. While WebSockets (via Ably or Socket.io) provide lower latency, polling was chosen for its simplicity and easier deployment in serverless environments like Vercel.
- **Simplified Versioning**: We use a `schemaSnapshot` per submission instead of a full Form Versioning system (Form v1, Form v2). This is sufficient for historical integrity but wouldn't support "rolling back" a form to a previous state easily.

### Scaling to Production:
1. **Edge Caching**: Implement ISR (Incremental Static Regeneration) for public form pages to handle high traffic.
2. **Database Scaling**: Move to a distributed database like CockroachDB or use Read Replicas for analytics queries.
3. **Queueing**: For high-volume submission endpoints, use a message queue (RabbitMQ/SQS) to ingest submissions and process webhooks/analytics asynchronously.
4. **Monitoring**: Integrate OpenTelemetry and Sentry for distributed tracing and error tracking.

## Live Deployment

**Hosted URL**: https://technical-assessment-uohn.vercel.app

### Test Credentials
- Use any authentication provider on clerk authentication such as Google or github

### Accessing the Live Application
1. Visit the hosted URL
2. Sign in using the test credentials above
3. Navigate to the dashboard to create and manage forms

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL instance
- Clerk Account (for Auth)

### Setup
1. Clone the repository.
2. Copy `.env.example` to `.env` and fill in your keys.
3. Install dependencies: `npm install`
4. Push the database schema: `npx prisma db push`
5. Start the development server: `npm run dev`

### Clerk Configuration
To fully enable the application's features, follow these steps in your [Clerk Dashboard](https://dashboard.clerk.com):

#### 1. Organizations & Billing
- **Enable Organizations**: Go to **Organization Settings** and toggle "Enable organizations".
- **Configure Billing**: Under **Billing**, set up your plans. The application expects the following plan slugs (or tiers) to map correctly:
    - `free_org` -> FREE
    - `starter` (or `basic`) -> STARTER
    - `professional` (or `pro`) -> PROFESSIONAL
    - `enterprise` -> ENTERPRISE
- **Pricing Table**: Use the Clerk `<PricingTable />` component as shown in `app/pricing/page.tsx`.

#### 2. Webhooks (Real-time Sync)
To keep the local database in sync with Clerk (e.g., when a user joins an organization or upgrades a plan):
1. Go to **Webhooks** in the Clerk Dashboard.
2. Add a new endpoint: `https://your-domain.com/api/webhooks/clerk`.
3. Subscribe to the following events:
    - `organization.created`
    - `organization.updated`
    - `organizationMembership.created`
    - `organizationMembership.deleted`
    - `subscription.created`
    - `subscription.updated`
4. Copy the **Signing Secret** and add it to your `.env` as `CLERK_WEBHOOK_SECRET`.

#### 3. Local Webhook Testing (ngrok)
Since Clerk cannot send webhooks to `localhost`, use **ngrok**:
1. Install ngrok: `npm install -g ngrok` (or download from ngrok.com).
2. Start a tunnel: `ngrok http 3000`.
3. Copy the `Forwarding` URL (e.g., `https://random-id.ngrok-free.app`).
4. In Clerk Dashboard, set your Webhook URL to `https://random-id.ngrok-free.app/api/webhooks/clerk`.
5. Update `NEXT_PUBLIC_APP_URL` in `.env` to your ngrok URL for proper redirects.

### Docker (Full Stack)
You can spin up the entire application (Next.js + PostgreSQL) using Docker:

1. Ensure your `.env` file is populated with the required Clerk keys.
2. Run:
```bash
docker-compose up -d --build
```
3. The app will be available at `http://localhost:3000`.
4. The database will be available at `localhost:5432`.
