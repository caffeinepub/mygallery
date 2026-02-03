export default function DecorativeBottomLine() {
  return (
    <div 
      className="fixed bottom-20 left-0 right-0 z-30 h-px bg-border/40 dark:bg-border/30 transition-colors duration-300"
      aria-hidden="true"
    />
  );
}
