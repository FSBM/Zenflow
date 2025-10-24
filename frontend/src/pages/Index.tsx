import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FolderKanban, ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="max-w-2xl space-y-8 px-4 text-center">
        <div className="flex justify-center">
          <img src="/zenflow.svg" alt="zenflow" className="h-16 w-16" />
        </div>
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight">zenflow</h1>
          <p className="text-xl text-muted-foreground">
            A modern project and task management system built for teams who value
            simplicity and efficiency.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/login">
            <Button size="lg" className="w-full gap-2 sm:w-auto">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/home">
            <Button size="lg" variant="secondary" className="w-full sm:w-auto">
              View Demo
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
