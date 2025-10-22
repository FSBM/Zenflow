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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

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
    <div className="h-full flex flex-col bg-sidebar border-r border-sidebar-border">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h2 className={`font-semibold text-sidebar-foreground ${isCollapsed ? 'hidden' : 'block'}`}>
            Projects
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            {isCollapsed ? <Menu size={18} /> : <X size={18} />}
          </Button>
        </div>
      </div>
      <Separator className="bg-sidebar-border" />

      {/* User Info */}
      <div className={`p-4 ${isCollapsed ? 'hidden' : 'block'}`}>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-sidebar-primary text-sidebar-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email || 'user@example.com'}
            </p>
          </div>
        </div>
      </div>
      <Separator className="bg-sidebar-border" />

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-2">
          {/* Dashboard Link */}
          <Link
            to="/dashboard"
            className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
              location.pathname === '/dashboard'
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
            }`}
          >
            <FolderOpen size={18} />
            {!isCollapsed && <span>All Projects</span>}
          </Link>

          {/* Create Project Button */}
          <Button
            variant="ghost"
            onClick={onCreateProject}
            className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50 w-full ${
              isCollapsed ? 'justify-center' : 'justify-start'
            }`}
          >
            <Plus size={18} />
            {!isCollapsed && <span>New Project</span>}
          </Button>
        </div>

        {/* Projects List */}
        {!isCollapsed && projects.length > 0 && (
          <div className="px-4 pb-4">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
              Recent Projects
            </h3>
            <div className="space-y-1">
              {projects.slice(0, 5).map((project) => (
                <Link
                  key={project._id}
                  to={`/project/${project._id}`}
                  className={`block px-3 py-2 rounded-md transition-colors ${
                    location.pathname === `/project/${project._id}`
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                  }`}
                >
                  <p className="text-sm truncate">{project.title}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <Separator className="bg-sidebar-border" />
      {/* Footer */}
      <div className="p-4">
        <div className="space-y-2">
          <Button
            variant="ghost"
            className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50 w-full ${
              isCollapsed ? 'justify-center' : 'justify-start'
            }`}
          >
            <Settings size={18} />
            {!isCollapsed && <span>Settings</span>}
          </Button>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors text-muted-foreground hover:text-destructive hover:bg-destructive/10 w-full ${
              isCollapsed ? 'justify-center' : 'justify-start'
            }`}
          >
            <LogOut size={18} />
            {!isCollapsed && <span>Sign out</span>}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={`hidden lg:flex flex-col ${isCollapsed ? 'w-16' : 'w-64'} transition-all duration-200`}>
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden fixed top-4 left-4 z-40 bg-sidebar border border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <Menu size={20} />
          </Button>
        </SheetTrigger>
        <SheetContent 
          side="left" 
          className="w-64 p-0 bg-sidebar border-sidebar-border"
        >
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  );
};

export default Sidebar;
