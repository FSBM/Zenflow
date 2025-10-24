import { Link } from "react-router-dom";
import { useEffect, useState } from 'react';
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderKanban, CheckCircle2, Clock, ArrowRight } from "lucide-react";
import { useLoading } from '@/components/LoadingProvider';

const Home = () => {
  // Real stats from backend
  const [stats, setStats] = useState({ totalProjects: 0, activeProjects: 0, completedTasks: 0, pendingTasks: 0 });
  const [loading, setLoading] = useState(false);
  const { showLoading, hideLoading } = useLoading();

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      showLoading();
      try {
        const res = await (await import('@/lib/api')).projects.list();
        const projects = Array.isArray(res) ? res : [];
        const totalProjects = projects.length;
        let activeProjects = 0;
        let completedTasks = 0;
        let pendingTasks = 0;

        for (const p of projects) {
          const status = String(p.status || '').toLowerCase();
          if (status === 'ongoing' || status === 'in-progress' || status === 'todo' || status === '') activeProjects += 1;
          const tTotal = Number(p.tasksTotal ?? 0);
          const tCompleted = Number(p.tasksCompleted ?? 0);
          completedTasks += tCompleted;
          pendingTasks += Math.max(0, tTotal - tCompleted);
        }

        setStats({ totalProjects, activeProjects, completedTasks, pendingTasks });
      } catch (err) {
        console.error('Failed to load dashboard stats', err);
      } finally {
        setLoading(false);
        hideLoading();
      }
    };
    loadStats();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Welcome back!</h1>
          <p className="text-muted-foreground">Here's an overview of your projects and tasks.</p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <FolderKanban className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProjects}</div>
              <p className="text-xs text-muted-foreground">Across all statuses</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <Clock className="h-4 w-4 text-status-progress" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeProjects}</div>
              <p className="text-xs text-muted-foreground">Currently in progress</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-status-done" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedTasks}</div>
              <p className="text-xs text-muted-foreground">Tasks finished</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
              <Clock className="h-4 w-4 text-status-todo" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingTasks}</div>
              <p className="text-xs text-muted-foreground">Tasks to do</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link to="/projects">
              <Button className="w-full justify-between" size="lg">
                View All Projects
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            {/* Assigned tasks list */}
            <div>
              <h3 className="text-sm font-medium mb-2">Your Tasks</h3>
              <AssignedTasksList />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Home;

function AssignedTasksList() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { showLoading, hideLoading } = useLoading();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      showLoading();
      try {
        const { tasks: apiTasks } = await import('@/lib/api');
        const res = await apiTasks.assigned();
        const items = Array.isArray(res) ? res : (res && Array.isArray((res as any).tasks) ? (res as any).tasks : res || []);
        setTasks(items.slice(0, 10));
      } catch (err) {
        console.error('Failed to load assigned tasks', err);
      } finally {
        setLoading(false);
        hideLoading();
      }
    };
    load();
  }, []);

  if (loading) return <div className="text-sm text-muted-foreground">Loading tasks...</div>;
  if (!tasks || tasks.length === 0) return <div className="text-sm text-muted-foreground">No tasks assigned</div>;

  return (
    <div className="flex flex-col gap-2">
      {tasks.map((t) => (
        <Link key={t.id} to={`/projects/${t.project?.id || t.project?._id || ''}`} className="block rounded-md p-2 hover:bg-muted/50">
          <div className="text-sm font-medium line-clamp-1">{t.title}</div>
          <div className="text-xs text-muted-foreground">{t.project?.title ?? t.project?.name ?? 'Project'} • {t.status}</div>
        </Link>
      ))}
    </div>
  );
}
