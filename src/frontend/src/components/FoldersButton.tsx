interface FoldersButtonProps {
  onClick: () => void;
}

export default function FoldersButton({ onClick }: FoldersButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-16 left-6 z-40 flex flex-col items-center gap-1.5 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg p-2"
      aria-label="Folders"
    >
      <div className="relative">
        <img
          src="/assets/generated/light-blue-folder-icon-transparent.dim_64x64.png"
          alt="Folders"
          className="w-[5.5rem] h-[5.5rem] drop-shadow-lg transition-all duration-200"
          style={{
            filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
          }}
        />
      </div>
      <span className="text-xs font-medium text-foreground">Folders</span>
    </button>
  );
}
