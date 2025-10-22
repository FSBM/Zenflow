import { Badge } from "@/components/ui/badge";
import { Circle, CheckCircle2, Clock, XCircle } from "lucide-react";

type Status = "Backlog" | "Todo" | "In Progress" | "Done" | "Canceled";

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const StatusBadge = ({ status, className = "" }: StatusBadgeProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case "Backlog":
        return {
          icon: Circle,
          className: "bg-status-backlog/10 text-status-backlog border-status-backlog/20",
        };
      case "Todo":
        return {
          icon: Circle,
          className: "bg-status-todo/10 text-status-todo border-status-todo/20",
        };
      case "In Progress":
        return {
          icon: Clock,
          className: "bg-status-progress/10 text-status-progress border-status-progress/20",
        };
      case "Done":
        return {
          icon: CheckCircle2,
          className: "bg-status-done/10 text-status-done border-status-done/20",
        };
      case "Canceled":
        return {
          icon: XCircle,
          className: "bg-status-canceled/10 text-status-canceled border-status-canceled/20",
        };
      default:
        return {
          icon: Circle,
          className: "bg-muted text-muted-foreground",
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`gap-1.5 ${config.className} ${className}`}>
      <Icon className="h-3 w-3" />
      {status}
    </Badge>
  );
};

export default StatusBadge;
