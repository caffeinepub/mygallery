interface FoldersButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export default function FoldersButton({ onClick, disabled = false }: FoldersButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`fixed bottom-16 left-6 z-40 flex flex-col items-center gap-1.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg p-2 ${
        disabled 
          ? 'opacity-50 cursor-not-allowed' 
          : 'hover:scale-105 cursor-pointer'
      }`}
      aria-label="Folders"
    >
      <div className="relative">
        <img
          src="/assets/generated/dark-blue-folder-icon-transparent.dim_64x64.png"
          alt="Folders"
          className="w-[5.5rem] h-[5.5rem] transition-all duration-200"
          style={{
            filter: 'var(--folder-icon-filter)',
          }}
        />
      </div>
      <span className="text-xs font-medium text-foreground">Folders</span>
    </button>
  );
}
