import { Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MissionTargetIconProps {
  className?: string;
  size?: number;
}

export default function MissionTargetIcon({ className, size = 16 }: MissionTargetIconProps) {
  return (
    <Target 
      className={cn('text-missions-accent', className)} 
      style={{ width: size, height: size }}
    />
  );
}
