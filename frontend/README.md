This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


HobbyHub — Full Codebase Analysis
What is it?
HobbyHub is a full-stack education and hobby discovery platform. Students find hobbies, take lessons from teachers, shop for products, join events, blog, chat, and earn certificates. Multiple user roles (student, teacher, seller, parent, admin, scholarship_giver) each have dedicated dashboards.

Tech Stack
Backend
Layer	Technology	Why
Runtime	Node.js (ESM)	JavaScript on the server
Framework	Express v5	HTTP routing and middleware
Language	TypeScript (via tsx + nodemon)	Type safety in dev, no build step needed
Database	PostgreSQL	Relational data with Prisma
ORM	Prisma v5	Type-safe DB access, migrations
Auth	JWT (jsonwebtoken) + bcrypt	Stateless token auth, password hashing
OAuth	Passport.js + passport-google-oauth20	Google sign-in
Real-time	Socket.io v4	Live chat/messaging
Email	Nodemailer (Gmail SMTP)	Verification + password reset emails
Video	Daily.co (@daily-co/daily-js)	Video call support
Payments	Chapa (via axios)	Ethiopian payment gateway
File Upload	Multer	Image/file uploads
Security	Helmet, express-rate-limit, express-validator	Headers, rate limiting, input validation
Sessions	express-session	Required for Passport OAuth flow
Frontend
Layer	Technology	Why
Framework	Next.js 16 (App Router)	SSR, routing, layouts
Language	TypeScript	Type safety
Styling	Tailwind CSS v4	Utility-first CSS
Components	shadcn/ui + Radix UI	Accessible headless components
Data Fetching	TanStack React Query v5	Server state, caching, invalidation
HTTP Client	Axios (with interceptors)	API calls with auto-token injection
Forms	React Hook Form + Zod	Form state + schema validation
i18n	next-intl	English + Amharic (አማርኛ)
Real-time	socket.io-client	Live chat
Themes	next-themes	Dark/light mode
Toast	Sonner	Notification toasts
Icons	Lucide React	Icon library
Fonts	Inter + Poppins (Google Fonts)	Modern typography
Folder Structure

hobbieshub/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          ← Database schema (35+ models)
│   ├── src/
│   │   ├── index.ts               ← App entry: Express setup + Socket.io
│   │   ├── controllers/           ← 29 controller files (Business logic isolated here)
│   │   ├── lib/
│   │   │   └── prisma.ts          ← Singleton Prisma client
│   │   ├── middleware/
│   │   │   └── auth.ts            ← JWT verification + role guards
│   │   ├── routes/                ← 29 route files (one per feature)
│   │   │   ├── auth.ts            ← Register, login, email verify
│   │   │   ├── admin.ts           ← Admin controls
│   │   │   ├── teacher.ts         ← Teacher lesson + student management
│   │   │   ├── marketplace.ts     ← Products CRUD
│   │   │   ├── lesson.ts          ← Lessons + registrations
│   │   │   ├── chat.ts            ← Message history
│   │   │   ├── quiz.ts            ← Hobby quiz system
│   │   │   ├── scholarship.ts     ← Scholarships
│   │   │   ├── event-posts.ts     ← Talent events (community posts)
│   │   │   └── ...17 more
│   │   └── services/
│   │       ├── email.ts           ← Nodemailer (verification + reset)
│   │       ├── payment.ts         ← Chapa payment integration
│   │       └── video.ts           ← Daily.co video rooms
│   └── uploads/                   ← Static file storage (images, files)
│
└── frontend/
    ├── app/
    │   ├── layout.tsx             ← Root layout (minimal shell)
    │   └── [locale]/              ← i18n routing (en, am)
    │       ├── layout.tsx         ← Locale layout: wraps all providers
    │       ├── page.tsx           ← Landing page
    │       ├── (auth)/            ← Route group: login, register
    │       ├── (dashboard)/       ← Student dashboard + lesson view
    │       ├── teacher/           ← Teacher dashboard
    │       ├── admin/             ← Admin panel
    │       ├── seller/            ← Seller dashboard
    │       ├── parent/            ← Parent dashboard
    │       ├── scholarship-giver/ ← Scholarship giver dashboard
    │       ├── shops/             ← Marketplace browsing
    │       ├── cart/ checkout/    ← E-commerce flow
    │       ├── lessons/ my-lessons/ ← Lesson browsing + enrollments
    │       ├── hobbies/           ← Hobby discovery
    │       ├── blog/              ← Blog posts
    │       ├── chat/              ← Real-time messaging
    │       ├── events/ talent-events/ ← Events system
    │       ├── quiz/              ← Hobby recommendation quiz
    │       └── ...more pages
    ├── components/
    │   ├── Navbar.tsx             ← Global navigation
    │   ├── VideoCall.tsx          ← Daily.co video component
    │   ├── events/                ← EventPostCard, EventPostForm
    │   └── ui/                    ← shadcn/ui components
    ├── providers/
    │   ├── auth-provider.tsx      ← Auth context (login/logout/register)
    │   ├── query-provider.tsx     ← React Query client setup
    │   └── theme-provider.tsx     ← Dark/light mode
    ├── lib/
    │   ├── api.ts                 ← Axios instance with auto-auth interceptors
    │   └── utils.ts               ← Tailwind cn() helper
    ├── i18n/
    │   └── routing.ts             ← Locale config (en, am)
    └── middleware.ts              ← next-intl route matching
How the Flow Works
1. Request enters the app

Browser/App
    │
    ▼
Next.js middleware.ts
    │  (matches all non-API routes, applies i18n locale prefix)
    ▼
app/[locale]/layout.tsx
    │  Wraps everything in:
    │    NextIntlClientProvider (translations)
    │    ThemeProvider (dark/light)
    │    QueryProvider (React Query)
    │    AuthProvider (login state)
    ▼
Page Component
2. Auth flow (Login)

User fills login form
    │
    ▼
AuthProvider.login() → POST /api/auth/login
    │
Backend:
    ├─ Validates input (express-validator)
    ├─ Checks rate limit (10 attempts / 15min)
    ├─ Fetches user from Prisma
    ├─ Verifies bcrypt password
    ├─ Determines primary role (admin > teacher > seller > scholarship_giver > parent > student)
    ├─ Signs JWT (7d expiry) with { userId, email, role }
    ├─ Records login attempt
    └─ Returns { token, user }
    │
Frontend:
    ├─ Stores token in localStorage
    ├─ Sets axios default Authorization header
    ├─ Sets user in React state
    └─ Redirects based on role:
          admin → /admin
          teacher → /teacher
          seller → /seller
          parent → /parent
          scholarship_giver → /scholarship-giver
          student → /dashboard
3. Protected API call

Component calls api.get('/teacher/lessons')
    │
Axios interceptor injects: Authorization: Bearer <token>
    │
Express backend:
    ├─ authenticateToken() middleware verifies JWT
    ├─ Attaches req.user = { userId, email, role }
    ├─ requireRole(['teacher']) checks DB for user roles
    └─ Controller queries Prisma → returns data
    │
React Query caches response, component renders
4. Real-time chat (Socket.io)

Frontend connects: socket = io(url, { auth: { token } })
    │
Backend io.use() middleware verifies JWT
    │
User joins room: socket.emit('join-room', `user-${userId}`)
    │
Send message: socket.emit('send-message', { roomId, message, receiverId })
    │
Backend:
    ├─ Saves message to Prisma (Message model)
    ├─ io.to(`user-${receiverId}`).emit('new-message', savedMsg)
    └─ socket.emit('message-sent', savedMsg)
5. File uploads

Frontend: POST multipart/form-data to /api/upload/...
    │
Multer middleware processes file
    │
Saves to /uploads/<folder>/<filename>
    │
Returns URL: http://localhost:5001/uploads/products/<filename>
    │
Frontend renders image via <img src={url} />
Static files served at /uploads with cross-origin headers
Database Schema (35+ models, grouped)
Group	Models
Users & Accounts	User, Profile, Role, UserRole
Security	EmailVerification, PasswordReset, LoginAttempt
Hobbies & Learning	Hobby, HobbyCategory, UserHobby, Lesson, LessonRegistration
Marketplace	Product, ProductCategory, CartItem, Order, OrderItem, ProductReview
Blog	BlogPost, BlogComment, BlogLike
Events & Scholarships	Event, EventRegistration, Scholarship, ScholarshipApplication
Chat	Message
Quiz & Recommendations	QuizQuestion, QuizResult, QuizAnswer, StudentRecommendation
Certificates	CertificateTemplate, Certificate
Resources	Resource
Talent Events	EventPost, EventPostComment, EventPostLike, TalentEventRegistration
Is This a Good Approach?
✅ What's Good
Thing	Why it's good
Prisma ORM	Auto-generated types, safe migrations, clean query API
Role-based routing	Each role gets its own dashboard — clean separation
MVC Architecture	Business logic is decoupled into the controllers layer — easy to test and maintain
React Query	Smart caching, invalidation, loading states — no manual fetch state
Auth interceptor in Axios	Token injected automatically — no repeated code
Zod + React Hook Form	Type-safe form validation on the frontend
next-intl	i18n done at the routing level — scalable
Socket.io for chat	Good fit for real-time messaging
Rate limiting + Helmet	Basic security is in place
Email verification	Accounts are verified before activation
⚠️ Things to Improve
Issue	Impact	Fix
Tokens in localStorage	XSS can steal tokens	Move to httpOnly cookies
alert() in teacher page	Breaks dark mode, not mobile-friendly	Replace with toast() from Sonner
Hardcoded localhost URLs	Won't work in production	Use env variables everywhere
No input sanitization on file upload	Potential path traversal	Use UUID filenames, validate MIME types
Single JWT role	A user with 2 roles gets only 1 in token	Store roles array in token or always look up DB
No refresh tokens	7-day token can't be revoked	Add refresh token rotation
No API versioning	Breaking changes affect all clients	Prefix routes with /api/v1/
Password reset via insecure token	Uses Math.random()	Use crypto.randomBytes()
🏗️ Overall Assessment
This is a solid MVP with a good feature breadth — the architecture is clear, the tech choices are modern and appropriate, the role-based system works well, and the recent backend MVC refactoring makes the code much cleaner and easier to scale. The main weaknesses remaining are security shortcuts (localStorage tokens, Math.random()). For production, those items need addressing.

