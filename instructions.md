ASSIGNMENT A
Dynamic Form Builder Engine
Target level: Intermediate
1. Context & Business Problem
   In many modern enterprise applications, user-facing forms, legal disclosures, and input
   workflows change frequently due to shifting business requirements, regulatory updates, or
   localisation needs. Hardcoding these forms into traditional static database tables leads to high
   development overhead, constant redeployments, and complex data migration paths.
   To solve this, we want to build a Dynamic Form Builder Engine. Instead of mapping forms to
   static database tables, form fields are represented as dynamic configurations. Your task is to
   design and implement a flexible prototype that dynamically defines, validates, stores, and
   renders form responses.
2. Core Functional Objectives
   Your service must accomplish three main goals:
   • Form Configuration: store a dynamic form’s layout and rules.
   • Dynamic Validation: accept user form submissions and validate the payload against
   those rules before persisting it.
   • Submission Storage: safely store the actual user responses against the form that
   produced them.
3. Recommended Requirements & Architecture
   You have full creative control over how you structure your database and application code. The
   breakdown below describes what the system needs to support.
   A. Data Modelling
   You need a storage strategy (e.g. PostgreSQL with JSONB, a document database, or any
   database of your choice) that handles two primary models:
   • Form Configurations / Templates — represent the form’s fields, types, and validation
   rules (standard formats such as JSON Schema are highly recommended).
   • Form Submissions — store the actual user responses safely, linked to the configuration
   that produced them.
   Your backend should expose a clean interface (REST, GraphQL, or RPC) to interact with the
   engine.
   B. Validation Strategy
   To keep the engine truly dynamic, avoid hardcoding field-specific validation rules (like if (age <
   18)) directly in your application code. Instead, let your form configuration define the validation
   rules, and use a flexible validation engine or library to parse and run those rules dynamically at
   runtime.
   Full-Stack Developer Technical Assessment · Page 3
   C. Frontend
   Because this assessment evaluates full-stack ability, include a minimal frontend that
   demonstrates the engine end-to-end:
   • Fetch a form configuration and dynamically render its fields (you do not need a
   drag-and-drop form designer — rendering a stored configuration is enough).
   • Let a user fill in and submit the form, surfacing validation errors clearly.
   • Handle and display loading, error, and success states.
4. Tech Stack Flexibility
   You are free to choose the technologies you are most comfortable with, provided they support
   clean, maintainable, modern code:
   • Language: Node.js (TypeScript), Go, Python, or similar.
   • Frontend: any modern framework you are comfortable with (React, Vue, Svelte, etc.).
   • Database: any database that can comfortably handle dynamic schemas and structured
   relationships.
   • Setup: provide a containerised setup (e.g. a simple docker-compose.yml) or a
   straightforward script so we can easily spin up and test your environment locally, in
   addition to the hosted deployment.
5. Trade-off Analysis (in your README)
   Rather than a live session, document your thinking in the README. Be ready to explain:
   • Design decisions — your database schema choice, routing structure, and validation
   strategy.
   • Implementation details — your error handling and how your code guarantees data
   consistency and historical integrity (e.g. how a stored submission stays valid against the
   configuration version that produced it).
   • Trade-offs — the architectural trade-offs you made within this short exercise, and how
   you would scale this engine in a production-ready cloud environment.
