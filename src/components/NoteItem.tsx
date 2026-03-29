import type { Note } from '../types/ticket';
import { AgentAvatar } from './AgentAvatar';
import { Lock } from 'lucide-react';

interface NoteItemProps {
  note: Note;
}

export function NoteItem({ note }: NoteItemProps) {
  const formattedDate = new Date(note.timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div className="flex gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
      <AgentAvatar agent={note.author} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm text-gray-900">{note.author.name}</span>
          <span className="text-xs text-gray-500">{formattedDate}</span>
          {note.isInternal && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-amber-50 text-amber-700 border border-amber-200">
              <Lock className="w-3 h-3" />
              Internal
            </span>
          )}
        </div>
        <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
      </div>
    </div>
  );
}
