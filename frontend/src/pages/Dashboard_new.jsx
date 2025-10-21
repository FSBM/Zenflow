import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FolderOpen, Calendar, DollarSign, Settings, LogOut, Search, X } from 'lucide-react';
import { VscHome, VscArchive, VscAccount, VscSettingsGear, VscAdd } from 'react-icons/vsc';
import { useAuth } from '../context/AuthContext';
import Dock from '../components/Dock';
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
      className: 'border-white/20 bg-white/10'
    },
    { 
      icon: <VscAdd size={18} />, 
      label: 'New Project', 
      onClick: () => setShowCreateModal(true),
      className: 'hover:border-white/30'
    },
    { 
      icon: <VscAccount size={18} />, 
      label: 'Profile', 
      onClick: () => alert('Profile coming soon!'),
      className: 'hover:border-white/30'
    },
    { 
      icon: <VscSettingsGear size={18} />, 
      label: 'Settings', 
      onClick: () => alert('Settings coming soon!'),
      className: 'hover:border-white/30'
    },
    { 
      icon: <LogOut size={18} />, 
      label: 'Sign Out', 
      onClick: logout,
      className: 'hover:border-red-400'
    },
  ];

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
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
      const project = await projectsAPI.create(newProject);
      setProjects(prev => [project, ...prev]);
      setNewProject({ title: '', description: '' });
      setShowCreateModal(false);
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

  // Calculate stats
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const totalValue = projects.reduce((sum, p) => sum + (p.budget || 0), 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="p-6 pb-32">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-light text-primary mb-2">Welcome back, {user?.name}!</h1>
            <p className="text-gray-600">Manage your projects and tasks efficiently</p>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="minimal-input pl-10 w-64 text-sm"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <AnimatedCard className="animate-fade-in" padding="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded">
                <FolderOpen className="h-6 w-6 text-gray-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-2xl font-light text-primary">{projects.length}</p>
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard className="animate-fade-in" padding="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded">
                <Calendar className="h-6 w-6 text-gray-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-light text-primary">{activeProjects}</p>
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard className="animate-fade-in" padding="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded">
                <DollarSign className="h-6 w-6 text-gray-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-light text-primary">{formatCurrency(totalValue)}</p>
              </div>
            </div>
          </AnimatedCard>
        </div>

        {/* Projects Section */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-medium text-primary">Your Projects</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="minimal-button"
          >
            <Plus size={16} />
            New Project
          </button>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <AnimatedCard className="text-center" padding="p-12">
            <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No projects found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first project'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="minimal-button"
              >
                <Plus size={16} />
                Create Project
              </button>
            )}
          </AnimatedCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map(project => (
              <AnimatedCard 
                key={project._id} 
                className="cursor-pointer animate-slide-up group"
                onClick={() => navigate(`/project/${project._id}`)}
                padding="p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded group-hover:bg-gray-200 transition-colors">
                      <FolderOpen className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-primary truncate">{project.title}</h3>
                      <p className="text-sm text-gray-500">
                        Created {formatRelativeTime(project.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {project.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {project.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium capitalize">
                    {project.status || 'active'}
                  </span>
                  {project.budget && (
                    <span className="text-gray-500">
                      {formatCurrency(project.budget)}
                    </span>
                  )}
                </div>
              </AnimatedCard>
            ))}
          </div>
        )}

        {/* Create Project Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded border max-w-md w-full">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-lg font-medium text-primary">Create New Project</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleCreateProject} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Project Title *
                    </label>
                    <input
                      type="text"
                      value={newProject.title}
                      onChange={(e) => setNewProject(prev => ({ ...prev, title: e.target.value }))}
                      className="minimal-input"
                      placeholder="Enter project title"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Description
                    </label>
                    <textarea
                      value={newProject.description}
                      onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                      className="minimal-input"
                      rows={3}
                      placeholder="Enter project description (optional)"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="minimal-button-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="minimal-button"
                  >
                    {isCreating ? 'Creating...' : 'Create Project'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Dock */}
      <Dock items={dockItems} />
    </div>
  );
};

export default Dashboard;
