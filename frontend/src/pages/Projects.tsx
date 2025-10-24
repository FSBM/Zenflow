import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { projects as apiProjects } from '@/lib/api';
import Navbar from "@/components/Navbar";
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import StatusBadge from '@/components/StatusBadge';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Calendar, DollarSign } from "lucide-react";
import { formatCurrencyINR } from '@/lib/utils';
import { useLoading } from '@/components/LoadingProvider';

const Projects = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showLoading, hideLoading } = useLoading();
  
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      showLoading();
      try {
        const res = await (await import('@/lib/api')).projects.list();
        setProjects(res || []);
      } catch (err: any) {
        console.error(err);
        setError(err?.message || 'Failed to load projects');
      } finally {
        setLoading(false);
        hideLoading();
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
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Project</DialogTitle>
                <DialogDescription>Provide a title and optional description for the new project.</DialogDescription>
              </DialogHeader>
              <ProjectCreateForm onCreated={(proj) => setProjects((p) => [proj, ...p])} />
            </DialogContent>
          </Dialog>
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
  <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => {
            // Defensive defaults for fields that may be missing from server
              const tasksCompleted = Number(project.tasksCompleted ?? 0);
              const tasksTotal = Number(project.tasksTotal ?? 0) || 0;
            const completionPercentage = tasksTotal > 0 ? Math.round((tasksCompleted / tasksTotal) * 100) : 0;

            return (
              <Link key={project.id} to={`/projects/${project.id}`}>
                <Card className="h-full border-border transition-colors hover:border-primary/50">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <CardTitle className="line-clamp-1 truncate">{project.title}</CardTitle>
                        <CardDescription className="line-clamp-2 truncate">
                          {project.description}
                        </CardDescription>
                      </div>
                      <div>
                        {/* Project status (map backend status to UI label) */}
                        <StatusBadge status={
                          project.status === 'completed' ? 'Done' :
                          project.status === 'on-hold' ? 'Backlog' :
                          project.status === 'cancelled' ? 'Canceled' :
                          project.status === 'ongoing' ? 'In Progress' : 'Todo'
                        } />
                      </div>
                    </div>
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
                        <span>{formatCurrencyINR(project.price ?? 0)}</span>
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

// Small form component inserted here to keep this file self-contained.
function ProjectCreateForm({ onCreated }: { onCreated: (p: any) => void }) {
  const { toast } = useToast();
  const { showLoading, hideLoading } = useLoading();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [memberEmailInput, setMemberEmailInput] = useState('');
  const [memberEmails, setMemberEmails] = useState<string[]>([]);
  const [price, setPrice] = useState<string>('');
  const [loading, setLoading] = useState(false);

  return (
    <div>
      <div className="grid gap-2">
        <label className="text-sm font-medium">Title</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Project title" />
        <label className="text-sm font-medium">Description</label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />
        <label className="text-sm font-medium">Members (invite by email)</label>
        <div className="flex items-center gap-2">
          <Input value={memberEmailInput} onChange={(e) => setMemberEmailInput(e.target.value)} placeholder="Type email and press Add" />
          <Button variant="outline" onClick={() => {
            const email = memberEmailInput.trim();
            if (!email) return;
            if (memberEmails.includes(email)) {
              setMemberEmailInput('');
              return;
            }
            setMemberEmails(prev => [...prev, email]);
            setMemberEmailInput('');
          }}>Add</Button>
        </div>
        {memberEmails.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {memberEmails.map((m) => (
              <div key={m} className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm">
                <span>{m}</span>
                <button onClick={() => setMemberEmails(prev => prev.filter(x => x !== m))} className="text-xs">×</button>
              </div>
            ))}
          </div>
        )}

        <label className="text-sm font-medium">Price (optional)</label>
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Amount in INR" />
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="ghost">Cancel</Button>
        </DialogClose>
        <Button onClick={async () => {
          if (!title.trim()) {
            toast({ title: 'Please provide a title', variant: 'destructive' });
            return;
          }
          setLoading(true);
          showLoading();
          try {
            const payload: any = { title: title.trim(), description: description.trim() };
            if (memberEmails.length > 0) payload.memberEmails = memberEmails;
            if (price.trim()) payload.price = Number(price);
            const res = await apiProjects.create(payload);
            if (res && (res as any).project) onCreated((res as any).project);
          } catch (err: any) {
            console.error(err);
            // If server returned missing emails, show that to user
            const details = err?.details;
            if (details && details.missing) {
              toast({ title: `These emails were not found: ${details.missing.join(', ')}`, variant: 'destructive' });
            } else {
              toast({ title: 'Failed to create project', variant: 'destructive' });
            }
          } finally {
            setLoading(false);
            hideLoading();
          }
        }} disabled={loading}>{loading ? 'Creating...' : 'Create'}</Button>
      </DialogFooter>
    </div>
  );
}
