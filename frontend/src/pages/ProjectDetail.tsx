import { useState } from "react";
import { useParams, Link } from "react-router-dom";
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
import { ArrowLeft, Plus, Search, MoreHorizontal, Upload, FileText, Image as ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Status = "Backlog" | "Todo" | "In Progress" | "Done" | "Canceled";
type Priority = "High" | "Medium" | "Low";

const ProjectDetail = () => {
  const { id } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  // Mock project data
  const project = {
    id,
    title: "Website Redesign",
    description: "Complete overhaul of company website with modern design",
    startDate: "2024-01-15",
    endDate: "2024-03-30",
    price: 15000,
    notes: "This project focuses on creating a modern, responsive website that improves user experience and showcases our brand identity.",
  };

  // Mock tasks data
  const tasks = [
    {
      id: "TASK-8782",
      title: "Documentation",
      description: "You can't compress the program without quantifying the open-source SSD...",
      status: "In Progress" as Status,
      priority: "Medium" as Priority,
      dueDate: "2024-03-15",
      price: 500,
    },
    {
      id: "TASK-7878",
      title: "Documentation",
      description: "Try to calculate the EXE feed, maybe it will index the multi-byte pixel!",
      status: "Backlog" as Status,
      priority: "Medium" as Priority,
      dueDate: "2024-03-20",
      price: 300,
    },
    {
      id: "TASK-7839",
      title: "Bug",
      description: "We need to bypass the neural TCP card!",
      status: "Todo" as Status,
      priority: "High" as Priority,
      dueDate: "2024-03-10",
      price: 800,
    },
    {
      id: "TASK-5562",
      title: "Feature",
      description: "The SAS interface is down, bypass the open-source pixel so we can back up...",
      status: "Done" as Status,
      priority: "Medium" as Priority,
      dueDate: "2024-03-05",
      price: 600,
    },
  ];

  // Mock files data
  const files = [
    { id: "1", name: "Design_Mockups_v2.pdf", type: "pdf", size: "2.4 MB", uploadedAt: "2024-01-20" },
    { id: "2", name: "Brand_Guidelines.pdf", type: "pdf", size: "1.8 MB", uploadedAt: "2024-01-18" },
    { id: "3", name: "hero_image.png", type: "image", size: "854 KB", uploadedAt: "2024-02-01" },
  ];

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

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
          <h1 className="mb-2 text-3xl font-bold">{project.title}</h1>
          <p className="text-muted-foreground">{project.description}</p>
        </div>

        {/* Project Summary Card */}
        <Card className="mb-8 border-border">
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="mb-1 text-sm text-muted-foreground">Timeline</p>
              <p className="font-medium">
                {new Date(project.startDate).toLocaleDateString()} -{" "}
                {new Date(project.endDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="mb-1 text-sm text-muted-foreground">Budget</p>
              <p className="font-medium">${project.price.toLocaleString()}</p>
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
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Task
              </Button>
            </div>

            {/* Tasks Table */}
            <Card className="border-border">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[100px]">Task</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-mono text-sm">{task.id}</TableCell>
                      <TableCell>
                        <div>
                          <Badge variant="outline" className="mb-1">
                            {task.title}
                          </Badge>
                          <p className="line-clamp-1 text-sm text-muted-foreground">
                            {task.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={task.status} />
                      </TableCell>
                      <TableCell>
                        <PriorityBadge priority={task.priority} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(task.dueDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${task.price}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
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
                <Textarea
                  placeholder="Write your notes here..."
                  className="min-h-[300px]"
                  defaultValue={project.notes}
                />
                <Button>Save Notes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Files Tab */}
          <TabsContent value="files" className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {files.length} file{files.length !== 1 ? "s" : ""} uploaded
              </p>
              <Button className="gap-2">
                <Upload className="h-4 w-4" />
                Upload File
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {files.map((file) => (
                <Card key={file.id} className="border-border">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {file.type === "pdf" ? (
                          <FileText className="h-5 w-5 text-destructive" />
                        ) : (
                          <ImageIcon className="h-5 w-5 text-primary" />
                        )}
                        <div>
                          <CardTitle className="text-sm">{file.name}</CardTitle>
                          <CardDescription className="text-xs">
                            {file.size}
                          </CardDescription>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      Uploaded {new Date(file.uploadedAt).toLocaleDateString()}
                    </p>
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
