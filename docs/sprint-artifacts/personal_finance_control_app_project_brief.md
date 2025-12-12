# Personal Finance Control App — Project Brief

## 1. Executive Summary
Personal Finance Control is a user-friendly SaaS/mobile app that helps individuals manage income, expenses, budgets, savings goals, and investments with clarity and minimal friction. The product emphasizes automated transaction categorization, goal-driven budgeting, visual analytics, and actionable insights. The service will use Supabase MCP as the managed backend platform for data, auth, storage, realtime sync, and edge functions.

## 2. Target Users & Personas
- **Young Professional (Early career)**: Wants a simple app to track salary, recurring bills, and save for short-term goals. Prefers mobile-first interfaces.
- **Student / Budget-Conscious User**: Needs tight expense control, notifications for overspending, and guidance on saving.
- **Side Hustler / Freelancer**: Tracks multiple income streams, invoices, and tax-deductible expenses.
- **Savvy Investor (advanced)**: Uses app for net worth tracking, integration with investment accounts, and portfolio snapshots.

## 3. Key Problems to Solve
- Difficulty maintaining a consistent budgeting habit.
- Time-consuming manual categorization of transactions.
- Lack of clear actionable insights to reach savings or debt-reduction goals.
- Fragmented financial data across multiple accounts.

## 4. Core Features (MVP)
1. **Accounts & Transactions**
   - Manual transaction entry, CSV import, and integration with select bank aggregation partners (future).
   - Auto-categorization with user-correctable rules.
2. **Budgets & Goals**
   - Create budgets for categories with alerts and soft/strict limits.
   - Savings goals with projected timelines.
3. **Dashboard & Analytics**
   - Net worth summary, cashflow timeline, category spend visualization, recurring payment calendar.
4. **Smart Insights & Suggestions**
   - Monthly spending summary, overspend alerts, and simple recommendations (e.g., move \$X to savings).
5. **Recurring Transactions & Bills**
   - Manage subscriptions and upcoming bills; notify users before due dates.
6. **Export & Reports**
   - CSV export, periodic statements, tax-ready reports (basic).
7. **Security & Access**
   - Authentication, role-based access (household), encrypted data at rest and in transit.

## 5. Secondary Features (Post-MVP)
- Shared household budgets and multi-user expense sharing (high priority; strong demand from couples/roommates).
- Receipt capture (image OCR) and auto-match transactions — **prioritized earlier**, ahead of bank integrations for higher perceived value.
- Bank aggregation (Plaid-like) connectors (lower priority relative to OCR and sharing features).
- Investment account syncs and portfolio analytics.
- AI assistant for budget coaching and personalized recommendations.

## 6. Non-Functional Requirements
 Non-Functional Requirements
- **Privacy & Security**: Encryption in transit and at rest, least privilege access, audit logging, GDPR-ready controls.
- **Scalability**: Multi-tenant architecture with horizontal scaling of API and search services.
- **Performance**: Dashboard load < 500ms for typical user datasets.
- **Availability**: Target 99.9% uptime for core APIs.

## 7. Technical Approach & Supabase MCP Integration
- **Backend Platform**: Supabase MCP (managed) — primary for Postgres DB, Auth (JWT-based), Storage (receipts, exports), Realtime (live dashboard updates), Edge Functions for server-side jobs and integrations.
- **Serverless Functions / Edge**: Use Supabase Edge Functions for scheduled jobs (recurring transactions, notifications), transaction import pipelines, and connectors for third-party APIs.
- **API Layer**: Node.js/TypeScript or Deno (edge compatible) for business logic; REST/GraphQL endpoints.
- **Data Model**: Postgres with well-normalized schemas for users, accounts, transactions, categories, budgets, goals, rules, and audit logs.
- **Background Jobs**: Redis or Supabase-compatible job queue (Edge functions + cron) for heavy processing (OCR, imports, batch categorization).
- **Search & Analytics**: Lightweight analytics powered by SQL + materialized views; for advanced needs consider ClickHouse or analytic DB later.
- **Authentication & Multi-tenancy**: Supabase Auth with JWTs; tenant isolation via row-level security policies in Postgres.
- **Storage**: Supabase Storage for uploaded CSVs and receipts (with signed URLs).

## 8. Data Privacy & Compliance
- Explicit user consent for financial data imports.
- Data retention policy and export/delete user data workflows.
- Do not store raw banking credentials — use secure aggregator tokens where applicable.

## 9. MVP Scope & Success Metrics
**MVP scope**
- Core account/transaction model with manual entry and CSV import
- Auto-categorization with user correction rules
- Budgets, goals, dashboard, recurring transactions
- Supabase-based auth, storage, and scheduled jobs

**Success metrics (first 3 months)**
- 10k signups
- DAU/MAU >= 15%
- Average 30 transactions logged per active user per month
- Monthly active budgets created per user >= 1.2
- NPS >= 25

## 10. Roadmap & Milestones (Quarterly view — Updated with new priorities)
- **Month 0–2**: Core model and auth (Supabase), basic dashboard, transaction entry, budgets, CSV import, RLS policies.
- **Month 2–4**: **Receipt OCR pipeline (high priority)** using Supabase Storage + Edge Functions; auto-match receipts to transactions; recurring transactions; notifications; exports.
- **Month 4–6**: **Shared expenses & household groups (promoted in priority)** — group management, split rules, shared dashboards, realtime sync; finalize OCR improvements.
- **Month 6–9**: Bank connector POC (lower priority after OCR and sharing), advanced analytics, AI coaching assistant, investment tracking POC.

## 11. Risks & Mitigations
. Risks & Mitigations
- **Sensitive financial data handling** — implement strong encryption, access control, and third-party security audits.
- **Bank aggregation complexity** — start with CSV/import and receipts; add connectors after stability.
- **User trust & privacy** — transparent privacy policy and easy data export/delete.

## 12. Next Deliverables I can produce (English)
- Full **PRD (MVP)** with epics, user stories, acceptance criteria, and mockups.
- **High-level architecture diagram** mapped to Supabase MCP components.
- **Sprint backlog** for initial 3 sprints (2-week sprints) and first epic breakdown.
- Example **database schema** and RLS policy snippets for tenant isolation.

---

*Prepared to follow BMAD-METHOD™ greenfield workflow. Supabase MCP integration acknowledged and assumed for backend & infra.*

