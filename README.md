# FORGE AI

> **The Unified AI Career & Content Platform**

Enterprise-grade SaaS platform for AI-powered presentations, resume analysis, career coaching, interview preparation, and professional document generation.

---

## 🏗 Architecture

```
forge-ai/
├── apps/
│   ├── web/          → Next.js 15 (App Router, TypeScript, Tailwind CSS)
│   └── api/          → Spring Boot 3 (Java 21, MongoDB, Redis, RabbitMQ)
├── infrastructure/
│   ├── docker/       → Docker Compose, Nginx, Prometheus, Grafana
│   └── k8s/          → Kubernetes manifests (future)
└── .github/          → CI/CD pipelines
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Java 21 (JDK)
- Docker & Docker Compose

### 1. Start Infrastructure
```bash
npm run docker:up
```
This starts MongoDB, Redis, RabbitMQ, Prometheus, Grafana, and Nginx.

### 2. Start Frontend
```bash
cd apps/web
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### 3. Start Backend
```bash
cd apps/api
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```
API available at [http://localhost:8080/api/docs](http://localhost:8080/api/docs) (Swagger)

## 🧩 Modules

| Module | Description |
|--------|-------------|
| **AI Presentations** | Generate slide decks from prompts, PDFs, YouTube, etc. |
| **Resume Analyzer** | ATS scoring, keyword analysis, improvement suggestions |
| **Resume Builder** | Create resumes from scratch with AI and templates |
| **Job Matching** | Match your resume to job postings with skill gap analysis |
| **Interview Prep** | AI-powered mock interviews (technical, HR, behavioral) |
| **Career Copilot** | Career roadmaps, learning paths, salary insights |
| **Document Suite** | Generate SOPs, cover letters, LORs, LinkedIn summaries |
| **Research Assistant** | Research topics, summaries, mind maps |

## 🛠 Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, Shadcn UI, Framer Motion, React Query, Zustand
- **Backend**: Spring Boot 3, Java 21, Spring Security, JWT, OAuth2
- **Database**: MongoDB 7
- **Cache**: Redis 7
- **Queue**: RabbitMQ 3
- **AI**: Groq → Gemini → OpenAI → Claude (priority-based fallback)
- **Infra**: Docker, Kubernetes-ready, Nginx, GitHub Actions

## 📝 License

Private — All rights reserved.
