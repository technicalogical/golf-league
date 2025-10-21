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

  const colorClasses: Record<Status, string> = {
    active: 'bg-green-100 text-green-800 border-green-200',
    inactive: 'bg-gray-100 text-gray-800 border-gray-200',
    upcoming: 'bg-blue-100 text-blue-800 border-blue-200',
    completed: 'bg-purple-100 text-purple-800 border-purple-200',
    scheduled: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    pending: 'bg-orange-100 text-orange-800 border-orange-200',
    ended: 'bg-red-100 text-red-800 border-red-200'
  };

  const displayText = children || status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span
      className={`inline-flex items-center font-semibold rounded border ${sizeClasses[size]} ${colorClasses[status]}`}
    >
      {displayText}
    </span>
  );
}
