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

## Trade-offs & Scaling

### Trade-offs made:
- **Client-Side Polling vs. WebSockets**: For this prototype, we used HTTP polling for real-time updates. While WebSockets (via Ably or Socket.io) provide lower latency, polling was chosen for its simplicity and easier deployment in serverless environments like Vercel.
- **Simplified Versioning**: We use a `schemaSnapshot` per submission instead of a full Form Versioning system (Form v1, Form v2). This is sufficient for historical integrity but wouldn't support "rolling back" a form to a previous state easily.

### Scaling to Production:
1. **Edge Caching**: Implement ISR (Incremental Static Regeneration) for public form pages to handle high traffic.
2. **Database Scaling**: Move to a distributed database like CockroachDB or use Read Replicas for analytics queries.
3. **Queueing**: For high-volume submission endpoints, use a message queue (RabbitMQ/SQS) to ingest submissions and process webhooks/analytics asynchronously.
4. **Monitoring**: Integrate OpenTelemetry and Sentry for distributed tracing and error tracking.

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
