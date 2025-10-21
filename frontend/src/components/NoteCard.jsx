import React from 'react';
import { StickyNote, Trash2 } from 'lucide-react';
import { formatRelativeTime } from '../utils/helpers';

const NoteCard = ({ note, onDelete }) => {
  return (
    <div className="notion-card p-6 group hover:bg-notion-surface/50 transition-all duration-150">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
            <StickyNote className="h-4 w-4 text-purple-400" />
          </div>
          <div>
            <p className="text-sm text-notion-text-muted">
              {formatRelativeTime(note.createdAt)}
            </p>
            {note.createdBy && (
              <p className="text-xs text-notion-text-muted mt-1">
                by {note.createdBy.name || 'Unknown User'}
              </p>
            )}
          </div>
        </div>
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(note._id);
            }}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-notion-surface rounded transition-all text-red-400"
            title="Delete note"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
      
      <div className="prose prose-sm max-w-none text-notion-text">
        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          {note.body}
        </p>
      </div>
      
      <div className="mt-4 pt-3 border-t border-notion-border">
        <div className="flex items-center justify-between text-xs text-notion-text-muted">
          <span>Note</span>
          <span>{note.body.length} characters</span>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
