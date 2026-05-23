import React, { useState } from 'react';
import { Badge } from './ui/badge';
import { X } from 'lucide-react';

interface TagBadgeProps {
  tag: string;
  isAdded: boolean;
  color: string;
  colorDark: string;
  onClick: () => void;
}

export function TagBadge({ tag, isAdded, color, colorDark, onClick }: TagBadgeProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Badge
      variant="outline"
      className="text-xs cursor-pointer transition-all h-6 px-2.5 inline-flex items-center gap-1.5"
      style={
        isAdded 
          ? { 
              backgroundColor: isHovered ? colorDark : color, 
              color: 'white',
              borderColor: isHovered ? colorDark : color
            }
          : { 
              backgroundColor: isHovered ? color : 'transparent',
              color: isHovered ? 'white' : color,
              borderColor: color
            }
      }
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {tag}
      {isAdded && <X className="w-3 h-3" />}
    </Badge>
  );
}
