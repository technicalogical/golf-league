'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navigation from './Navigation';

// Pages that shouldn't show navigation (unauthenticated pages)
const NO_NAV_PATHS = ['/', '/welcome'];

export default function NavigationWrapper() {
  const pathname = usePathname();
  const [displayName, setDisplayName] = useState<string>('User');
  const [showNav, setShowNav] = useState(false);

  useEffect(() => {
    // Don't show nav on landing page or welcome page
    if (NO_NAV_PATHS.includes(pathname)) {
      setShowNav(false);
      return;
    }

    // Fetch user profile for display name
    async function fetchProfile() {
      try {
        const response = await fetch('/api/profile');
        if (response.ok) {
          const data = await response.json();
          setDisplayName(data.display_name || data.name || data.email || 'User');
          setShowNav(true);
        }
      } catch (error) {
        // If fetch fails, user is probably not logged in
        setShowNav(false);
      }
    }

    fetchProfile();
  }, [pathname]);

  if (!showNav) {
    return null;
  }

  return <Navigation displayName={displayName} />;
}
