import React from 'react';
import { Calendar, DollarSign, User, Trash2, CheckIcon } from 'lucide-react';
import { formatDate, formatCurrency } from '../utils/helpers';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const TaskCard = ({ task, onEdit, onDelete }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'todo':
        return <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />;
      case 'in-progress':
        return <div className="w-4 h-4 rounded-full border-2 border-primary bg-muted" />;
      case 'done':
        return <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
          <CheckIcon className="w-2 h-2 text-primary-foreground" />
        </div>;
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'bg-muted text-muted-foreground';
      case 'medium': return 'bg-secondary text-secondary-foreground';
      case 'high': return 'bg-primary text-primary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'todo': return 'bg-muted text-muted-foreground';
      case 'in-progress': return 'bg-secondary text-secondary-foreground';
      case 'done': return 'bg-primary text-primary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card 
      className="group cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/20 animate-fade-in" 
      onClick={() => onEdit && onEdit(task)}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3 flex-1">
            <div className="mt-1">
              {getStatusIcon(task.status)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground truncate mb-1">{task.title}</h3>
              {task.description && (
                <p className="text-muted-foreground text-sm line-clamp-2">
                  {task.description}
                </p>
              )}
            </div>
          </div>
          
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task._id);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-muted-foreground hover:text-destructive"
            >
              <Trash2 size={16} />
            </Button>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Badge variant="outline" className={getPriorityColor(task.priority)}>
              <div className="w-2 h-2 rounded-full bg-current mr-1" />
              {task.priority}
            </Badge>
            
            {task.dueDate && (
              <div className="flex items-center space-x-1 text-muted-foreground text-sm">
                <Calendar size={12} />
                <span>{formatDate(task.dueDate)}</span>
              </div>
            )}
            
            {task.assignedTo && (
              <div className="flex items-center space-x-1 text-muted-foreground text-sm">
                <User size={12} />
                <span className="truncate max-w-24">{task.assignedTo.name}</span>
              </div>
            )}
          </div>

          {task.price && (
            <div className="flex items-center space-x-1 text-foreground font-medium">
              <DollarSign size={12} />
              <span>{formatCurrency(task.price)}</span>
            </div>
          )}
        </div>

        <div className="mt-4">
          <Badge className={getStatusColor(task.status)}>
            {task.status.replace('-', ' ')}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
