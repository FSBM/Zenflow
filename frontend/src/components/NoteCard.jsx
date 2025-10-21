import React from 'react';
import { StickyNote, Trash2 } from 'lucide-react';
import { formatRelativeTime } from '../utils/helpers';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const NoteCard = ({ note, onDelete }) => {
  return (
    <Card className="group transition-all duration-200 hover:shadow-md hover:border-primary/20 animate-fade-in">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-muted rounded-md group-hover:bg-accent transition-colors">
              <StickyNote className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {formatRelativeTime(note.createdAt)}
              </p>
              {note.createdBy && (
                <p className="text-xs text-muted-foreground/80 mt-1">
                  by {note.createdBy.name || 'Unknown User'}
                </p>
              )}
            </div>
          </div>
          
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(note._id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-muted-foreground hover:text-destructive"
            >
              <Trash2 size={16} />
            </Button>
          )}
        </div>

        <div className="prose prose-sm max-w-none">
          <p className="text-foreground whitespace-pre-wrap leading-relaxed">{note.content}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default NoteCard;
