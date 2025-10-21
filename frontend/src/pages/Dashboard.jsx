import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FolderOpen, Calendar, DollarSign } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-notion-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-notion-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-notion-bg flex">
      <Sidebar 
        projects={projects} 
        onCreateProject={() => setShowCreateModal(true)} 
      />
      
      <div className="flex-1 lg:ml-0 ml-0">
        <Topbar 
          title="Projects" 
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
        />
        
        <main className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="notion-card p-6">
              <div className="flex items-center">
                <div className="p-2 bg-notion-accent/10 rounded-lg">
                  <FolderOpen className="h-6 w-6 text-notion-accent" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-notion-text-muted">Total Projects</p>
                  <p className="text-2xl font-bold text-notion-text">{projects.length}</p>
                </div>
              </div>
            </div>

            <div className="notion-card p-6">
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
            </div>

            <div className="notion-card p-6">
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
            </div>
          </div>

          {/* Projects Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-notion-text">
              Your Projects
            </h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="notion-button-primary flex items-center space-x-2"
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
                  className="notion-button-primary"
                >
                  Create Project
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <div
                  key={project._id}
                  onClick={() => navigate(`/project/${project._id}`)}
                  className="notion-card p-6 cursor-pointer hover:bg-notion-surface/50 transition-colors group"
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
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="notion-modal w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-notion-text mb-4">
              Create New Project
            </h2>
            
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-notion-text mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={newProject.title}
                  onChange={(e) => setNewProject(prev => ({ ...prev, title: e.target.value }))}
                  className="notion-input w-full"
                  placeholder="Enter project name"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-notion-text mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                  className="notion-input w-full h-24 resize-none"
                  placeholder="Brief description of your project"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="notion-button-secondary"
                  disabled={isCreating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="notion-button-primary flex items-center space-x-2"
                  disabled={isCreating || !newProject.title.trim()}
                >
                  {isCreating ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Plus size={16} />
                      <span>Create</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
