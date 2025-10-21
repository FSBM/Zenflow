import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Calendar, Users, Edit, Trash2, CheckCircle, Circle, Clock, FileText, StickyNote, Search, LogOut, X } from 'lucide-react';
import { VscHome, VscArchive, VscAccount, VscSettingsGear, VscAdd, VscTasklist, VscNote } from 'react-icons/vsc';
import { useAuth } from '../context/AuthContext';
import Dock from '../components/Dock';
import TaskCard from '../components/TaskCard';
import NoteCard from '../components/NoteCard';
import AnimatedBackground from '../components/AnimatedBackground';
import AnimatedCard from '../components/AnimatedCard';
import { projectsAPI, tasksAPI, notesAPI } from '../api';
import { formatDate, formatRelativeTime } from '../utils/helpers';

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

  // Dock items configuration
  const dockItems = [
    { 
      icon: <VscHome size={18} />, 
      label: 'Dashboard', 
      onClick: () => navigate('/dashboard'),
      className: 'hover:border-gray-400'
    },
    { 
      icon: <VscTasklist size={18} />, 
      label: 'Tasks', 
      onClick: () => setActiveTab('tasks'),
      className: activeTab === 'tasks' ? 'border-gray-700 bg-gray-700/10' : 'hover:border-yellow-500'
    },
    { 
      icon: <VscNote size={18} />, 
      label: 'Notes', 
      onClick: () => setActiveTab('notes'),
      className: activeTab === 'notes' ? 'border-gray-700 bg-gray-700/10' : 'hover:border-purple-500'
    },
    { 
      icon: <VscAdd size={18} />, 
      label: 'Add New', 
      onClick: () => {
        if (activeTab === 'tasks') {
          setShowTaskModal(true);
        } else {
          setShowNoteModal(true);
        }
      },
      className: 'hover:border-green-500'
    },
    { 
      icon: <LogOut size={18} />, 
      label: 'Sign Out', 
      onClick: () => {
        logout();
        navigate('/login');
      },
      className: 'hover:border-red-500'
    },
  ];

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

  // Modal keyboard shortcuts
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (showTaskModal) {
          setShowTaskModal(false);
        }
        if (showNoteModal) {
          setShowNoteModal(false);
        }
      }
    };

    if (showTaskModal || showNoteModal) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [showTaskModal, showNoteModal]);

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
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-primary mb-2">Project not found</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="minimal-button"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <AnimatedBackground variant="default" overlayOpacity={0.98}>
      <div className="min-h-screen">
        <main className="p-6 dock-spacing">
          {/* Project Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="minimal-button-ghost p-2"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-primary">{project.title}</h1>
                {project.description && (
                  <p className="text-gray-500 mt-1">{project.description}</p>
                )}
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder={activeTab === 'tasks' ? 'Search tasks...' : 'Search notes...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="minimal-input pl-10 w-64 text-sm"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex space-x-1 bg-gray-100/50 backdrop-blur-md rounded-lg p-1 border-2 border-border">
              <button
                onClick={() => setActiveTab('tasks')}
                className={`tab-button ${
                  activeTab === 'tasks' ? 'active' : ''
                }`}
                title="Switch to tasks (Cmd+1)"
              >
                <CheckCircle size={16} />
                <span>Tasks ({tasks.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`tab-button ${
                  activeTab === 'notes' ? 'active' : ''
                }`}
                title="Switch to notes (Cmd+2)"
              >
                <StickyNote size={16} />
                <span>Notes ({notes.length})</span>
              </button>
            </div>
            
            <div className="text-xs text-gray-500">
              <span className="hidden md:inline">
                Press Cmd+T for new task • Cmd+N for new note • Cmd+K to search
              </span>
            </div>
          </div>

          {/* Project Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <AnimatedCard className="" padding="p-4" silkVariant="subtle" glassmorphism={true}>
              <div className="flex items-center">
                <div className="p-2 bg-gray-500/10 rounded-lg">
                  <Circle className="h-5 w-5 text-gray-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-500">Total Tasks</p>
                  <p className="text-lg font-semibold text-primary">{tasks.length}</p>
                </div>
              </div>
            </AnimatedCard>

            <AnimatedCard className="" padding="p-4" silkVariant="warm" glassmorphism={true}>
              <div className="flex items-center">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-500">In Progress</p>
                  <p className="text-lg font-semibold text-primary">{inProgressTasks.length}</p>
                </div>
              </div>
            </AnimatedCard>

            <AnimatedCard className="" padding="p-4" silkVariant="cool" glassmorphism={true}>
              <div className="flex items-center">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-500">Completed</p>
                  <p className="text-lg font-semibold text-primary">{completedTasks.length}</p>
                </div>
              </div>
            </AnimatedCard>

            <AnimatedCard className="" padding="p-4" silkVariant="accent" glassmorphism={true}>
              <div className="flex items-center">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <StickyNote className="h-5 w-5 text-purple-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-500">Notes</p>
                  <p className="text-lg font-semibold text-primary">{notes.length}</p>
                </div>
              </div>
            </AnimatedCard>
          </div>

          {/* Content Section */}
          {activeTab === 'tasks' ? (
            <div className="space-y-6">
              {/* Task Status Filters */}
              <div className="flex flex-wrap gap-2 mb-6">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`status-filter-button ${
                    statusFilter === 'all' ? 'active' : ''
                  }`}
                >
                  All ({tasks.length})
                </button>
                <button
                  onClick={() => setStatusFilter('todo')}
                  className={`status-filter-button ${
                    statusFilter === 'todo' ? 'active' : ''
                  }`}
                >
                  Todo ({tasks.filter(t => t.status === 'todo').length})
                </button>
                <button
                  onClick={() => setStatusFilter('in-progress')}
                  className={`status-filter-button ${
                    statusFilter === 'in-progress' ? 'active' : ''
                  }`}
                >
                  In Progress ({tasks.filter(t => t.status === 'in-progress').length})
                </button>
                <button
                  onClick={() => setStatusFilter('done')}
                  className={`status-filter-button ${
                    statusFilter === 'done' ? 'active' : ''
                  }`}
                >
                  Done ({tasks.filter(t => t.status === 'done').length})
                </button>
              </div>

              {/* Pending Tasks */}
              {pendingTasks.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-primary mb-4">Pending Tasks ({pendingTasks.length})</h2>
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
                  <h2 className="text-lg font-semibold text-primary mb-4">In Progress ({inProgressTasks.length})</h2>
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
                  <h2 className="text-lg font-semibold text-primary mb-4">Completed ({completedTasks.length})</h2>
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
                  <CheckCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-primary mb-2">No tasks found</h3>
                  <p className="text-gray-500 mb-4">Try adjusting your search term</p>
                </div>
              )}

              {tasks.length === 0 && (
                <div className="text-center py-12">
                  <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-primary mb-2">No tasks yet</h3>
                  <p className="text-gray-500 mb-4">Create your first task to get started with this project.</p>
                  <button
                    onClick={() => setShowTaskModal(true)}
                    className="minimal-button"
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
                  <StickyNote className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-primary mb-2">No notes found</h3>
                  <p className="text-gray-500 mb-4">Try adjusting your search term</p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <StickyNote className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-primary mb-2">No notes yet</h3>
                  <p className="text-gray-500 mb-4">Create your first note to capture important information.</p>
                  <button
                    onClick={() => setShowNoteModal(true)}
                    className="minimal-button"
                  >
                    Create Note
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

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
          className="minimal-button rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
          title={activeTab === 'tasks' ? 'Add new task' : 'Add new note'}
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Create Task Modal */}
      {showTaskModal && (
        <div className="modal-backdrop">
          <div className="modal-content w-full max-w-lg mx-auto">
            <AnimatedCard className="animate-slide-up" padding="p-8" glassmorphism={true} silkVariant="accent">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-primary">Create New Task</h3>
                <button
                  onClick={() => setShowTaskModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
              
              <form onSubmit={handleCreateTask} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                    className="minimal-input w-full"
                    placeholder="Task title"
                    autoFocus
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Description
                  </label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                    className="minimal-input w-full h-32 resize-none"
                    placeholder="Task description"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Priority
                    </label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value }))}
                      className="minimal-input w-full"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                      className="minimal-input w-full"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-6 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setShowTaskModal(false)}
                    className="minimal-button-ghost"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingTask || !newTask.title.trim()}
                    className="minimal-button"
                  >
                    {isCreatingTask ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        <span>Creating...</span>
                      </div>
                    ) : (
                      'Create Task'
                    )}
                  </button>
                </div>
              </form>
            </AnimatedCard>
          </div>
        </div>
      )}

      {/* Create Note Modal */}
      {showNoteModal && (
        <div className="modal-backdrop">
          <div className="modal-content w-full max-w-2xl mx-auto">
            <AnimatedCard className="animate-slide-up" padding="p-8" glassmorphism={true} silkVariant="cool">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-primary">Create New Note</h3>
                <button
                  onClick={() => setShowNoteModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
              
              <form onSubmit={handleCreateNote} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Note Content *
                  </label>
                  <textarea
                    value={newNote.body}
                    onChange={(e) => setNewNote(prev => ({ ...prev, body: e.target.value }))}
                    className="minimal-input w-full h-64 resize-none"
                    placeholder="Write your note here..."
                    autoFocus
                    required
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-6 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setShowNoteModal(false)}
                    className="minimal-button-ghost"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingNote || !newNote.body.trim()}
                    className="minimal-button"
                  >
                    {isCreatingNote ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        <span>Creating...</span>
                      </div>
                    ) : (
                      'Create Note'
                    )}
                  </button>
                </div>
              </form>
            </AnimatedCard>
          </div>
        </div>
      )}

      {/* Dock Navigation */}
      <Dock 
        items={dockItems}
        panelHeight={68}
        baseItemSize={50}
        magnification={70}
      />
    </AnimatedBackground>
  );
};

export default Project;
