import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FolderOpen, Calendar, DollarSign, Settings, LogOut, Search, X } from 'lucide-react';
import { VscHome, VscArchive, VscAccount, VscSettingsGear, VscAdd } from 'react-icons/vsc';
import { useAuth } from '../context/AuthContext';
import Dock from '../components/Dock';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="p-6 pb-32">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-light text-foreground mb-2">Welcome back, {user?.name}!</h1>
            <p className="text-muted-foreground">Manage your projects and tasks efficiently</p>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64 text-sm"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="animate-fade-in">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-muted rounded-md">
                  <FolderOpen className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
                  <p className="text-2xl font-light text-foreground">{projects.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-muted rounded-md">
                  <Calendar className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Active Projects</p>
                  <p className="text-2xl font-light text-foreground">{activeProjects}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-muted rounded-md">
                  <DollarSign className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-light text-foreground">{formatCurrency(totalValue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Projects Section */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-medium text-foreground">Your Projects</h2>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <Card className="text-center animate-fade-in">
            <CardContent className="p-12">
              <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No projects found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first project'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Project
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map(project => (
              <Card 
                key={project._id} 
                className="cursor-pointer animate-fade-in group hover:shadow-md transition-all duration-200"
                onClick={() => navigate(`/project/${project._id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-muted rounded-md group-hover:bg-accent transition-colors">
                        <FolderOpen className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground truncate">{project.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Created {formatRelativeTime(project.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {project.description && (
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {project.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <Badge variant="secondary" className="capitalize">
                      {project.status || 'active'}
                    </Badge>
                    {project.budget && (
                      <span className="text-muted-foreground">
                        {formatCurrency(project.budget)}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create Project Modal */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Project Title *</Label>
                <Input
                  id="title"
                  type="text"
                  value={newProject.title}
                  onChange={(e) => setNewProject(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter project title"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newProject.description}
                  onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  placeholder="Enter project description (optional)"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating}
                >
                  {isCreating ? 'Creating...' : 'Create Project'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </main>

      {/* Dock */}
      <Dock items={dockItems} />
      
      {/* Dock spacing */}
      <div className="dock-spacing"></div>
    </div>
  );
};

export default Dashboard;
