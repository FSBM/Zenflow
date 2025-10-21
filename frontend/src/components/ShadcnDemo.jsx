import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Settings, Plus, Menu, Download, Upload, Search } from "lucide-react";
import Dock from "./Dock";

const ShadcnDemo = () => {
  // Dock items configuration
  const dockItems = [
    {
      icon: <Plus size={20} />,
      label: "Add New",
      onClick: () => console.log("Add clicked")
    },
    {
      icon: <Search size={20} />,
      label: "Search",
      onClick: () => console.log("Search clicked")
    },
    {
      icon: <Download size={20} />,
      label: "Download",
      onClick: () => console.log("Download clicked")
    },
    {
      icon: <Upload size={20} />,
      label: "Upload",
      onClick: () => console.log("Upload clicked")
    },
    {
      icon: <Settings size={20} />,
      label: "Settings",
      onClick: () => console.log("Settings clicked")
    }
  ];

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground">
            shadcn/ui + Your Custom Dock
          </h1>
          <p className="text-muted-foreground">
            Beautiful UI components powered by shadcn/ui, with your custom dock preserved
          </p>
        </div>

        {/* Dock Component */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Custom Dock Component</CardTitle>
            <CardDescription>
              Your original dock component remains unchanged and fully functional
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Dock 
              items={dockItems}
              baseItemSize={48}
              className="bg-background/50 backdrop-blur-sm"
            />
          </CardContent>
        </Card>

        {/* shadcn/ui Components Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Buttons Card */}
          <Card>
            <CardHeader>
              <CardTitle>Buttons</CardTitle>
              <CardDescription>Various button styles from shadcn/ui</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button>Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
              <div className="flex gap-2">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="icon">
                  <Settings size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Form Card */}
          <Card>
            <CardHeader>
              <CardTitle>Form Components</CardTitle>
              <CardDescription>Input fields and labels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter your email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="Enter your password" />
              </div>
              <Button className="w-full">Submit</Button>
            </CardContent>
          </Card>

          {/* Badges Card */}
          <Card>
            <CardHeader>
              <CardTitle>Badges & Status</CardTitle>
              <CardDescription>Status indicators and badges</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-green-500">Success</Badge>
                <Badge className="bg-yellow-500">Warning</Badge>
                <Badge className="bg-blue-500">Info</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Interactive Components Card */}
          <Card>
            <CardHeader>
              <CardTitle>Interactive Components</CardTitle>
              <CardDescription>Dropdowns and sheets</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Menu className="mr-2 h-4 w-4" />
                    Open Menu
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuItem>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline">Open Sheet</Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Sheet Title</SheetTitle>
                    <SheetDescription>
                      This is a sheet component from shadcn/ui
                    </SheetDescription>
                  </SheetHeader>
                  <div className="py-4">
                    <p className="text-sm text-muted-foreground">
                      You can put any content here, including forms, lists, or other components.
                    </p>
                  </div>
                </SheetContent>
              </Sheet>
            </CardContent>
          </Card>
        </div>

        {/* Integration Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Integration Complete! 🎉</CardTitle>
            <CardDescription>
              What you now have in your project:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>✅ shadcn/ui installed and configured for JavaScript (not TypeScript)</li>
              <li>✅ Path aliases configured (@/components/ui/*)</li>
              <li>✅ Updated components (Login, Topbar, NoteCard, TaskCard) to use shadcn/ui</li>
              <li>✅ Your custom Dock component preserved and unchanged</li>
              <li>✅ CSS variables and theming integrated</li>
              <li>✅ Ready-to-use components: Button, Card, Input, Label, Badge, Sheet, DropdownMenu</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ShadcnDemo;
