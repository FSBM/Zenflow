import React from 'react';
import { Calendar, DollarSign, User, Trash2 } from 'lucide-react';
import { formatDate, formatCurrency } from '../utils/helpers';
import AnimatedCard from './AnimatedCard';

const TaskCard = ({ task, onEdit, onDelete }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'todo':
        return <div className="w-4 h-4 rounded-full border-2 border-gray-400" />;
      case 'in-progress':
        return <div className="w-4 h-4 rounded-full border-2 border-gray-600 bg-gray-100" />;
      case 'done':
        return <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
          <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>;
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-gray-400" />;
    }
  };

  const getPriorityDot = (priority) => {
    const colors = {
      low: 'bg-gray-400',
      medium: 'bg-gray-600', 
      high: 'bg-primary'
    };
    return <div className={`w-2 h-2 rounded-full ${colors[priority] || colors.medium}`} />;
  };

  return (
    <AnimatedCard 
      className="group animate-slide-up cursor-pointer" 
      padding="p-6" 
      onClick={() => onEdit && onEdit(task)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3 flex-1">
          <div className="mt-1">
            {getStatusIcon(task.status)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-primary truncate">{task.title}</h3>
            {task.description && (
              <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>
        </div>
        
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task._id);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-red-500"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            {getPriorityDot(task.priority)}
            <span className="text-gray-500 capitalize">{task.priority}</span>
          </div>
          
          {task.dueDate && (
            <div className="flex items-center space-x-1 text-gray-500">
              <Calendar size={12} />
              <span>{formatDate(task.dueDate)}</span>
            </div>
          )}
          
          {task.assignedTo && (
            <div className="flex items-center space-x-1 text-gray-500">
              <User size={12} />
              <span className="truncate max-w-24">{task.assignedTo.name}</span>
            </div>
          )}
        </div>

        {task.price && (
          <div className="flex items-center space-x-1 text-gray-600">
            <DollarSign size={12} />
            <span>{formatCurrency(task.price)}</span>
          </div>
        )}
      </div>

      <div className="mt-3">
        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium capitalize status-${task.status}`}>
          {task.status.replace('-', ' ')}
        </span>
      </div>
    </AnimatedCard>
  );
};

export default TaskCard;
