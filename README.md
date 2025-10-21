# 🎯 Minimal Project Management App (MERN)

A sleek, Notion-inspired project management application built with the MERN stack, featuring a pure black theme and clean, minimal UI.

## 🌟 Features

### ✅ Core Features (MVP)
- **Authentication** - JWT-based login/register system
- **Project Management** - Create, edit, delete projects
- **Task Management** - Full CRUD operations for tasks
- **Notes System** - Add notes to projects
- **File Uploads** - Support for PDFs, images, and documents
- **Task Metadata** - Status, priority, dates, pricing
- **Search & Filter** - Find tasks by status, priority, or text
- **Responsive Design** - Works on desktop and mobile

### 🎨 UI/UX
- **Notion Black Theme** - Pure black (#000000) background
- **Minimal Design** - Clean, distraction-free interface
- **Smooth Animations** - 150-200ms transitions
- **Custom Components** - Tailored for the Notion aesthetic
- **Responsive Layout** - Sidebar + content panel design

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express.js** - Server framework
- **MongoDB** + **Mongoose** - Database and ODM
- **JWT** - Authentication
- **Multer** - File upload handling
- **bcrypt** - Password hashing
- **express-validator** - Input validation

### Frontend
- **React** (Vite) - UI framework
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client
- **Lucide React** - Icons
- **Context API** - State management

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone and Setup
```bash
# Clone the repository
git clone <your-repo-url>
cd project-management-app

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Configuration
Create a `.env` file in the `backend` directory:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/project_management
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRE=7d
```

### 3. Start Development Servers

**Backend** (runs on port 5000):
```bash
cd backend
npm run dev
```

**Frontend** (runs on port 5173):
```bash
cd frontend
npm run dev
```

### 4. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api/health

## 📁 Project Structure

```
project-management-app/
├── backend/
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routes
│   ├── middleware/      # Custom middleware
│   ├── uploads/         # File storage
│   └── server.js        # Main server file
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── api/         # API utilities
│   │   ├── context/     # React context
│   │   ├── hooks/       # Custom hooks
│   │   ├── utils/       # Helper functions
│   │   └── App.jsx      # Main app component
│   └── public/          # Static assets
└── README.md
```

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project details
- `PATCH /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks
- `GET /api/projects/:projectId/tasks` - Get project tasks
- `POST /api/projects/:projectId/tasks` - Create task
- `PATCH /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Notes
- `GET /api/projects/:projectId/notes` - Get project notes
- `POST /api/projects/:projectId/notes` - Create note
- `DELETE /api/notes/:id` - Delete note

### File Uploads
- `POST /api/uploads` - Upload file
- `GET /api/uploads/:filename` - Get file
- `DELETE /api/uploads/:filename` - Delete file

## 🗄️ Database Schemas

### User
```javascript
{
  name: String,
  email: String (unique),
  passwordHash: String,
  createdAt: Date
}
```

### Project
```javascript
{
  title: String,
  description: String,
  owner: ObjectId (User),
  members: [ObjectId (User)],
  createdAt: Date,
  updatedAt: Date
}
```

### Task
```javascript
{
  project: ObjectId (Project),
  title: String,
  description: String,
  status: 'todo' | 'in-progress' | 'done',
  priority: 'low' | 'medium' | 'high',
  startDate: Date,
  dueDate: Date,
  price: Number,
  attachments: [{ filename, url, mimeType }],
  createdBy: ObjectId (User),
  assignees: [ObjectId (User)],
  createdAt: Date,
  updatedAt: Date
}
```

## 🎨 Color Palette

```css
/* Notion Black Theme */
--notion-bg: #000000        /* Main background */
--notion-surface: #0b0b0b   /* Cards, modals */
--notion-border: #1f1f1f    /* Borders */
--notion-text: #ffffff      /* Primary text */
--notion-text-muted: #bfc1c5 /* Secondary text */
--notion-accent: #9aa8ff    /* Accent color */
```

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Use a process manager like PM2
3. Configure reverse proxy (nginx)
4. Set up MongoDB Atlas or production DB

### Frontend Deployment
1. Build the production bundle: `npm run build`
2. Deploy to Vercel, Netlify, or static hosting
3. Update API base URL for production

## 🔮 Future Enhancements

### Phase 2 Features
- **Kanban Board** - Drag-and-drop task management
- **Calendar View** - Timeline visualization
- **Comments System** - Task discussions
- **Tag System** - Organize with labels
- **Team Collaboration** - Sharing and permissions
- **Rich Text Editor** - Notion-style block editor
- **Real-time Updates** - WebSocket integration
- **Mobile App** - React Native version

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 MVP Acceptance Checklist

- ✅ User authentication (register/login)
- ✅ Create and manage projects
- ✅ CRUD operations for tasks
- ✅ Task metadata (dates, price, status, priority)
- ✅ File upload functionality
- ✅ Notes system for projects
- ✅ Clean Notion-black UI theme
- ✅ Responsive design
- ✅ MongoDB data persistence
- ✅ JWT-based authentication
- ✅ Search and filter capabilities

---

**Built with ❤️ using the MERN Stack**
