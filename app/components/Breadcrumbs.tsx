'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  currentPage?: string;
}

export default function Breadcrumbs({ items, currentPage }: BreadcrumbsProps) {
  const pathname = usePathname();

  // Auto-generate breadcrumbs from pathname if not provided
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    if (items) return items;

    const paths = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Dashboard', href: '/dashboard' }
    ];

    let currentPath = '';
    paths.forEach((path, index) => {
      // Skip dashboard since it's already added
      if (path === 'dashboard') return;

      // Skip IDs (UUIDs or numeric values)
      if (/^[0-9a-f-]{36}$|^\d+$/.test(path)) return;

      currentPath += `/${path}`;

      // Prettify the path name
      const label = path
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      // Don't make the last item clickable if it's the current page
      const isLast = index === paths.length - 1;

      breadcrumbs.push({
        label,
        href: isLast && !currentPage ? '' : currentPath
      });
    });

    return breadcrumbs;
  };

  const breadcrumbItems = getBreadcrumbs();

  // Add current page if provided
  if (currentPage && breadcrumbItems[breadcrumbItems.length - 1]?.href) {
    breadcrumbItems.push({ label: currentPage, href: '' });
  }

  return (
    <nav className="flex items-center space-x-2 text-sm mb-4">
      {breadcrumbItems.map((item, index) => (
        <div key={item.href || item.label} className="flex items-center">
          {index > 0 && (
            <span className="text-gray-400 mx-2">/</span>
          )}
          {item.href ? (
            <Link
              href={item.href}
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-600 font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
