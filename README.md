Zenflow — Collaborative Project Management

Zenflow is a lightweight, collaborative project-management SaaS designed for agencies, startups, and small product teams. It provides an easy, flexible way to plan work, invite collaborators, assign tasks, manage budgets, and share multimedia assets, all within a clean, distraction-free interface.

It focuses on clarity, speed, and real-time collaboration for cross-functional teams, wrapped in a minimal "Notion Black" aesthetic.

✅ Core Features

Project & Task Management
- Authentication: Secure JWT-based login and registration system
- Project Management: Full C.R.U.D. (Create, Read, Update, Delete) for projects
- Task Management: Full C.R.U.D. for tasks within projects
- Task Metadata: Assign status, priority, due dates, and pricing to tasks
- Notes System: Add and manage project-level notes
- File Uploads: Attach PDFs, images, and documents to tasks
- Search & Filter: Quickly find tasks by status, priority, or text content

🎨 UI/UX

Notion Black Theme: A pure black (#000000) background for a clean, focused workspace.
Minimal Design: A distraction-free interface that prioritizes content and productivity.
Smooth Animations: Subtle transitions (150-200ms) for a polished feel.
Responsive Layout: A modern sidebar and content panel design that works on desktop and mobile.
Iconography: Clean, modern icons provided by lucide-react.

Color Palette

```css
/* Notion Black Theme */
:root {
  --notion-bg: #000000;        /* Main background */
  --notion-surface: #0b0b0b;   /* Cards, modals */
  --notion-border: #1f1f1f;    /* Borders */
  --notion-text: #ffffff;      /* Primary text */
  --notion-text-muted: #bfc1c5; /* Secondary text */
  --notion-accent: #9aa8ff;    /* Accent color */
}
```

🛠️ Tech Stack

The repository is a monorepo containing two main folders: `backend/` and `frontend/`.

Backend
- Node.js + Express.js — Server framework
- MongoDB + Mongoose — Database and ODM
- JSON Web Tokens (JWT) — Authentication & authorization
- Multer — File upload handling (local dev)
- bcrypt — Password hashing
- express-validator — Input validation

Frontend
- React (Vite) — UI framework
- Tailwind CSS — Styling
- React Router — Navigation
- Axios — HTTP client
- React Context API — Global state management
- Lucide React — Icons

🚀 Quick Start

Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)
- npm or yarn

1. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd zenflow-project

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

2. Environment Configuration

Create a `.env` file in the `backend` directory. Use `backend/.env.development` as a template if present.

Example `backend/.env`:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/zenflow
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

(Note: The frontend `VITE_API_BASE_URL` is typically set in `frontend/.env` or configured in an API utility to point to `http://localhost:5000/api`.)

3. Start Development Servers

Backend (runs on http://localhost:5000):

```bash
# From the /backend directory
npm run dev
```

Frontend (runs on http://localhost:5173):

```bash
# From the /frontend directory
npm run dev
```

📁 Project Structure

```
zenflow-project/
├── backend/
│   ├── models/          # Mongoose schemas (User, Project, Task)
│   ├── routes/          # Express API routes
│   ├── middleware/      # Auth (JWT) and error handling
│   ├── controllers/     # Route logic
│   ├── uploads/         # Local file storage (dev only)
│   └── server.js        # Main server file
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page-level components
│   │   ├── api/         # Axios API client
│   │   ├── context/     # React context for auth/state
│   │   ├── hooks/       # Custom React hooks
│   │   ├── utils/       # Helper functions
│   │   └── App.jsx      # Main app component & router setup
│   └── public/          # Static assets
└── README.md
```

🎯 API Endpoints

All routes are prefixed with `/api`.

Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user

Projects
- `GET /projects` - Get all projects
- `POST /projects` - Create project
- `GET /projects/:id` - Get project details
- `PATCH /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project

Tasks
- `GET /projects/:projectId/tasks` - Get project tasks
- `POST /projects/:projectId/tasks` - Create task
- `PATCH /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task

Notes
- `GET /projects/:projectId/notes` - Get project notes
- `POST /projects/:projectId/notes` - Create note
- `DELETE /notes/:id` - Delete note

File Uploads
- `POST /uploads` - Upload a file (used by task creation)
- `GET /uploads/:filename` - Serve an uploaded file
- `DELETE /api/uploads/:filename` - Delete a file

🗄️ Database Schemas (High-Level)

User

```javascript
{
  name: String,
  email: String (unique),
  passwordHash: String,
  createdAt: Date
}
```

Project

```javascript
{
  title: String,
  description: String,
  owner: ObjectId (ref: 'User'),
  members: [ObjectId (ref: 'User')],
  budget: Number,
  createdAt: Date
}
```

Task

```javascript
{
  project: ObjectId (ref: 'Project'),
  title: String,
  description: String,
  status: 'todo' | 'in-progress' | 'done',
  priority: 'low' | 'medium' | 'high',
  startDate: Date,
  dueDate: Date,
  price: Number,
  attachments: [{ filename, url, mimeType }],
  createdBy: ObjectId (ref: 'User'),
  assignees: [ObjectId (ref: 'User')],
  createdAt: Date
}
```

🔮 Future Roadmap & Improvements

Below is a prioritized roadmap for making Zenflow production-ready and competitive.

1) High-Impact / High-Priority

- S3-Compatible Storage: Replace local multer storage with a cloud solution (S3, R2, etc.) for file uploads.
- Invitations System: Implement a proper email-based invitation system for adding collaborators to projects.
- User Roles & Permissions: Add roles (e.g., Admin, Member, Guest) to control C.R.U.D. access within projects.
- Real-time Updates (WebSockets): Integrate Socket.io or similar for live updates on task changes, new comments, etc.
- Comments System: Add threaded comments to tasks for team communication.

2) Usability & Product

- Kanban Board View: Add a drag-and-drop board view for tasks.
- Calendar View: Implement a calendar to visualize task start/due dates.
- Global Search: A command-k (⌘K) style modal to search across all projects, tasks, and notes.
- Rich Text Editor: Replace plain textareas with a block-style editor (like TipTap or Editor.js) for task descriptions and notes.
- Notifications: In-app notification center for mentions, assignments, and due dates.

3) Growth & Monetization

- Team Workspaces: Introduce a "Workspace" or "Organization" level above Projects.
- Subscription Logic (Stripe): Integrate Stripe for SaaS plans (e.g., Free, Pro, Team) with feature flags.
- Onboarding Flow: Create a guided setup for new users to create their first project and invite a teammate.

4) Performance & Scalability

- Database Indexing: Add indexes to Mongoose models for common query fields (e.g., project on Tasks, email on Users).
- API Rate Limiting: Implement express-rate-limit to prevent abuse.
- Frontend State Caching: Use a tool like react-query or swr to manage server state, caching, and re-validation.
- Lazy Loading: Code-split frontend pages and heavy components.

5) Platform & Integrations

- Public API: Document and version the API for third-party use.
- Webhook Support: Fire webhooks on key events (task created, project completed).
- Slack/Discord Integration: Send notifications to team chat.
- GitHub/GitLab Integration: Link commits and pull requests to tasks.

6) Security & Compliance

- CORS Configuration: Lock down CORS to specific production frontend domains.
- Helmet.js: Add Helmet to the Express backend for common security headers.
- Audit Logging: Create a log of sensitive actions (project deleted, user added).
- OAuth Login: Add "Sign in with Google" and "Sign in with GitHub."

7) Developer Experience & Quality

- CI/CD Pipeline: Add a GitHub Action to run lint, tests, and (optionally) deploy on push to main.
- Unit & Integration Tests: Add Jest/Vitest tests for backend controllers and frontend hooks.
- E2E Tests: Implement Playwright or Cypress tests for critical user flows.
- TypeScript Migration: Convert the backend and frontend to TypeScript for better type safety.

🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a new feature branch: `git checkout -b feature/your-amazing-feature`
3. Make your changes and commit them: `git commit -m 'Add amazing feature'`
4. Push to your branch: `git push origin feature/your-amazing-feature`
5. Open a Pull Request against the main branch.
