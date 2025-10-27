import { Badge } from "@/components/ui/badge";

type Status = 'active' | 'inactive' | 'upcoming' | 'completed' | 'scheduled' | 'pending' | 'ended';

interface StatusBadgeProps {
  status: Status;
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
}

export default function StatusBadge({ status, size = 'md', children }: StatusBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  };

  const displayText = children || status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <Badge variant={status} className={sizeClasses[size]}>
      {displayText}
    </Badge>
  );
}
