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
        {/* Outer target ring */}
        <circle
          cx="32"
          cy="32"
          r="28"
          className="fill-none stroke-missions-accent transition-all duration-300 group-hover:stroke-missions-accent-hover"
          strokeWidth="2"
        />
        
        {/* Middle target ring */}
        <circle
          cx="32"
          cy="32"
          r="20"
          className="fill-none stroke-missions-accent transition-all duration-300 group-hover:stroke-missions-accent-hover"
          strokeWidth="2.5"
        />
        
        {/* Inner target ring */}
        <circle
          cx="32"
          cy="32"
          r="12"
          className="fill-none stroke-missions-accent transition-all duration-300 group-hover:stroke-missions-accent-hover"
          strokeWidth="3"
        />
        
        {/* Center bullseye with pulse animation */}
        <circle
          cx="32"
          cy="32"
          r="6"
          className="fill-missions-accent transition-all duration-300 group-hover:animate-pulse group-hover:fill-missions-accent-hover"
        />
        
        {/* Crosshair vertical line */}
        <line
          x1="32"
          y1="4"
          x2="32"
          y2="60"
          className="stroke-missions-accent transition-all duration-300 group-hover:stroke-missions-accent-hover"
          strokeWidth="2"
          strokeLinecap="round"
        />
        
        {/* Crosshair horizontal line */}
        <line
          x1="4"
          y1="32"
          x2="60"
          y2="32"
          className="stroke-missions-accent transition-all duration-300 group-hover:stroke-missions-accent-hover"
          strokeWidth="2"
          strokeLinecap="round"
        />
        
        {/* Corner markers - top left */}
        <path
          d="M 8 8 L 8 14 M 8 8 L 14 8"
          className="stroke-missions-accent transition-all duration-300 group-hover:stroke-missions-accent-hover"
          strokeWidth="2"
          strokeLinecap="round"
        />
        
        {/* Corner markers - top right */}
        <path
          d="M 56 8 L 56 14 M 56 8 L 50 8"
          className="stroke-missions-accent transition-all duration-300 group-hover:stroke-missions-accent-hover"
          strokeWidth="2"
          strokeLinecap="round"
        />
        
        {/* Corner markers - bottom left */}
        <path
          d="M 8 56 L 8 50 M 8 56 L 14 56"
          className="stroke-missions-accent transition-all duration-300 group-hover:stroke-missions-accent-hover"
          strokeWidth="2"
          strokeLinecap="round"
        />
        
        {/* Corner markers - bottom right */}
        <path
          d="M 56 56 L 56 50 M 56 56 L 50 56"
          className="stroke-missions-accent transition-all duration-300 group-hover:stroke-missions-accent-hover"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      
      {/* Subtle glow effect on hover */}
      <div className="absolute inset-0 rounded-full bg-missions-accent/0 group-hover:bg-missions-accent/10 transition-all duration-300 blur-sm" />
    </div>
  );
}
