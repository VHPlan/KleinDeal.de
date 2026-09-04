'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function PresenceTracker() {
  const pathname = usePathname();
  const sessionIdRef = useRef<string>('');

  useEffect(() => {
    // Generate or retrieve ephemeral session ID
    if (typeof window !== 'undefined') {
      let sid = sessionStorage.getItem('kleindeal_presence_sid');
      if (!sid) {
        sid = 'client_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
        sessionStorage.setItem('kleindeal_presence_sid', sid);
      }
      sessionIdRef.current = sid;
    }

    const sendHeartbeat = async () => {
      try {
        await fetch('/api/presence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            page: window.location.pathname || '/',
            sessionId: sessionIdRef.current,
          }),
        });
      } catch (_) {}
    };

    // Initial ping
    sendHeartbeat();

    // Periodic heartbeat every 30 seconds
    const interval = setInterval(sendHeartbeat, 30000);

    return () => clearInterval(interval);
  }, [pathname]);

  return null;
}

