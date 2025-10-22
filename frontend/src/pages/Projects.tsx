import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { projects as apiProjects } from '@/lib/api';
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Calendar, DollarSign } from "lucide-react";

const Projects = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await (await import('@/lib/api')).projects.list();
        setProjects(res || []);
      } catch (err: any) {
        console.error(err);
        setError(err?.message || 'Failed to load projects');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredProjects = projects.filter((project) =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold">Projects</h1>
            <p className="text-muted-foreground">Manage and track all your projects</p>
          </div>
            <Button className="gap-2" onClick={async () => {
            const title = window.prompt('Project title');
            if (!title) return;
            const description = window.prompt('Description (optional)') || '';
            try {
              const res = await apiProjects.create({ title, description });
              // Insert new project at top
              setProjects((p) => [res.project, ...p]);
            } catch (err) {
              console.error(err);
              window.alert('Failed to create project');
            }
          }}>
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => {
            // Defensive defaults for fields that may be missing from server
            const tasksCompleted = Number(project.tasksCompleted ?? 0);
            const tasksTotal = Number(project.tasksTotal ?? 0) || 0;
            const completionPercentage = tasksTotal > 0 ? Math.round((tasksCompleted / tasksTotal) * 100) : 0;

            return (
              <Link key={project.id} to={`/projects/${project.id}`}>
                <Card className="h-full border-border transition-colors hover:border-primary/50">
                  <CardHeader>
                    <CardTitle className="line-clamp-1">{project.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {project.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{completionPercentage}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${completionPercentage}%` }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {project.tasksCompleted} of {project.tasksTotal} tasks completed
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{project.endDate ? new Date(project.endDate).toLocaleDateString() : '—'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        <span>${(project.price ?? 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {filteredProjects.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">No projects found</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Projects;
