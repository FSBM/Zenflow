import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Calendar, Users, Edit, Trash2, CheckCircle, Circle, Clock, FileText, StickyNote, Home, User, Settings, LogOut, FolderOpen } from 'lucide-react';
import Dock from '../components/Dock';
import Topbar from '../components/Topbar';
import TaskCard from '../components/TaskCard';
import NoteCard from '../components/NoteCard';
import { projectsAPI, tasksAPI, notesAPI } from '../api';
import { formatDate, formatRelativeTime } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

const Project = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [projects, setProjects] = useState([]);
  const [activeTab, setActiveTab] = useState('tasks');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [newTask, setNewTask] = useState({ 
    title: '', 
    description: '', 
    priority: 'medium',
    dueDate: '' 
  });
  const [newNote, setNewNote] = useState({ body: '' });
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [isCreatingNote, setIsCreatingNote] = useState(false);

  useEffect(() => {
    fetchProject();
    fetchTasks();
    fetchNotes();
    fetchProjects();
  }, [id]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd/Ctrl + K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.querySelector('input[type="text"]')?.focus();
      }
      // Cmd/Ctrl + T for new task
      if ((e.metaKey || e.ctrlKey) && e.key === 't') {
        e.preventDefault();
        setActiveTab('tasks');
        setShowTaskModal(true);
      }
      // Cmd/Ctrl + N for new note
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        setActiveTab('notes');
        setShowNoteModal(true);
      }
      // Tab switching with 1 and 2
      if ((e.metaKey || e.ctrlKey) && e.key === '1') {
        e.preventDefault();
        setActiveTab('tasks');
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '2') {
        e.preventDefault();
        setActiveTab('notes');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const fetchProject = async () => {
    try {
      const data = await projectsAPI.getById(id);
      setProject(data);
    } catch (error) {
      console.error('Error fetching project:', error);
      navigate('/dashboard');
    }
  };

  const fetchTasks = async () => {
    try {
      const data = await tasksAPI.getByProject(id);
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchNotes = async () => {
    try {
      const data = await notesAPI.getByProject(id);
      setNotes(data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const data = await projectsAPI.getAll();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    setIsCreatingTask(true);
    try {
      const taskData = {
        ...newTask,
        dueDate: newTask.dueDate || undefined
      };
      const response = await tasksAPI.create(id, taskData);
      setTasks(prev => [response.task, ...prev]);
      setShowTaskModal(false);
      setNewTask({ title: '', description: '', priority: 'medium', dueDate: '' });
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setIsCreatingTask(false);
    }
  };

  const handleCreateNote = async (e) => {
    e.preventDefault();
    if (!newNote.body.trim()) return;

    setIsCreatingNote(true);
    try {
      const response = await notesAPI.create(id, newNote);
      setNotes(prev => [response.note, ...prev]);
      setShowNoteModal(false);
      setNewNote({ body: '' });
    } catch (error) {
      console.error('Error creating note:', error);
    } finally {
      setIsCreatingNote(false);
    }
  };

  const handleTaskUpdate = async (taskId, updates) => {
    try {
      const updatedTask = await tasksAPI.update(taskId, updates);
      setTasks(prev => prev.map(task => 
        task._id === taskId ? updatedTask : task
      ));
      
      // If status is being updated and we have a status filter active,
      // reset to 'all' to show the task in its new status
      if (updates.status && statusFilter !== 'all') {
        setStatusFilter('all');
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleTaskDelete = async (taskId) => {
    try {
      await tasksAPI.delete(taskId);
      setTasks(prev => prev.filter(task => task._id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleNoteDelete = async (noteId) => {
    try {
      await notesAPI.delete(noteId);
      setNotes(prev => prev.filter(note => note._id !== noteId));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Dock items configuration
  const dockItems = [
    {
      icon: <Home size={24} />,
      label: 'Dashboard',
      onClick: () => navigate('/dashboard'),
      className: 'dock-item-home'
    },
    {
      icon: <ArrowLeft size={24} />,
      label: 'Back',
      onClick: () => navigate('/dashboard')
    },
    {
      icon: activeTab === 'tasks' ? <Plus size={24} /> : <StickyNote size={24} />,
      label: activeTab === 'tasks' ? 'New Task' : 'New Note',
      onClick: () => activeTab === 'tasks' ? setShowTaskModal(true) : setShowNoteModal(true)
    },
    {
      icon: <FolderOpen size={24} />,
      label: 'All Projects',
      onClick: () => navigate('/dashboard')
    },
    {
      icon: <User size={24} />,
      label: 'Profile',
      onClick: () => console.log('Profile clicked')
    },
    {
      icon: <Settings size={24} />,
      label: 'Settings',
      onClick: () => console.log('Settings clicked')
    },
    {
      icon: <LogOut size={24} />,
      label: 'Sign Out',
      onClick: handleLogout
    }
  ];

  // Filter tasks and notes based on search and status
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = (task.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredNotes = notes.filter(note =>
    (note.body || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const completedTasks = filteredTasks.filter(task => task.status === 'done');
  const pendingTasks = filteredTasks.filter(task => task.status === 'todo');
  const inProgressTasks = filteredTasks.filter(task => task.status === 'in-progress');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-notion-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-notion-accent"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-notion-bg flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-notion-text mb-2">Project not found</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="notion-button-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-notion-bg">
      <Topbar 
        title={project.title} 
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder={activeTab === 'tasks' ? 'Search tasks...' : 'Search notes...'}
      />
      
      <main className="p-6">
          {/* Project Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="notion-button-ghost p-2"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-notion-text">{project.title}</h1>
                {project.description && (
                  <p className="text-notion-text-muted mt-1">{project.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  setActiveTab('tasks');
                  setShowTaskModal(true);
                }}
                className="notion-button-secondary flex items-center space-x-2"
              >
                <Plus size={16} />
                <span>Add Task</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('notes');
                  setShowNoteModal(true);
                }}
                className="notion-button-secondary flex items-center space-x-2"
              >
                <Plus size={16} />
                <span>Add Note</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex space-x-1 bg-notion-surface rounded-lg p-1">
              <button
                onClick={() => setActiveTab('tasks')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                  activeTab === 'tasks'
                    ? 'bg-notion-bg text-notion-accent'
                    : 'text-notion-text-muted hover:text-notion-text'
                }`}
                title="Switch to tasks (Cmd+1)"
              >
                <CheckCircle size={16} />
                <span>Tasks ({tasks.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                  activeTab === 'notes'
                    ? 'bg-notion-bg text-notion-accent'
                    : 'text-notion-text-muted hover:text-notion-text'
                }`}
                title="Switch to notes (Cmd+2)"
              >
                <StickyNote size={16} />
                <span>Notes ({notes.length})</span>
              </button>
            </div>
            
            <div className="text-xs text-notion-text-muted">
              <span className="hidden md:inline">
                Press Cmd+T for new task • Cmd+N for new note • Cmd+K to search
              </span>
            </div>
          </div>

          {/* Project Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="notion-card p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Circle className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-notion-text-muted">Total Tasks</p>
                  <p className="text-lg font-semibold text-notion-text">{tasks.length}</p>
                </div>
              </div>
            </div>

            <div className="notion-card p-4">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-notion-text-muted">In Progress</p>
                  <p className="text-lg font-semibold text-notion-text">{inProgressTasks.length}</p>
                </div>
              </div>
            </div>

            <div className="notion-card p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-notion-text-muted">Completed</p>
                  <p className="text-lg font-semibold text-notion-text">{completedTasks.length}</p>
                </div>
              </div>
            </div>

            <div className="notion-card p-4">
              <div className="flex items-center">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <StickyNote className="h-5 w-5 text-purple-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-notion-text-muted">Notes</p>
                  <p className="text-lg font-semibold text-notion-text">{notes.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          {activeTab === 'tasks' ? (
            <div className="space-y-6">
              {/* Task Status Filters */}
              <div className="flex flex-wrap gap-2 mb-6">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    statusFilter === 'all'
                      ? 'bg-notion-accent text-white'
                      : 'bg-notion-surface text-notion-text-muted hover:text-notion-text hover:bg-notion-border'
                  }`}
                >
                  All ({tasks.length})
                </button>
                <button
                  onClick={() => setStatusFilter('todo')}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    statusFilter === 'todo'
                      ? 'bg-blue-500 text-white'
                      : 'bg-notion-surface text-notion-text-muted hover:text-notion-text hover:bg-notion-border'
                  }`}
                >
                  Todo ({tasks.filter(t => t.status === 'todo').length})
                </button>
                <button
                  onClick={() => setStatusFilter('in-progress')}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    statusFilter === 'in-progress'
                      ? 'bg-yellow-500 text-white'
                      : 'bg-notion-surface text-notion-text-muted hover:text-notion-text hover:bg-notion-border'
                  }`}
                >
                  In Progress ({tasks.filter(t => t.status === 'in-progress').length})
                </button>
                <button
                  onClick={() => setStatusFilter('done')}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    statusFilter === 'done'
                      ? 'bg-green-500 text-white'
                      : 'bg-notion-surface text-notion-text-muted hover:text-notion-text hover:bg-notion-border'
                  }`}
                >
                  Done ({tasks.filter(t => t.status === 'done').length})
                </button>
              </div>

              {/* Pending Tasks */}
              {pendingTasks.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-notion-text mb-4">Pending Tasks ({pendingTasks.length})</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pendingTasks.map(task => (
                      <TaskCard
                        key={task._id}
                        task={task}
                        onUpdate={handleTaskUpdate}
                        onDelete={handleTaskDelete}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* In Progress Tasks */}
              {inProgressTasks.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-notion-text mb-4">In Progress ({inProgressTasks.length})</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {inProgressTasks.map(task => (
                      <TaskCard
                        key={task._id}
                        task={task}
                        onUpdate={handleTaskUpdate}
                        onDelete={handleTaskDelete}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Completed Tasks */}
              {completedTasks.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-notion-text mb-4">Completed ({completedTasks.length})</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {completedTasks.map(task => (
                      <TaskCard
                        key={task._id}
                        task={task}
                        onUpdate={handleTaskUpdate}
                        onDelete={handleTaskDelete}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State for Tasks */}
              {filteredTasks.length === 0 && tasks.length > 0 && (
                <div className="text-center py-12">
                  <CheckCircle className="mx-auto h-12 w-12 text-notion-text-muted mb-4" />
                  <h3 className="text-lg font-medium text-notion-text mb-2">No tasks found</h3>
                  <p className="text-notion-text-muted mb-4">Try adjusting your search term</p>
                </div>
              )}

              {tasks.length === 0 && (
                <div className="text-center py-12">
                  <div className="p-4 bg-notion-surface rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-notion-text-muted" />
                  </div>
                  <h3 className="text-lg font-semibold text-notion-text mb-2">No tasks yet</h3>
                  <p className="text-notion-text-muted mb-4">Create your first task to get started with this project.</p>
                  <button
                    onClick={() => setShowTaskModal(true)}
                    className="notion-button-primary"
                  >
                    Create Task
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Notes List */}
              {filteredNotes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredNotes.map(note => (
                    <NoteCard
                      key={note._id}
                      note={note}
                      onDelete={handleNoteDelete}
                    />
                  ))}
                </div>
              ) : notes.length > 0 ? (
                <div className="text-center py-12">
                  <StickyNote className="mx-auto h-12 w-12 text-notion-text-muted mb-4" />
                  <h3 className="text-lg font-medium text-notion-text mb-2">No notes found</h3>
                  <p className="text-notion-text-muted mb-4">Try adjusting your search term</p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="p-4 bg-notion-surface rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <StickyNote className="h-8 w-8 text-notion-text-muted" />
                  </div>
                  <h3 className="text-lg font-semibold text-notion-text mb-2">No notes yet</h3>
                  <p className="text-notion-text-muted mb-4">Create your first note to capture important information.</p>
                  <button
                    onClick={() => setShowNoteModal(true)}
                    className="notion-button-primary"
                  >
                    Create Note
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      
      {/* Dock Component */}
      <Dock 
        items={dockItems}
        magnification={50}
        baseItemSize={45}
        spring={{ mass: 0.1, stiffness: 180, damping: 18 }}
      />

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => {
            if (activeTab === 'tasks') {
              setShowTaskModal(true);
            } else {
              setShowNoteModal(true);
            }
          }}
          className="notion-button-primary p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          title={activeTab === 'tasks' ? 'Add new task' : 'Add new note'}
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Create Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-notion-surface border border-notion-border rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-notion-text mb-4">Create New Task</h3>
            
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-notion-text mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  className="notion-input w-full"
                  placeholder="Task title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-notion-text mb-2">
                  Description
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                  className="notion-input w-full h-24 resize-none"
                  placeholder="Task description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-notion-text mb-2">
                  Priority
                </label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value }))}
                  className="notion-input w-full"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-notion-text mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="notion-input w-full"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="notion-button-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingTask || !newTask.title.trim()}
                  className="notion-button-primary"
                >
                  {isCreatingTask ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-notion-surface border border-notion-border rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold text-notion-text mb-4">Create New Note</h3>
            
            <form onSubmit={handleCreateNote} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-notion-text mb-2">
                  Note Content *
                </label>
                <textarea
                  value={newNote.body}
                  onChange={(e) => setNewNote(prev => ({ ...prev, body: e.target.value }))}
                  className="notion-input w-full h-48 resize-none"
                  placeholder="Write your note here..."
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNoteModal(false)}
                  className="notion-button-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingNote || !newNote.body.trim()}
                  className="notion-button-primary"
                >
                  {isCreatingNote ? 'Creating...' : 'Create Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Project;
