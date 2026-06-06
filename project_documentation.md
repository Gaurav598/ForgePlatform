# FORGE AI: Complete Engineering Documentation & Project Analysis

## 1. Executive Summary

### What problem this project solves
**FORGE AI** is an Enterprise-grade SaaS platform designed to solve the fragmented nature of career development, interview preparation, and professional content generation. Professionals and job seekers typically use multiple disparate tools to build resumes, analyze ATS compatibility, prepare for interviews, and generate presentation decks. Forge AI unifies these capabilities into a single, AI-powered platform.

### Target Users
* **Job Seekers:** Looking to optimize resumes, practice interviews, and find skill gaps.
* **Professionals/Employees:** Needing to generate rapid presentations, SOPs, and professional documents.
* **Students/Recent Graduates:** Needing career roadmaps, learning paths, and entry-level guidance.
* **Enterprise Teams:** (Via TEAM/ENTERPRISE plans) for collaborative document generation and standardized presentations.

### Main Business Goals
* Provide a unified subscription-based platform (Freemium model with FREE, PRO, TEAM, ENTERPRISE tiers).
* Reduce time-to-creation for professional assets (presentations, resumes).
* Improve user career outcomes through AI-driven coaching and ATS optimization.

### Core Features
* **AI Presentations:** Generate slide decks from prompts, PDFs, YouTube, URLs, or notes.
* **Resume Analyzer & Builder:** ATS scoring, keyword analysis, and AI-assisted resume creation.
* **Interview Prep & Career Copilot:** Mock interviews and career roadmaps.
* **Document Suite & Research Assistant:** Generation of cover letters, SOPs, and summaries.

### High-level Architecture Overview
The system employs a **Microservices-ready Monorepo Architecture** utilizing `pnpm` workspaces.
* **Frontend (`apps/web`):** Built with Next.js 15 (App Router), TypeScript, and Tailwind CSS. State is managed via Zustand and React Query.
* **Backend (`apps/api`):** Built with Java 21 and Spring Boot 3. It utilizes Spring Security (JWT), MongoDB for document storage, Redis for caching, and RabbitMQ for message queuing.
* **AI Orchestration:** A custom Java-based orchestrator that routes requests across multiple LLMs (Groq → Gemini → OpenAI → Claude) with fallback and retry mechanisms.
* **Infrastructure:** Dockerized environment orchestrated via Docker Compose for development, with Kubernetes manifests planned/ready for production.

---

## 2. Folder Structure Analysis

```text
forge-ai/
├── apps/
│   ├── api/
│   │   ├── src/main/java/com/forgeai/
│   │   │   ├── ai/            # AI Orchestration and LLM provider logic
│   │   │   ├── auth/          # Authentication, User Models, JWT filters
│   │   │   ├── common/        # Global exceptions, generic API responses
│   │   │   ├── config/        # Spring configuration (Mongo, Redis, Security, WS)
│   │   │   ├── presentation/  # Presentation generation logic & models
│   │   │   └── resume/        # Resume parsing, building, and analysis logic
│   │   └── pom.xml            # Maven dependencies
│   └── web/
│       ├── src/
│       │   ├── app/           # Next.js App Router (pages, layouts, globals.css)
│       │   ├── components/    # Reusable UI components (Shadcn), layout shells
│       │   └── lib/           # Zustand stores, API clients, utilities
│       ├── package.json       # Web dependencies
│       └── tailwind.config.ts # Styling configuration
├── infrastructure/
│   ├── docker/                # Docker Compose, Nginx config, Prometheus config
│   └── k8s/                   # Kubernetes deployment manifests
├── .github/                   # CI/CD pipeline definitions
└── package.json               # Root monorepo configuration
```

### `apps/api/` (Backend)
* **Purpose:** Serves as the core business logic and data access layer.
* **Responsibilities:** Handling RESTful API requests, communicating with AI providers, managing database transactions, handling authentication/authorization.
* **Interaction:** Called by `apps/web` via HTTP/REST; communicates with external AI APIs; reads/writes to MongoDB and Redis.

### `apps/web/` (Frontend)
* **Purpose:** The user-facing application.
* **Responsibilities:** Rendering UI, managing client state, handling user input, routing, and displaying AI-generated results.
* **Interaction:** Fetches data from `apps/api`. Uses Next.js server components where applicable and client components for interactive states.

### `infrastructure/`
* **Purpose:** Environment provisioning and deployment.
* **Responsibilities:** Defining container configurations, reverse proxies (Nginx), monitoring (Prometheus/Grafana).
* **Interaction:** Wraps both `api` and `web` into deployable containers.

---

## 3. Project Architecture

### Overall Architecture Pattern
**Decoupled Client-Server (Monolithic Backend within a Monorepo)**
While the repository is structured as a monorepo, the backend currently operates as a modular monolith. It is "Microservices-ready" due to clear package boundaries (`auth`, `resume`, `presentation`, `ai`), but deployed as a single Spring Boot application.

### Layered Architecture (Backend)
The backend strictly follows a **Layered (N-Tier) Architecture** combined with **Feature-based Packaging**:
* **Controller Layer:** Handles HTTP requests and response formatting.
* **Service Layer:** Contains core business logic and cross-module orchestration (e.g., `AIOrchestrator`).
* **Repository Layer:** Interfaces with MongoDB using Spring Data MongoDB.
* **Model/DTO Layer:** Defines data structures.

### Why this architecture was chosen?
* **Next.js App Router:** Excellent for SEO (where needed) and fast initial page loads via Server Components.
* **Spring Boot 3 + Java 21:** Provides enterprise-grade reliability, multi-threading (Virtual Threads in Java 21 are excellent for high I/O AI API calls), and strict typing.
* **Modular Monolith:** Easier to deploy and manage for a startup/V1 product than full microservices, but clean boundaries allow easy splitting in the future.

### Architecture Flow

```text
Client (Browser)
       ↓ (HTTP/REST or WebSocket)
Nginx (Reverse Proxy / API Gateway - Port 80)
       ↓
Next.js Server (Port 3000)  <-- OR --> Spring Boot API (Port 8080)
       ↓                                    ↓
React Components                      Controllers (@RestController)
       ↓                                    ↓
Zustand / React Query                 Services (@Service)
                                            ↓
               ┌────────────────────────────┼────────────────────────────┐
               ↓                            ↓                            ↓
         MongoDB (Port 27017)        Redis (Port 6379)         RabbitMQ (Port 5672)
         (Persistent Data)           (Caching / Sessions)      (Async Tasks / Queues)
                                            ↓
                                     AIOrchestrator
                                            ↓
                           External LLMs (Groq, Gemini, OpenAI, Claude)
```

---

## 4. Request Lifecycle

**Example: Generate AI Presentation Request**

1. **Client Interaction:** User fills out the presentation prompt on `/dashboard/presentations/new` and clicks "Generate".
2. **Frontend API Call:** Next.js client code (via `lib/api.ts` or React Query) makes a `POST /api/v1/presentations/generate` request.
3. **Gateway/Proxy:** Request passes through Nginx to the Spring Boot API.
4. **Security Filter:** `JwtAuthFilter` intercepts the request, validates the JWT from the `Authorization` header, and sets the SecurityContext with the User ID.
5. **Controller Layer:** `PresentationController` receives the `PresentationDto` payload, validates it (`@Valid`), and passes it to `PresentationService`.
6. **Business Logic (Service):**
   * `PresentationService` creates a `Presentation` document in MongoDB with status `GENERATING`.
   * It constructs an `AIRequest` and calls `AIOrchestrator.generate()`.
7. **AI Orchestration:**
   * `AIOrchestrator` attempts the highest priority AI provider (e.g., Groq).
   * If Groq rate-limits or fails, it catches the exception and falls back to Gemini.
8. **Data Persistence:** The generated slide JSON is returned, mapped to `Presentation.Slide` objects, and the MongoDB document is updated to `COMPLETED`.
9. **Response:** Controller wraps the result in `ApiResponse.ok()` and returns HTTP 200 OK.
10. **Frontend State Update:** React Query caches the new presentation, Zustand might update a global list, and the user is redirected to the presentation viewer.

---

## 5. Database Analysis

The project uses **MongoDB 7**.

### 1. `users` Collection
* **Purpose:** Stores user profiles, authentication data, and subscription tiers.
* **Fields:** `id`, `email`, `passwordHash`, `name`, `avatar`, `role` (USER, ADMIN), `plan` (FREE, PRO), `oauth` (Map), `mfa`, `preferences`, `createdAt`, `lastLoginAt`.
* **Indexes:** Unique index on `email`.

### 2. `resumes` Collection
* **Purpose:** Stores uploaded resumes, AI parsed data, and builder-generated resumes.
* **Fields:** `id`, `userId`, `title`, `filePath`, `fileType`, `parsedData` (Nested Object containing experience, education, skills), `isBuilderCreated`, `createdAt`.
* **Indexes:** Compound index `idx_user_created` (`userId`: 1, `createdAt`: -1) for fast retrieval of a user's resumes ordered by date.

### 3. `presentations` Collection
* **Purpose:** Stores generated slide decks.
* **Fields:** `id`, `userId`, `title`, `prompt`, `sourceType` (PROMPT, PDF, YOUTUBE), `status` (DRAFT, GENERATING, COMPLETED), `slides` (List of Slide objects), `createdAt`.
* **Indexes:** Compound index `idx_user_created` (`userId`: 1, `createdAt`: -1).

### 4. `refresh_tokens` Collection (Implicit via Repository)
* **Purpose:** Manages long-lived sessions.

### ER Diagram Explanation (Conceptual)
* `User` (1) ----> (N) `Resume` (Linked by `userId`)
* `User` (1) ----> (N) `Presentation` (Linked by `userId`)
* `User` (1) ----> (N) `RefreshToken` (Linked by `userId`)

Since it's MongoDB (NoSQL), "relations" are handled via manual referencing (`userId` string field) rather than strict foreign keys. Heavy entities like `Slides` and `ParsedData` are embedded directly within their parent documents (`Presentation` and `Resume`) to optimize read performance.

---

## 6. API Documentation

### Auth Module (`/api/v1/auth`)

#### 1. Register User
* **Method:** `POST /api/v1/auth/register`
* **Purpose:** Creates a new user account.
* **Request Body:** `{ "email": "user@example.com", "password": "SecurePass123!", "name": "John Doe" }`
* **Response:** `ApiResponse<AuthResponse>` containing JWT `accessToken`, `refreshToken`, and user info.
* **Auth Required:** No.

#### 2. Login
* **Method:** `POST /api/v1/auth/login`
* **Request Body:** `{ "email": "user@example.com", "password": "SecurePass123!" }`
* **Response:** `ApiResponse<AuthResponse>`

#### 3. Get Current User
* **Method:** `GET /api/v1/auth/me`
* **Auth Required:** Yes (Bearer Token).
* **Response:** User profile details, current plan, and preferences.

*(Additional endpoints exist for Resume, AI Generation, and Presentations following standard REST patterns: GET for listing, POST for creation, PATCH for updates, DELETE for removal. All return a standardized `ApiResponse<T>` envelope).*

---

## 7. Authentication & Authorization

### Flow Overview
The application uses **Stateless JWT Authentication** with short-lived Access Tokens and long-lived Refresh Tokens.

1. **Login Flow:** User provides credentials. Spring Security authenticates via `AuthenticationManager`. `JwtService` generates an Access Token (e.g., 15 mins) and a Refresh Token (e.g., 7 days). The Refresh token is saved in the database.
2. **Access Flow:** Client sends Access Token in the `Authorization: Bearer <token>` header. `JwtAuthFilter` extracts it, validates the signature, and sets the Spring `SecurityContext`.
3. **Refresh Flow:** When the Access Token expires, the client calls `POST /api/v1/auth/refresh` with the Refresh Token to get a new Access Token.
4. **Logout Flow:** Client calls `POST /api/v1/auth/logout`. Backend deletes the Refresh Token from the DB, invalidating the session.

### Security Mechanisms
* **Passwords:** Hashed using BCrypt.
* **Roles (RBAC):** Users have roles (`USER`, `ADMIN`, `TEAM_ADMIN`). Method-level security (`@PreAuthorize`) can restrict access to specific controller methods.
* **MFA:** Built-in support for Multi-Factor Authentication (OTP/Authenticator app) via the `MfaConfig` nested object in the User model.

---

## 8. Frontend Analysis

### Structure
* `src/app/`: Uses Next.js App Router.
  * `/dashboard/*`: Protected routes for core features (resumes, presentations, career).
  * `/login`, `/register`: Public auth routes.
* `src/components/ui/`: Reusable, accessible components built with **Radix UI** and **Tailwind CSS** (Shadcn UI approach).
* `src/components/layout/`: Navbar, Footer, Sidebar.
* `src/lib/stores/`: **Zustand** stores for global state (e.g., `auth-store.ts`).

### Architecture
* **State Management:** Zustand for synchronous client state (UI toggles, user session cache). **React Query** (`@tanstack/react-query`) for asynchronous server state (data fetching, caching, mutations).
* **Styling:** Tailwind CSS with `next-themes` for Dark/Light mode toggling. `clsx` and `tailwind-merge` used for dynamic class composition.
* **Forms:** Handled via `react-hook-form` and validated using `zod`.

### Major Component Example: `ThemeToggle`
* **Responsibility:** Switches between light, dark, and system themes.
* **State:** Reads from `next-themes` hook `useTheme`.
* **Flow:** Dropdown menu triggers `setTheme()`, instantly applying `.dark` class to the HTML root.

---

## 9. Backend Analysis

### Core Layers
* **Controllers:** e.g., `AuthController.java`. Light-weight, focused entirely on HTTP routing, Swagger annotations (`@Operation`), and request validation (`@Valid`).
* **Services:** e.g., `AuthService.java`. Heavy lifters. Encapsulate database interactions and complex logic.
* **Repositories:** Extends `MongoRepository`. Provides out-of-the-box CRUD and custom query derivation.
* **DTOs:** Data Transfer Objects (e.g., `AuthDto`). Completely isolates internal database models (`User.java`) from the API surface.

### Noteworthy Module: Common Exception Handling
* `GlobalExceptionHandler.java`: A `@ControllerAdvice` class that catches `ResourceNotFoundException`, Validation errors, and Security exceptions globally, returning a consistent JSON structure using `ApiResponse.error()`.

---

## 10. AI Features Analysis

### AI Orchestrator (`com.forgeai.ai.service.AIOrchestrator`)
This is the crown jewel of the backend architecture.

* **Purpose:** Ensures high availability and cost-efficiency for AI requests.
* **Design:** Uses the **Strategy Pattern** combined with a Priority Chain.
* **Flow:**
  1. Implements `AIProvider` interfaces (`GeminiProvider`, `GroqProvider`, etc.).
  2. Orchestrator sorts providers by priority (e.g., Groq (fastest/cheapest) -> Gemini -> OpenAI -> Claude).
  3. When `generate()` is called, it tries the highest priority provider.
  4. If an exception occurs (e.g., Rate Limit, Server Error), it uses exponential backoff to retry.
  5. If max retries fail, it gracefully fails over to the next provider in the chain.
* **Metrics:** Tracks `latencyMs`, `totalTokens`, and provider used, returning this metadata to the client.

---

## 11. DevOps & Deployment

* **Docker Setup:** `infrastructure/docker/docker-compose.yml` defines the local development and potentially single-node production environment.
  * Includes MongoDB, Redis, RabbitMQ.
  * Includes **Prometheus** (metrics scraping) and **Grafana** (visualization) out of the box.
  * Includes **Nginx** as a reverse proxy.
* **CI/CD:** Handled via GitHub Actions (`.github/workflows/ci.yml`). Likely runs `npm run lint`, `npm run type-check`, Maven tests, and Docker builds.
* **Kubernetes:** `infrastructure/k8s/deployment.yml` suggests the application is architected for enterprise-scale horizontal scaling.

---

## 12. Security Review

### Strengths
* Uses robust JWT architecture with explicit Refresh Token rotation/revocation.
* Passwords hashed securely.
* Next.js App Router protects API keys (server-side only execution).

### Risks & Vulnerabilities
* **Rate Limiting (Missing):** AI endpoints (`/api/v1/presentations/generate`) are highly susceptible to cost-exhaustion attacks. Must implement Redis-based rate limiting per user.
* **Data Privacy:** Storing parsed resume data and presentations requires strict Tenant Isolation (ensuring `userId` matches the authenticated context on every repository query).

### Recommendations
* Implement a Web Application Firewall (WAF) to protect against basic injection and DDoS.
* Ensure MongoDB is not exposed to the public internet (currently mapped to `27017` in docker-compose, should be isolated in production).
* Implement strict Input Validation (via Zod/Spring Validation) to prevent Prompt Injection attacks on the AI Orchestrator.

---

## 13. Performance Analysis

* **Bottlenecks:** LLM API latency is the primary bottleneck.
* **Caching Opportunities:**
  * **Redis:** Should be used to cache identical AI prompts (Semantic caching) or frequently accessed user profiles.
* **Database Optimization:** MongoDB compound indexes (`idx_user_created`) are correctly configured for efficient querying.
* **Frontend:** Turbopack and Next.js Server Components ensure minimal JS bundle size sent to the client.

---

## 14. Design Patterns Used

* **Strategy Pattern:** Used in `AIOrchestrator` to switch between different `AIProvider` implementations dynamically.
* **Chain of Responsibility / Fallback:** The AI Orchestrator tries providers sequentially until one succeeds.
* **Repository Pattern:** Spring Data MongoDB abstracts data access logic away from business services.
* **Data Transfer Object (DTO):** Strict separation of domain models from API contracts.
* **Singleton:** Spring `@Service` and `@RestController` beans are singletons by default.

---

## 15. Complete Feature Flow: AI Presentation Generation

### Purpose
Generate a structured slide deck from a simple text prompt.

### Flow
1. **Frontend:** User types "History of AI" in `/dashboard/presentations/new`.
2. **Frontend Component:** React Hook Form validates input. React Query `useMutation` sends POST request.
3. **API Call:** hits `PresentationController.createPresentation()`.
4. **Backend Module:** `PresentationService` saves a "DRAFT" or "GENERATING" document in MongoDB.
5. **Business Logic:** `PresentationService` builds a strict system prompt demanding a specific JSON schema for slides.
6. **AI Orchestrator:** Sends prompt to Groq. Groq returns JSON string representing 10 slides.
7. **Processing:** Backend parses JSON, maps to `Slide` objects, saves to MongoDB.
8. **Output:** Backend returns HTTP 200. Frontend redirects to `/dashboard/presentations/{id}` and renders the slides.

---

## 16. Interview Preparation Section

### Beginner Questions
**Q:** What is the difference between `dependencies` and `devDependencies` in your `package.json`?
**A:** `dependencies` are required for the application to run in production (e.g., React, Next.js). `devDependencies` are only needed during development and build processes (e.g., TypeScript, ESLint, Tailwind).

### Intermediate Questions
**Q:** How does your authentication system handle token expiration?
**A:** I implemented a dual-token system. A short-lived JWT Access Token is used for stateless authentication on every request. When it expires, the client sends a long-lived Refresh Token stored securely to the `/refresh` endpoint to obtain a new Access Token. If the Refresh Token is revoked or expired, the user must log in again.

### Advanced Questions
**Q:** Explain how your `AIOrchestrator` achieves high availability.
**A:** It uses a Strategy pattern combined with a fallback mechanism. It holds a list of AI providers sorted by priority (cost/speed). If a primary provider like Groq fails or rate-limits, the orchestrator catches the exception, applies exponential backoff, and if retries fail, seamlessly routes the exact same prompt to the next provider, like Gemini, ensuring the user always gets a response.

### System Design Questions
**Q:** If your platform suddenly gets 10,000 concurrent users generating resumes, how does this architecture handle it?
**A:** Currently, the API is synchronous. To handle massive scale, I would shift to an asynchronous event-driven model. The API would immediately return a `job_id`, push the generation task to RabbitMQ, and a pool of worker nodes would process the AI requests. The frontend would use WebSockets or Polling to update the UI when the job completes.

---

## 17. Resume Explanation Section

**How to list this on a Resume:**
> **Software Engineer | Forge AI (Full-Stack Enterprise Platform)**
> * Designed and developed a microservices-ready monorepo platform using Next.js 15, Spring Boot 3, and MongoDB to unify AI career tools.
> * Engineered an intelligent `AIOrchestrator` with automatic fallback and exponential backoff across 4 LLM providers (Groq, Gemini, OpenAI, Claude), ensuring 99.9% uptime for AI generations.
> * Implemented secure, stateless JWT authentication with refresh token rotation and integrated Redis for caching and session management.
> * Configured a complete Dockerized infrastructure including Nginx, Prometheus, and Grafana for local deployment and observability.

**Talking Points for HR/Technical Rounds:**
* Emphasize the **resilience** of your AI Orchestrator (companies love reliability).
* Highlight the **clean architecture** (Separation of Concerns via DTOs, Controllers, Services).
* Mention your focus on **Observability** (Prometheus/Grafana).

---

## 18. Project Strengths

* **Enterprise-Grade Stack:** Spring Boot 3 + Next.js 15 is a highly respected, scalable combination.
* **Fault Tolerance:** The AI Fallback mechanism is a senior-level architectural decision. It shows you understand that external APIs fail.
* **Observability Built-in:** Including Prometheus and Grafana in the Docker compose shows you understand day-two operations and production monitoring.
* **Clean Code:** Use of Lombok, DTOs, and global exception handlers demonstrates a strong grasp of Java best practices.

---

## 19. Project Weaknesses

* **Synchronous AI Calls:** Waiting for an LLM to generate 20 slides in a single HTTP request will lead to timeouts. This needs to be moved to async processing via RabbitMQ (which is already in the stack but seemingly underutilized for AI generation).
* **Missing Rate Limiting:** Exposing LLMs without strict IP or User-based rate limiting via Redis is a massive financial security risk.
* **Cost Management:** Storing large AI responses and documents in MongoDB can get expensive; object storage (AWS S3) should be used for raw files (`.pdf` resumes).

---

## 20. Final Engineering Review

* **Rating:** 8.5 / 10
* **Resume Value:** Extremely High. Hits modern buzzwords (AI, Next.js 15, Java 21) while demonstrating core engineering fundamentals (Fallbacks, Caching, Docker).
* **Internship Value:** Overqualified. This project demonstrates mid-to-senior level architectural thinking.
* **Placement/FAANG Value:** Excellent discussion piece for System Design rounds.
* **Production Readiness:** 7/10. Needs rate limiting, async processing for long AI tasks, and migration of file storage to S3 before going live.

**Verdict:**
This is an exceptional portfolio project. It moves beyond a simple "CRUD app wrapper around an API key" and addresses real-world engineering problems: what happens when an API goes down? How do we monitor the system? How do we decouple the frontend from the backend? By solving these issues through the AI Orchestrator, JWT architecture, and Dockerized observability, you demonstrate that you are ready for a serious Software Engineering role.
