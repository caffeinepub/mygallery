import { FileText } from 'lucide-react';

interface NotesButtonProps {
  onClick: () => void;
}

export default function NotesButton({ onClick }: NotesButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-16 left-32 z-40 flex flex-col items-center gap-1.5 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-notes-accent focus:ring-offset-2 rounded-lg p-2 group"
      aria-label="Notes"
    >
      <div className="relative">
        <div className="w-[5.5rem] h-[5.5rem] flex items-center justify-center rounded-xl bg-notes-bg transition-all duration-200 group-hover:bg-notes-bg-hover">
          <FileText 
            className="w-10 h-10 text-notes-accent transition-all duration-200 group-hover:scale-110 animate-notes-float" 
            strokeWidth={1.5}
          />
        </div>
      </div>
      <span className="text-xs font-medium text-notes-accent">Notes</span>
    </button>
  );
}
