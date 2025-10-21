import React from 'react';
import { StickyNote, Trash2 } from 'lucide-react';
import { formatRelativeTime } from '../utils/helpers';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const NoteCard = ({ note, onDelete }) => {
  return (
    <Card className="p-6 group hover:bg-accent/50 transition-all duration-150 border-border">
      <CardContent className="p-0">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
              <StickyNote className="h-4 w-4 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {formatRelativeTime(note.createdAt)}
              </p>
              {note.createdBy && (
                <p className="text-xs text-muted-foreground mt-1">
                  by {note.createdBy.name || 'Unknown User'}
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
                onDelete(note._id);
              }}
              className="opacity-0 group-hover:opacity-100 h-8 w-8 text-destructive hover:text-destructive"
              title="Delete note"
            >
              <Trash2 size={14} />
            </Button>
          )}
        </div>
        
        <div className="prose prose-sm max-w-none text-foreground">
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {note.body}
          </p>
        </div>
        
        <div className="mt-4 pt-3 border-t border-border">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Note</span>
            <span>{note.body.length} characters</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NoteCard;
