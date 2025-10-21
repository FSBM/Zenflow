import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FolderOpen, Calendar, DollarSign, Settings, LogOut, Search, X } from 'lucide-react';
import { VscHome, VscArchive, VscAccount, VscSettingsGear, VscAdd } from 'react-icons/vsc';
import { useAuth } from '../context/AuthContext';
import Dock from '../components/Dock';
import AnimatedBackground from '../components/AnimatedBackground';
import AnimatedCard from '../components/AnimatedCard';
import { projectsAPI } from '../api';
import { formatDate, formatCurrency, formatRelativeTime } from '../utils/helpers';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', description: '' });
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Dock items configuration
  const dockItems = [
    { 
      icon: <VscHome size={18} />, 
      label: 'Dashboard', 
      onClick: () => navigate('/dashboard'),
      className: 'border-notion-accent bg-notion-accent/10'
    },
    { 
      icon: <VscAdd size={18} />, 
      label: 'New Project', 
      onClick: () => setShowCreateModal(true),
      className: 'hover:border-green-500'
    },
    { 
      icon: <VscAccount size={18} />, 
      label: 'Profile', 
      onClick: () => alert('Profile coming soon!'),
      className: 'hover:border-blue-500'
    },
    { 
      icon: <VscSettingsGear size={18} />, 
      label: 'Settings', 
      onClick: () => alert('Settings coming soon!'),
      className: 'hover:border-yellow-500'
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
    fetchProjects();
  }, []);

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

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProject.title.trim()) return;

    setIsCreating(true);
    try {
      const response = await projectsAPI.create(newProject);
      setProjects(prev => [response.project, ...prev]);
      setShowCreateModal(false);
      setNewProject({ title: '', description: '' });
      navigate(`/project/${response.project._id}`);
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Modal keyboard shortcuts
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showCreateModal) {
        setShowCreateModal(false);
      }
    };

    if (showCreateModal) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [showCreateModal]);

  if (isLoading) {
    return (
      <AnimatedBackground variant="subtle" overlayOpacity={0.95}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-notion-accent"></div>
        </div>
      </AnimatedBackground>
    );
  }

  return (
    <AnimatedBackground variant="default" overlayOpacity={0.98}>
      <div className="min-h-screen">
        <main className="p-6 dock-spacing">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-notion-text mb-2">Welcome back, {user?.name}!</h1>
              <p className="text-notion-text-muted">Manage your projects and tasks efficiently</p>
            </div>
            
            {/* Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-notion-text-muted" />
              </div>
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="notion-input pl-10 w-64 text-sm"
              />
            </div>
          </div>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <AnimatedCard className="" padding="p-6" silkVariant="accent" glassmorphism={true}>
              <div className="flex items-center">
                <div className="p-2 bg-notion-accent/10 rounded-lg">
                  <FolderOpen className="h-6 w-6 text-notion-accent" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-notion-text-muted">Total Projects</p>
                  <p className="text-2xl font-bold text-notion-text">{projects.length}</p>
                </div>
              </div>
            </AnimatedCard>

            <AnimatedCard className="" padding="p-6" silkVariant="cool" glassmorphism={true}>
              <div className="flex items-center">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Calendar className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-notion-text-muted">Active Projects</p>
                  <p className="text-2xl font-bold text-notion-text">
                    {projects.filter(p => new Date(p.updatedAt) > new Date(Date.now() - 7*24*60*60*1000)).length}
                  </p>
                </div>
              </div>
            </AnimatedCard>

            <AnimatedCard className="" padding="p-6" silkVariant="warm" glassmorphism={true}>
              <div className="flex items-center">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <DollarSign className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-notion-text-muted">This Week</p>
                  <p className="text-2xl font-bold text-notion-text">
                    {projects.filter(p => new Date(p.createdAt) > new Date(Date.now() - 7*24*60*60*1000)).length}
                  </p>
                </div>
              </div>
            </AnimatedCard>
          </div>

          {/* Projects Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-notion-text">
              Your Projects
            </h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="notion-button notion-button-primary"
            >
              <Plus size={16} />
              <span>New Project</span>
            </button>
          </div>

          {/* Projects Grid */}
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="mx-auto h-12 w-12 text-notion-text-muted mb-4" />
              <h3 className="text-lg font-medium text-notion-text mb-2">
                {searchTerm ? 'No projects found' : 'No projects yet'}
              </h3>
              <p className="text-notion-text-muted mb-4">
                {searchTerm 
                  ? 'Try adjusting your search term'
                  : 'Create your first project to get started'
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="notion-button notion-button-primary"
                >
                  Create Project
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <AnimatedCard
                  key={project._id}
                  onClick={() => navigate(`/project/${project._id}`)}
                  className="p-6 cursor-pointer group animate-slide-up"
                  silkVariant="subtle"
                  glassmorphism={true}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 bg-notion-accent/10 rounded-lg group-hover:bg-notion-accent/20 transition-colors">
                      <FolderOpen className="h-5 w-5 text-notion-accent" />
                    </div>
                    <span className="text-xs text-notion-text-muted">
                      {formatRelativeTime(project.updatedAt)}
                    </span>
                  </div>

                  <h3 className="font-semibold text-notion-text mb-2 truncate">
                    {project.title}
                  </h3>
                  
                  {project.description && (
                    <p className="text-notion-text-muted text-sm mb-4 line-clamp-2">
                      {project.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-notion-text-muted">
                    <span>Created {formatDate(project.createdAt)}</span>
                    <div className="flex items-center space-x-1">
                      <div className="w-6 h-6 bg-notion-accent rounded-full flex items-center justify-center text-white text-xs">
                        {project.owner?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    </div>
                  </div>
                </AnimatedCard>
              ))}
            </div>
          )}
        </main>

        {/* Dock Navigation */}
        <Dock 
          items={dockItems}
          panelHeight={68}
          baseItemSize={50}
          magnification={70}
        />
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="modal-backdrop">
          <div className="modal-content w-full max-w-md mx-auto">
            <AnimatedCard className="animate-slide-up" padding="p-8" glassmorphism={true} silkVariant="accent">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-notion-text">
                  Create New Project
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-notion-surface rounded-lg transition-colors"
                >
                  <X size={20} className="text-notion-text-muted" />
                </button>
              </div>
              
              <form onSubmit={handleCreateProject} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-notion-text mb-2">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    value={newProject.title}
                    onChange={(e) => setNewProject(prev => ({ ...prev, title: e.target.value }))}
                    className="notion-input w-full"
                    placeholder="Enter project name"
                    autoFocus
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-notion-text mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    value={newProject.description}
                    onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                    className="notion-input w-full h-32 resize-none"
                    placeholder="Brief description of your project"
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-6 border-t border-notion-border">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="notion-button notion-button-ghost"
                    disabled={isCreating}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="notion-button notion-button-primary"
                    disabled={isCreating || !newProject.title.trim()}
                  >
                    {isCreating ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        <span>Creating...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Plus size={16} />
                        <span>Create</span>
                      </div>
                    )}
                  </button>
                </div>
              </form>
            </AnimatedCard>
          </div>
        </div>
      )}
    </AnimatedBackground>
  );
};

export default Dashboard;
