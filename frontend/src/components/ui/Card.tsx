import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Card: React.FC<{ children: React.ReactNode, className?: string, onClick?: () => void }> = ({ children, className, onClick }) => (
  <div 
    onClick={onClick}
    className={cn(
      "bg-black border border-white/10 rounded-2xl overflow-hidden shadow-sm", 
      onClick && "cursor-pointer",
      className
    )}
  >
    {children}
  </div>
);

export const CardHeader: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
  <div className={cn("px-6 py-4 border-b border-white/5", className)}>
    {children}
  </div>
);

export const CardContent: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
  <div className={cn("px-6 py-4", className)}>
    {children}
  </div>
);

export const CardFooter: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
  <div className={cn("px-6 py-4 bg-white/[0.02] border-t border-white/5", className)}>
    {children}
  </div>
);
