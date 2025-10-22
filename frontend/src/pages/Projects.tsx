import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Calendar, DollarSign } from "lucide-react";

const Projects = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data - replace with actual API calls
  const projects = [
    {
      id: "1",
      title: "Website Redesign",
      description: "Complete overhaul of company website with modern design",
      startDate: "2024-01-15",
      endDate: "2024-03-30",
      price: 15000,
      tasksTotal: 24,
      tasksCompleted: 18,
    },
    {
      id: "2",
      title: "Mobile App Development",
      description: "iOS and Android app for customer engagement",
      startDate: "2024-02-01",
      endDate: "2024-06-15",
      price: 45000,
      tasksTotal: 56,
      tasksCompleted: 32,
    },
    {
      id: "3",
      title: "Database Migration",
      description: "Migrate legacy database to modern cloud infrastructure",
      startDate: "2024-03-01",
      endDate: "2024-04-30",
      price: 12000,
      tasksTotal: 18,
      tasksCompleted: 5,
    },
  ];

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
          <Button className="gap-2">
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
            const completionPercentage = Math.round(
              (project.tasksCompleted / project.tasksTotal) * 100
            );

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
                        <span>{new Date(project.endDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        <span>${project.price.toLocaleString()}</span>
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
