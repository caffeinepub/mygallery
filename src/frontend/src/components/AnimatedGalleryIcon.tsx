import React from 'react';

export default function AnimatedGalleryIcon() {
  return (
    <div className="relative h-10 w-10 group cursor-pointer">
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
      >
        {/* Camera body */}
        <rect
          x="8"
          y="20"
          width="48"
          height="32"
          rx="4"
          className="fill-primary stroke-primary transition-all duration-300 group-hover:fill-primary/90"
          strokeWidth="2"
        />
        
        {/* Camera lens outer ring */}
        <circle
          cx="32"
          cy="36"
          r="10"
          className="fill-background stroke-primary transition-all duration-300"
          strokeWidth="2"
        />
        
        {/* Camera lens inner circle with pulse animation */}
        <circle
          cx="32"
          cy="36"
          r="6"
          className="fill-primary/30 transition-all duration-300 group-hover:animate-pulse"
        />
        
        {/* Flash indicator with glow effect */}
        <rect
          x="46"
          y="24"
          width="6"
          height="4"
          rx="1"
          className="fill-accent transition-all duration-500 group-hover:fill-yellow-400 group-hover:drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]"
        />
        
        {/* Viewfinder */}
        <rect
          x="12"
          y="24"
          width="8"
          height="6"
          rx="1"
          className="fill-background/50 stroke-primary/50 transition-all duration-300"
          strokeWidth="1"
        />
        
        {/* Camera top handle */}
        <path
          d="M 24 20 L 28 14 L 36 14 L 40 20"
          className="stroke-primary fill-none transition-all duration-300"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Shutter button */}
        <circle
          cx="48"
          cy="16"
          r="3"
          className="fill-accent transition-all duration-300 group-hover:fill-accent/80 group-hover:scale-90"
          style={{ transformOrigin: '48px 16px' }}
        />
        
        {/* Flash rays - animated on hover */}
        <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <line
            x1="49"
            y1="20"
            x2="52"
            y2="18"
            className="stroke-yellow-400"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1="52"
            y1="24"
            x2="56"
            y2="24"
            className="stroke-yellow-400"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1="49"
            y1="28"
            x2="52"
            y2="30"
            className="stroke-yellow-400"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </g>
      </svg>
      
      {/* Subtle glow effect on hover */}
      <div className="absolute inset-0 rounded-full bg-primary/0 group-hover:bg-primary/10 transition-all duration-300 blur-sm" />
    </div>
  );
}
