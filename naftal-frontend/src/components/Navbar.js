'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

// SVG logo simplified, modern and adapted to NAFTAL colors
const LogoSVG = () => (
  <svg
    width="38"
    height="38"
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ marginRight: 8 }}
  >
    <circle cx="32" cy="32" r="30" fill="#013468" />
    <path
      d="M20 45 L28 19 L36 45 L44 19"
      stroke="#fa8800"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function Navbar() {
  const [user, setUser] = useState(null);

  const loadProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (err) {
      console.error('Navbar profile load error:', err);
    }
  };

  useEffect(() => {
    loadProfile();

    const handleAuthChange = () => {
      loadProfile();
    };

    window.addEventListener('auth-change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    window.dispatchEvent(new Event('auth-change'));
    window.location.href = '/';
  };

  return (
    <nav
      style={{
        background: 'linear-gradient(95deg, #013468 80%, #fa8800 100%)',
        padding: '0.75rem 2rem',
        display: 'flex',
        alignItems: 'center',
        boxShadow: '0 4px 15px rgba(1,52,104,0.15)',
        borderRadius: '0 0 16px 16px',
        color: 'white',
      }}
    >
      <Link href="/" passHref style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontWeight: 700,
            color: 'white',
            fontSize: 26,
            letterSpacing: '0.04em',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <LogoSVG />
          <span>Naftfix</span>
        </div>
      </Link>

      <div
        style={{
          display: 'flex',
          gap: '1.2rem',
          marginLeft: 'auto',
          alignItems: 'center',
        }}
      >
        <NavLink href="/" text="Accueil" />

        {user ? (
          <>
            {user.role === 'employe' && (
              <NavLink href="/Employe/dashboard" text="Espace Employé" />
            )}
            {user.role === 'technicien' && (
              <NavLink href="/Technicien/dashboard" text="Espace Technicien" />
            )}
            {user.role === 'admin' && (
              <NavLink href="/Admin/dashboard" text="Administration" />
            )}
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginLeft: '1rem' }}>
              <span style={{ fontSize: '14px', backgroundColor: 'rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: '20px', fontWeight: 600 }}>
                👤 {user.nom_complet} ({user.role === 'employe' ? 'Employé' : user.role === 'technicien' ? 'Technicien' : 'Admin'})
              </span>
              <button
                onClick={handleLogout}
                style={{
                  background: '#fa8800',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 16px',
                  fontWeight: 600,
                  fontSize: '15px',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseOver={e => e.target.style.background = '#e37400'}
                onMouseOut={e => e.target.style.background = '#fa8800'}
              >
                Déconnexion
              </button>
            </div>
          </>
        ) : (
          <>
            <NavLink href="/Employe/authentification" text="Espace Employé" />
            <NavLink href="/Technicien/authentification" text="Espace Technicien" />
            <NavLink href="/Admin/authentification" text="Espace Admin" />
          </>
        )}
      </div>
    </nav>
  );
}

function NavLink({ href, text }) {
  return (
    <Link href={href} passHref style={{ textDecoration: 'none' }}>
      <span
        style={{
          color: '#fff',
          fontWeight: 500,
          fontSize: 16,
          padding: '6px 14px',
          borderRadius: 8,
          cursor: 'pointer',
          transition: 'background 0.18s',
          display: 'inline-block',
        }}
        onMouseOver={e => (e.target.style.background = 'rgba(250, 136, 0, 0.4)')}
        onMouseOut={e => (e.target.style.background = 'unset')}
      >
        {text}
      </span>
    </Link>
  );
}
