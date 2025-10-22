import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { projects as apiProjects, tasks as apiTasks, notes as apiNotes, invites as apiInvites, uploads as apiUploads } from '@/lib/api';
import Navbar from "@/components/Navbar";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Plus, Search, MoreHorizontal, Upload, FileText, Image as ImageIcon, Download, Trash } from "lucide-react";
import { API_BASE } from '@/lib/api';
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Tooltip } from '@/components/ui/tooltip';

type Status = "Backlog" | "Todo" | "In Progress" | "Done" | "Canceled";
type Priority = "High" | "Medium" | "Low";

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  // Helper to ensure a relative upload path becomes a valid absolute URL
  const normalizeUrl = (rel?: string) => {
    if (!rel) return rel;
    if (rel.startsWith('http')) return rel;
    // Remove duplicate leading slashes and ensure single slash after API_BASE
    const base = API_BASE.replace(/\/$/, '');
    const path = rel.replace(/^\/+/, '');
    return `${base}/${path}`;
  };
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [notesText, setNotesText] = useState('');
  const [notesList, setNotesList] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', assignee: '', dueDate: '' });
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [isDetailOpen, setDetailOpen] = useState(false);

  const teamMembers = Array.isArray(project?.members) ? project!.members : [];

  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviteOpen, setInviteOpen] = useState(false);

  const uiToApiStatus = (uiStatus: string) => {
    switch ((uiStatus || '').toLowerCase()) {
      case 'backlog': return 'backlog';
      case 'todo': return 'todo';
      case 'in progress': return 'in-progress';
      case 'done': return 'done';
      case 'canceled': return 'canceled';
      default: return uiStatus;
    }
  };

  const apiToUiStatus = (apiStatus: string) => {
    switch ((apiStatus || '').toLowerCase()) {
      case 'backlog': return 'Backlog';
      case 'todo': return 'Todo';
      case 'in-progress': return 'In Progress';
      case 'done': return 'Done';
      case 'canceled': return 'Canceled';
      default: return apiStatus;
    }
  };

  const updateTaskOnClient = (updatedTask: any) => {
    // Ensure status uses UI-friendly label so the frontend remains consistent
    if (updatedTask && typeof updatedTask === 'object' && 'status' in updatedTask) {
  try { updatedTask.status = apiToUiStatus(String(updatedTask.status)); } catch (e) { /* ignore */ }
    }
    setTasks((prev) => prev.map((t) => (String(t.id) === String(updatedTask.id) ? updatedTask : t)));
  };

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await apiProjects.get(id);
        const projectData = (res && typeof res === 'object' && 'project' in (res as any)) ? (res as any).project : null;
        const tasksData = (res && typeof res === 'object' && 'tasks' in (res as any)) ? (res as any).tasks : [];
        setProject(projectData ?? null);
  setTasks(Array.isArray(tasksData) ? tasksData.map((t:any) => ({ ...t, status: apiToUiStatus(String(t.status)) })) : []);
        setNotesText(projectData && typeof projectData === 'object' && 'notes' in projectData ? String((projectData as any).notes ?? '') : '');
        // Load attached files if present on the project
        if (projectData && Array.isArray((projectData as any).files)) {
          setFiles((projectData as any).files.map((f: any) => {
            const rel = f.url || `/api/uploads/${f.filename}`;
            const url = normalizeUrl(rel);
            return ({
              id: f.filename || f.id || `${f.filename}-${Date.now()}`,
              filename: f.filename,
              name: f.originalName || f.filename,
              url,
              mimeType: f.mimeType,
              size: f.size,
              uploadedAt: f.uploadedAt
            });
          }));
        } else {
          setFiles([]);
        }
        // load notes separately from notes endpoint for listing
        try {
          const notesRes = await apiNotes.list(id!);
          setNotesList(Array.isArray(notesRes) ? notesRes : (notesRes && Array.isArray((notesRes as any).notes) ? (notesRes as any).notes : []));
        } catch (e) {
          console.error('Failed to load notes list', e);
          setNotesList([]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const filteredTasks = tasks.filter((task) => {
    const title = String(task.title ?? '').toLowerCase();
    const desc = String(task.description ?? '').toLowerCase();
    const matchesSearch = title.includes(searchQuery.toLowerCase()) || desc.includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || String(task.status) === statusFilter;
    const matchesPriority = priorityFilter === "all" || String(task.priority) === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleAddTask = async () => {
    if (!newTask.title) {
      window.alert('Task title is required');
      return;
    }
    // Optimistic UI: insert a temp task immediately
    const tempId = `temp-${Date.now()}`;
    const tempTask: any = {
      id: tempId,
      title: newTask.title,
      description: newTask.description || '',
      status: 'Todo',
      priority: 'Medium',
      assignees: newTask.assignee ? [{ id: newTask.assignee }] : [],
      createdAt: new Date().toISOString()
    };

    // Add to UI immediately
    setTasks((t) => [tempTask, ...t]);
    setDialogOpen(false);

    try {
      const payload: any = { title: newTask.title };
      if (newTask.description) payload.description = newTask.description;
      if (newTask.assignee) payload.assignees = [newTask.assignee];
  if (newTask.dueDate) payload.dueDate = new Date(newTask.dueDate).toISOString();
      const res = await apiTasks.create(id!, payload);
      const taskObj = res && typeof res === 'object' && 'task' in (res as any) ? (res as any).task : null;
      if (taskObj) {
        // replace temp with server task (normalize status to UI label)
  const normalized = { ...taskObj, status: apiToUiStatus(String((taskObj as any).status)) };
        setTasks((prev) => prev.map((x) => (x.id === tempId ? normalized : x)));
      } else {
        // if no task returned, remove temp
        setTasks((prev) => prev.filter((x) => x.id !== tempId));
        window.alert('Failed to add task (no task returned)');
      }
    } catch (err) {
      console.error('Create task error', err);
      setTasks((prev) => prev.filter((x) => x.id !== tempId));
      const details = (err as any)?.details;
      if (details) window.alert(JSON.stringify(details));
      else window.alert('Failed to add task');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb & Header */}
        <div className="mb-6">
          <Link to="/projects">
            <Button variant="ghost" className="mb-4 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Projects
            </Button>
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="mb-2 text-3xl font-bold">{project?.title ?? 'Project'}</h1>
              <p className="text-muted-foreground">{project?.description ?? ''}</p>
            </div>
            <div className="flex gap-2">
              <Dialog open={isInviteOpen} onOpenChange={setInviteOpen}>
                <DialogTrigger asChild>
                  <Button variant="secondary" className="gap-2">Invite people</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite a user</DialogTitle>
                    <DialogDescription>Enter the email of the person you want to invite to this project.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-2">
                    <label className="text-sm">Email</label>
                    <Input value={inviteEmail} onChange={(e)=>setInviteEmail(e.target.value)} placeholder="user@example.com" />
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="ghost">Cancel</Button>
                    </DialogClose>
                    <Button onClick={async ()=>{
                      if (!String(inviteEmail).trim()) { window.alert('Please enter an email'); return; }
                      try {
                        const res = await apiInvites.create(id!, inviteEmail.trim());
                        if (res && (res as any).invite) {
                          window.alert('Invite sent');
                          setInviteEmail('');
                          setInviteOpen(false);
                        } else {
                          window.alert('Invite request sent');
                        }
                      } catch (err:any) {
                        console.error('Invite failed', err);
                        const msg = err?.details?.message || err?.message || 'Failed to send invite';
                        window.alert(String(msg));
                      }
                    }}>Send Invite</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Project Summary Card */}
        <Card className="mb-8 border-border">
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent className="p-4 grid gap-4 md:grid-cols-3">
            <div>
              <p className="mb-1 text-sm text-muted-foreground">Timeline</p>
              <p className="font-medium">
                {project?.startDate ? new Date(String(project.startDate)).toLocaleDateString() : '—'} - {project?.endDate ? new Date(String(project.endDate)).toLocaleDateString() : '—'}
              </p>
            </div>
            <div>
              <p className="mb-1 text-sm text-muted-foreground">Budget</p>
              <p className="font-medium">${(project?.price ?? 0).toLocaleString()}</p>
            </div>
            <div>
              <p className="mb-1 text-sm text-muted-foreground">Status</p>
              <div className="flex items-center gap-2">
                <select
                  value={project?.status ?? 'ongoing'}
                  onChange={async (e) => {
                    const val = e.target.value;
                    // optimistic update
                    const prev = project;
                    setProject((p:any)=> p ? { ...p, status: val } : p);
                    try {
                      const res = await apiProjects.update(id!, { status: val });
                      if (res && (res as any).project) setProject((res as any).project);
                    } catch (err) {
                      console.error('Failed to update project status', err);
                      setProject(prev);
                      window.alert('Failed to update project status');
                    }
                  }}
                  className="rounded-md border border-input bg-input px-2 py-1 text-input-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="on-hold">On Hold</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div>
              <p className="mb-1 text-sm text-muted-foreground">Tasks</p>
              <p className="font-medium">{tasks.length} total</p>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="tasks" className="space-y-6">
          <TabsList>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
          </TabsList>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-6">
            {/* Filters & Actions */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative flex-1 sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Filter tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Backlog">Backlog</SelectItem>
                    <SelectItem value="Todo">Todo</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Done">Done</SelectItem>
                    <SelectItem value="Canceled">Canceled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Task
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md mx-auto p-6 rounded-lg">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">Add New Task</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      type="text"
                      placeholder="Task Title"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      className="w-full"
                    />
                    <Textarea
                      placeholder="Describe the work to be done..."
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      className="w-full"
                    />
                    <div>
                      <label className="text-sm mb-1 block">Due date (optional)</label>
                      <input
                        type="date"
                        value={newTask.dueDate}
                        onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                        className="w-full rounded-md border border-input bg-input px-3 py-2 text-input-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <select
                      value={newTask.assignee}
                      onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                      className="w-full rounded-md border border-input bg-input px-3 py-2 text-input-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">Assign to (optional)</option>
                      {teamMembers.map((member: any) => (
                        <option key={member.id || member._id} value={member.id || member._id}>
                          {member.name ?? member.email}
                        </option>
                      ))}
                    </select>
                    <Button
                      onClick={handleAddTask}
                      className="w-full"
                    >
                      Create Task
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Tasks Table */}
            <Card className="border-border">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[100px] p-4 align-middle [&:has([role=checkbox])]:pr-0">Task</TableHead>
                    <TableHead className="p-4 align-middle [&:has([role=checkbox])]:pr-0">Status</TableHead>
                    <TableHead className="p-4 align-middle [&:has([role=checkbox])]:pr-0">Priority</TableHead>
                    <TableHead className="p-4 align-middle [&:has([role=checkbox])]:pr-0">Due Date</TableHead>
                    <TableHead className="w-[50px] p-4 align-middle [&:has([role=checkbox])]:pr-0"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.map((task) => (
                    <TableRow
                      key={task.id}
                      className="border-b transition-colors data-[state=selected]:bg-muted hover:bg-muted/50 cursor-pointer"
                      onClick={() => { setSelectedTask(task); setDetailOpen(true); }}
                    >
                      <TableCell className="p-4 align-middle [&:has([role=checkbox])]:pr-0 font-mono text-sm flex items-center gap-2">
                        <button
                          title={task.status === 'Done' ? 'Mark In Progress' : 'Mark Done'}
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              const target = task.status === 'Done' ? 'in-progress' : 'done';
                              const res: any = await apiTasks.update(task.id, { status: target });
                              if (res && res.task) updateTaskOnClient(res.task);
                            } catch (e) { console.error(e); window.alert('Failed to update status'); }
                          }}
                          className={`h-5 w-5 rounded-full border flex items-center justify-center ${task.status === 'Done' ? 'bg-green-500' : 'bg-yellow-400'}`}
                        />
                        <div className="flex flex-col">
                          <button className="text-left" onClick={() => { setSelectedTask(task); setDetailOpen(true); }}>
                            <span className="font-medium">{task.title}</span>
                            <div className="text-xs text-muted-foreground line-clamp-1">{task.description}</div>
                          </button>
                        </div>
                      </TableCell>
                      
                      <TableCell className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            // cycle: Todo -> In Progress -> Done -> Todo
                            // normalize current status to API form to avoid mismatches
                            const currentApi = uiToApiStatus(String(task.status || ''));
                            let nextApi = 'todo';
                            if (currentApi === 'todo' || currentApi === 'backlog') nextApi = 'in-progress';
                            else if (currentApi === 'in-progress') nextApi = 'done';
                            else if (currentApi === 'done') nextApi = 'todo';

                            // optimistic UI: show the friendly API->UI label
                            const prev = tasks;
                            const friendlyNext = apiToUiStatus(nextApi);
                            setTasks((t) => t.map((x) => (x.id === task.id ? { ...x, status: friendlyNext } : x)));

                            // call API to persist change; if it fails, revert UI
                            try {
                              const res: any = await apiTasks.update(task.id, { status: nextApi });
                              if (res && res.task) updateTaskOnClient(res.task);
                            } catch (err) {
                              console.error('Failed to update status', err);
                              setTasks(prev);
                              window.alert('Failed to update status');
                            }
                          }}
                          title="Click to cycle status: Todo → In Progress → Done"
                          className="inline-block"
                        >
                          <StatusBadge status={task.status} />
                        </button>
                      </TableCell>
                      <TableCell className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                        <PriorityBadge priority={task.priority} />
                      </TableCell>
                      <TableCell className="p-4 align-middle [&:has([role=checkbox])]:pr-0 text-sm text-muted-foreground">
                        {task.dueDate ? new Date(String(task.dueDate)).toLocaleDateString() : '—'}
                      </TableCell>
                      <TableCell className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={async () => {
                              // Reset to default: set status to Todo and clear assignees
                              const prev = tasks;
                              const updated = { ...task, status: 'Todo', assignees: [] };
                              setTasks((t) => t.map((x) => (x.id === task.id ? updated : x)));
                              try {
                                const res: any = await apiTasks.update(task.id, { status: 'todo', assignees: [] });
                                if (res && res.task) updateTaskOnClient(res.task);
                              } catch (e) { console.error(e); setTasks(prev); window.alert('Failed to reset task'); }
                            }}>Reset to Default</DropdownMenuItem>
                            <DropdownMenuItem onClick={async () => {
                              if (!confirm('Delete this task?')) return;
                              const prev = tasks;
                              setTasks((t) => t.filter((x) => String(x.id) !== String(task.id)));
                              try {
                                await apiTasks.delete(task.id);
                              } catch (e) { console.error(e); setTasks(prev); window.alert('Failed to delete task'); }
                            }}>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
            {/* Task Details Dialog */}
            <Dialog open={isDetailOpen} onOpenChange={setDetailOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Task Details</DialogTitle>
                </DialogHeader>
                {selectedTask ? (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">{selectedTask.title}</h3>
                    <p className="text-sm text-muted-foreground">{selectedTask.description}</p>
                    <p>Status: <StatusBadge status={selectedTask.status} /></p>
                    <p>Priority: <PriorityBadge priority={selectedTask.priority} /></p>
                    <p>Due: {selectedTask.dueDate ? new Date(String(selectedTask.dueDate)).toLocaleString() : '—'}</p>
                    <p>Assignees: {Array.isArray(selectedTask.assignees) ? selectedTask.assignees.map((a:any)=>a.name||a.email||a.id).join(', ') : '—'}</p>
                  </div>
                ) : <p>No task selected</p>}
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="ghost">Close</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Project Notes</CardTitle>
                <CardDescription>
                  Keep track of important information and updates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{notesList.length} note{notesList.length !== 1 ? 's' : ''}</p>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="gap-2"><Plus className="h-4 w-4" />Add Note</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Note</DialogTitle>
                          <DialogDescription>Quickly add a note for this project.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-2">
                          <label className="text-sm font-medium">Note</label>
                          <Textarea placeholder="Write note..." value={notesText} onChange={(e) => setNotesText(e.target.value)} className="min-h-[160px]" />
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="ghost">Cancel</Button>
                          </DialogClose>
                          <Button onClick={async () => {
                            if (!String(notesText).trim()) {
                              window.alert('Please enter note text');
                              return;
                            }
                            // optimistic UI: add a temp note
                            const tempNote = { id: `temp-${Date.now()}`, body: notesText, createdAt: new Date().toISOString(), createdBy: { name: 'You' } };
                            setNotesList((n) => [tempNote, ...n]);
                            const prevNotes = notesList;
                            setNotesText('');
                            try {
                              const res = await apiNotes.create(id!, notesText);
                              if (res && (res as any).note) {
                                setNotesList((n) => [ (res as any).note, ...n.filter(x => x.id !== tempNote.id) ]);
                              } else {
                                const list = await apiNotes.list(id!);
                                setNotesList(Array.isArray(list) ? list : (list as any).notes || []);
                              }
                            } catch (e) {
                              console.error('Failed to create note', e);
                              setNotesList(prevNotes);
                              window.alert('Failed to add note');
                            }
                          }}>Save</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <div className="space-y-3">
                  {notesList.length === 0 && <p className="text-muted-foreground">No notes yet</p>}
                  {notesList.map((note) => (
                    <div key={note.id || note._id} className="border p-3 rounded-md">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm">{note.body}</p>
                          <p className="text-xs text-muted-foreground">By {note.createdBy?.name ?? 'Unknown'} • {note.createdAt ? new Date(String(note.createdAt)).toLocaleString() : '—'}</p>
                        </div>
                        <div>
                          <Button variant="ghost" size="icon" onClick={async () => {
                            try {
                              await apiNotes.delete(note.id || note._id);
                              setNotesList((n) => n.filter((x) => (x.id || x._id) !== (note.id || note._id)));
                            } catch (e) {
                              console.error('Failed to delete note', e);
                              window.alert('Failed to delete note');
                            }
                          }}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Files Tab */}
          <TabsContent value="files" className="space-y-6">
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {files.length} file{files.length !== 1 ? "s" : ""} uploaded
                </p>
                <div className="flex items-center gap-2">
                  <input ref={fileInputRef} type="file" className="hidden" onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    try {
                      // optimistic UI: add temp file
                      const temp = { id: `temp-${Date.now()}`, filename: `temp-${Date.now()}`, name: f.name, url: URL.createObjectURL(f), mimeType: f.type, size: f.size, uploadedAt: new Date().toISOString() };
                      setFiles((s) => [temp, ...s]);
                      const res: any = await apiUploads.uploadFile('file', f, id);
                      if (res && res.file) {
                        const rel = res.file.url || `/api/uploads/${res.file.filename}`;
                        const normalizedUrl = normalizeUrl(rel);
                        const added = { id: res.file.filename, filename: res.file.filename, name: res.file.originalName || res.file.filename, url: normalizedUrl, mimeType: res.file.mimeType, size: res.file.size, uploadedAt: res.file.uploadedAt || new Date().toISOString() };
                        setFiles((s) => [added, ...s.filter(x => x.id !== temp.id)]);
                      } else {
                        // reload project files
                        const projRes = await apiProjects.get(id!);
                        const projectData2 = projRes && typeof projRes === 'object' && 'project' in (projRes as any) ? (projRes as any).project : null;
                        if (projectData2 && Array.isArray((projectData2 as any).files)) {
                          setFiles((projectData2 as any).files.map((f: any) => {
                            const rel2 = f.url || `/api/uploads/${f.filename}`;
                            const url2 = normalizeUrl(rel2);
                            return { id: f.filename || f.id, filename: f.filename, name: f.originalName || f.filename, url: url2, mimeType: f.mimeType, size: f.size, uploadedAt: f.uploadedAt };
                          }));
                        }
                      }
                    } catch (err:any) {
                      console.error('Upload failed', err);
                      setFiles((prev) => prev.filter(x => !String(x.id).startsWith('temp-')));
                      const msg = err?.details?.message || err?.message || 'Upload failed';
                      window.alert(String(msg));
                    } finally {
                      // clear file input value so same file can be reselected
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }
                  }} />
                  <Button className="gap-2" onClick={() => fileInputRef.current?.click()}><Upload className="h-4 w-4" />Upload File</Button>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {files.map((file) => (
                <Card key={file.id} className="border-border">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {file.mimeType && file.mimeType.includes('pdf') ? (
                          <FileText className="h-5 w-5 text-destructive" />
                        ) : (
                          <ImageIcon className="h-5 w-5 text-primary" />
                        )}
                        <div>
                          <CardTitle className="text-sm">{file.name}</CardTitle>
                          <CardDescription className="text-xs">
                            {typeof file.size === 'number' ? `${(file.size/1024).toFixed(1)} KB` : file.size}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={async () => {
                          // download or open file in new tab
                          if (!file.url) return;
                          // open in new tab - browsers will handle download/content-disposition
                          window.open(file.url, '_blank');
                        }}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={async () => {
                          if (!confirm('Delete this file?')) return;
                          const prev = files;
                          setFiles((farr) => farr.filter((x) => x.id !== file.id));
                          try {
                            await apiUploads.deleteFile(file.filename);
                          } catch (e) {
                            console.error('Failed to delete file', e);
                            setFiles(prev);
                            window.alert('Failed to delete file');
                          }
                        }}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {file.mimeType && file.mimeType.startsWith('image/') ? (
                      <img src={file.url} alt={file.name} className="max-h-48 w-full object-contain rounded" />
                    ) : file.mimeType && file.mimeType.includes('pdf') ? (
                      <div className="w-full">
                        <object data={file.url} type="application/pdf" className="w-full h-64 rounded border" aria-label={file.name}>
                          <p className="text-sm">PDF preview not available. <a href={file.url} target="_blank" rel="noreferrer" className="underline">Open file</a></p>
                        </object>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">Uploaded {file.uploadedAt ? new Date(String(file.uploadedAt)).toLocaleDateString() : '—'} • <a href={file.url} target="_blank" rel="noreferrer" className="underline">Open</a></p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ProjectDetail;
