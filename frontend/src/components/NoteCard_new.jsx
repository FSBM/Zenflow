import React from 'react';
import { StickyNote, Trash2 } from 'lucide-react';
import { formatRelativeTime } from '../utils/helpers';
import AnimatedCard from './AnimatedCard';

const NoteCard = ({ note, onDelete }) => {
  return (
    <AnimatedCard className="group animate-slide-up" padding="p-6">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gray-100 rounded group-hover:bg-gray-200 transition-colors">
            <StickyNote className="h-4 w-4 text-gray-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">
              {formatRelativeTime(note.createdAt)}
            </p>
            {note.createdBy && (
              <p className="text-xs text-gray-400 mt-1">
                by {note.createdBy.name || 'Unknown User'}
              </p>
            )}
          </div>
        </div>
        
        {onDelete && (
          <button
            onClick={() => onDelete(note._id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-red-500"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <div className="prose prose-sm max-w-none">
        <p className="text-primary whitespace-pre-wrap">{note.content}</p>
      </div>
    </AnimatedCard>
  );
};

export default NoteCard;
