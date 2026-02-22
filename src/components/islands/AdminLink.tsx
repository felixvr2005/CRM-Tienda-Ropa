/**
 * AdminLink - Island component que verifica si el usuario es admin
 * y muestra el enlace al panel de administración.
 * Permite que PublicLayout sea SSG-compatible.
 */
import { useEffect, useState } from 'react';

export default function AdminLink() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      try {
        const res = await fetch('/api/admin/check-auth');
        if (res.ok) {
          const data = await res.json();
          if (data.isAdmin) setIsAdmin(true);
        }
      } catch {
        // Not admin or not logged in
      }
    }
    checkAdmin();
  }, []);

  if (!isAdmin) return null;

  return (
    <a
      href="/admin"
      className="hidden sm:block px-3 py-2 text-xs tracking-widest uppercase font-medium rounded-full bg-primary-100 text-primary-900 hover:bg-primary-200 transition-all"
      title="Ir al panel de admin"
    >
      Admin
    </a>
  );
}
