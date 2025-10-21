import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FolderOpen, 
  Plus, 
  Search, 
  Settings, 
  LogOut, 
  Menu,
  X
} from 'lucide-react';

const Sidebar = ({ projects = [], onCreateProject }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-notion-border">
        <div className="flex items-center justify-between">
          <h2 className={`font-semibold text-notion-text ${isCollapsed ? 'hidden' : 'block'}`}>
            Projects
          </h2>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="notion-button-ghost p-1 hidden lg:flex"
          >
            {isCollapsed ? <Menu size={18} /> : <X size={18} />}
          </button>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="notion-button-ghost p-1 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* User Info */}
      <div className={`p-4 border-b border-notion-border ${isCollapsed ? 'hidden' : 'block'}`}>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-notion-accent rounded-full flex items-center justify-center text-white text-sm font-medium">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-notion-text truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-notion-text-muted truncate">
              {user?.email || 'user@example.com'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-2">
          {/* Dashboard Link */}
          <Link
            to="/dashboard"
            className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
              location.pathname === '/dashboard'
                ? 'bg-notion-accent/10 text-notion-accent'
                : 'text-notion-text-muted hover:text-notion-text hover:bg-notion-surface'
            }`}
          >
            <FolderOpen size={18} />
            {!isCollapsed && <span>All Projects</span>}
          </Link>

          {/* Create Project Button */}
          <button
            onClick={onCreateProject}
            className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors text-notion-text-muted hover:text-notion-text hover:bg-notion-surface w-full ${
              isCollapsed ? 'justify-center' : 'justify-start'
            }`}
          >
            <Plus size={18} />
            {!isCollapsed && <span>New Project</span>}
          </button>
        </div>

        {/* Projects List */}
        {!isCollapsed && projects.length > 0 && (
          <div className="px-4 pb-4">
            <h3 className="text-xs font-medium text-notion-text-muted uppercase tracking-wide mb-3">
              Recent Projects
            </h3>
            <div className="space-y-1">
              {projects.slice(0, 5).map((project) => (
                <Link
                  key={project._id}
                  to={`/project/${project._id}`}
                  className={`block px-3 py-2 rounded-md transition-colors ${
                    location.pathname === `/project/${project._id}`
                      ? 'bg-notion-accent/10 text-notion-accent'
                      : 'text-notion-text-muted hover:text-notion-text hover:bg-notion-surface'
                  }`}
                >
                  <p className="text-sm truncate">{project.title}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-notion-border">
        <div className="space-y-2">
          <button className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors text-notion-text-muted hover:text-notion-text hover:bg-notion-surface w-full ${
            isCollapsed ? 'justify-center' : 'justify-start'
          }`}>
            <Settings size={18} />
            {!isCollapsed && <span>Settings</span>}
          </button>
          <button
            onClick={handleLogout}
            className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors text-notion-text-muted hover:text-red-400 hover:bg-red-500/10 w-full ${
              isCollapsed ? 'justify-center' : 'justify-start'
            }`}
          >
            <LogOut size={18} />
            {!isCollapsed && <span>Sign out</span>}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={`hidden lg:flex flex-col notion-sidebar ${isCollapsed ? 'w-16' : 'w-64'} transition-all duration-200`}>
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-black/50" 
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative flex flex-col w-64 notion-sidebar">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 notion-button-secondary p-2"
      >
        <Menu size={20} />
      </button>
    </>
  );
};

export default Sidebar;
