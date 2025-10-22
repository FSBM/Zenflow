import { ArrowUp, ArrowRight, ArrowDown } from "lucide-react";

type Priority = "High" | "Medium" | "Low";

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

const PriorityBadge = ({ priority, className = "" }: PriorityBadgeProps) => {
  const getPriorityConfig = () => {
    switch (priority) {
      case "High":
        return {
          icon: ArrowUp,
          className: "text-priority-high",
        };
      case "Medium":
        return {
          icon: ArrowRight,
          className: "text-priority-medium",
        };
      case "Low":
        return {
          icon: ArrowDown,
          className: "text-priority-low",
        };
      default:
        return {
          icon: ArrowRight,
          className: "text-muted-foreground",
        };
    }
  };

  const config = getPriorityConfig();
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <Icon className={`h-4 w-4 ${config.className}`} />
      <span className={config.className}>{priority}</span>
    </div>
  );
};

export default PriorityBadge;
