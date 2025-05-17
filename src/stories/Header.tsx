import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

type Module = {
  id: string;
  name: string;
  url: string;
};

type User = {
  name: string;
  avatarUrl?: string;
};

export interface HeaderProps {
  user?: User;
  links?: Module[];
  onLogin?: () => void;
  onLogout?: () => void;
  onCreateAccount?: () => void;
  onSelectModule?: (module: Module) => void;
  pathname?: string;
}

export const Header = ({
  user,
  links = [],
  onLogin,
  onLogout,
  onSelectModule,
  pathname = '/',
}: HeaderProps) => {
  const isActive = (path: string) => (pathname === path ? 'bg-primary text-white' : '');

  return (
    <div className="navbar h-16 bg-base-100 shadow-sm pl-6">
      <div className="navbar-start">
        <Image src="/logo.png" alt="Mairie360" width={50} height={50} className="rounded" />
        <Link className="ml-4 text-xl font-bold hidden lg:block" href="/">Mairie360</Link>
      </div>

      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          {links.map((link) => (
            <li key={link.id}>
              <button
                className={`btn btn-ghost ${isActive(link.url)}`}
                onClick={() => onSelectModule?.(link)}
              >
                {link.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="navbar-end gap-2">
        <button className="btn btn-ghost btn-circle">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>

        <button className="btn btn-ghost btn-circle">
          <div className="indicator">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 00-4-5.7V5a2 2 0 10-4 0v.3C7.7 6.2 6 8.4 6 11v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1h6z" />
            </svg>
            <span className="badge badge-xs badge-primary indicator-item"></span>
          </div>
        </button>

        {user ? (
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full">
                <Image
                  src={user.avatarUrl || "/logo.png"}
                  alt="avatar"
                  width={50}
                  height={50}
                  className="rounded-full"
                />
              </div>
            </div>
            <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
              <li><a className="justify-between">Profile <span className="badge">New</span></a></li>
              <li><a>Settings</a></li>
              <li><button onClick={onLogout}>Logout</button></li>
            </ul>
          </div>
        ) : (
          <button className="btn btn-sm" onClick={onLogin}>Log in</button>
        )}
      </div>
    </div>
  );
};
