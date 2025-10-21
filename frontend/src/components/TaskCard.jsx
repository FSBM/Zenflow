import React, { useState, useEffect, useRef } from 'react';
import { Calendar, DollarSign, Paperclip, User, MoreHorizontal, Edit, Trash2, Check, X } from 'lucide-react';
import { formatDate, formatCurrency, getStatusColor, getPriorityColor } from '../utils/helpers';

const TaskCard = ({ task, onClick, onUpdate, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const getPriorityDot = (priority) => {
    const colorClass = getPriorityColor(priority);
    return <div className={`w-2 h-2 rounded-full ${colorClass.replace('text-', 'bg-')}`} />;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'todo':
        return <div className="w-4 h-4 rounded-full border-2 border-gray-400" />;
      case 'in-progress':
        return <div className="w-4 h-4 rounded-full border-2 border-yellow-400 bg-yellow-400/20" />;
      case 'done':
        return <div className="w-4 h-4 rounded-full bg-green-400 flex items-center justify-center">
          <svg className="w-2 h-2 text-green-900" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>;
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-gray-400" />;
    }
  };

  return (
    <div
      onClick={() => onClick?.(task)}
      className="notion-card p-4 cursor-pointer hover:bg-notion-surface/50 transition-all duration-150 group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3 flex-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              const newStatus = task.status === 'done' ? 'todo' : 
                             task.status === 'todo' ? 'in-progress' : 'done';
              onUpdate?.(task._id, { status: newStatus });
            }}
            className="hover:bg-notion-surface p-1 rounded transition-colors"
          >
            {getStatusIcon(task.status)}
          </button>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-notion-text truncate group-hover:text-notion-accent transition-colors">
              {task.title}
            </h3>
          </div>
        </div>
        <div className="flex items-center space-x-2 ml-2">
          {getPriorityDot(task.priority)}
          <span className={`text-xs capitalize ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
          {(onUpdate || onDelete) && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-notion-surface rounded transition-all"
              >
                <MoreHorizontal size={14} />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 top-8 bg-notion-surface border border-notion-border rounded-lg py-2 z-10 min-w-32">
                  {onUpdate && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        // You can implement edit functionality here
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-notion-text hover:bg-notion-border flex items-center space-x-2"
                    >
                      <Edit size={12} />
                      <span>Edit</span>
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        onDelete(task._id);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-notion-border flex items-center space-x-2"
                    >
                      <Trash2 size={12} />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-notion-text-muted text-sm mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Metadata */}
      <div className="space-y-2">
        {/* Dates */}
        {(task.startDate || task.dueDate) && (
          <div className="flex items-center space-x-4 text-xs text-notion-text-muted">
            {task.startDate && (
              <div className="flex items-center space-x-1">
                <Calendar size={12} />
                <span>Start: {formatDate(task.startDate)}</span>
              </div>
            )}
            {task.dueDate && (
              <div className="flex items-center space-x-1">
                <Calendar size={12} />
                <span className={new Date(task.dueDate) < new Date() ? 'text-red-400' : ''}>
                  Due: {formatDate(task.dueDate)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Price and Attachments */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {task.price > 0 && (
              <div className="flex items-center space-x-1 text-xs text-notion-text-muted">
                <DollarSign size={12} />
                <span>{formatCurrency(task.price)}</span>
              </div>
            )}
            
            {task.attachments?.length > 0 && (
              <div className="flex items-center space-x-1 text-xs text-notion-text-muted">
                <Paperclip size={12} />
                <span>{task.attachments.length}</span>
              </div>
            )}
          </div>

          {/* Assignee */}
          {task.assignees?.length > 0 && (
            <div className="flex -space-x-1">
              {task.assignees.slice(0, 3).map((assignee, index) => (
                <div
                  key={assignee._id || index}
                  className="w-6 h-6 bg-notion-accent rounded-full flex items-center justify-center text-white text-xs border-2 border-notion-surface"
                  title={assignee.name}
                >
                  {assignee.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              ))}
              {task.assignees.length > 3 && (
                <div className="w-6 h-6 bg-notion-border rounded-full flex items-center justify-center text-notion-text-muted text-xs border-2 border-notion-surface">
                  +{task.assignees.length - 3}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Status Badge */}
      <div className="mt-3 pt-3 border-t border-notion-border">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(task.status)} bg-current/10`}>
          {task.status.replace('-', ' ')}
        </span>
      </div>
    </div>
  );
};

export default TaskCard;
