import React from 'react';
import { User, AppState } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user?: User;
  onLogout?: () => void;
  onNavigate?: (state: AppState) => void;
  currentState: AppState;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, onNavigate, currentState }) => {
  return (
    <div className="min-h-screen flex flex-col items-center">
      <div className="w-full bg-white shadow-md border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate?.('DASHBOARD')}>
            <div className="w-12 h-12 rounded-full bg-[#2E5D4E] flex items-center justify-center text-white text-xl font-bold">
              GB
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-[#2E5D4E] tracking-tight">
                Germiston Baptist Church
              </h1>
              <p className="text-xs text-gray-400 uppercase font-bold tracking-[0.2em]">
                Child Protection Portal
              </p>
            </div>
          </div>
          {user && (
            <div className="flex items-center gap-6">
              <nav className="hidden md:flex items-center gap-4 mr-4">
                <button 
                  onClick={() => onNavigate?.('DASHBOARD')}
                  className={`text-sm font-bold transition-colors ${currentState === 'DASHBOARD' ? 'text-[#2E5D4E]' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  Home
                </button>
                {user.isAdmin && (
                  <button 
                    onClick={() => onNavigate?.('ADMIN')}
                    className={`text-sm font-bold px-3 py-1 rounded bg-green-50 transition-colors ${currentState === 'ADMIN' ? 'text-[#2E5D4E] ring-1 ring-[#2E5D4E]' : 'text-green-600 hover:bg-green-100'}`}
                  >
                    Admin
                  </button>
                )}
              </nav>

              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-gray-800">{user.name}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">{user.gradeTaught}</p>
                </div>
                <button 
                  onClick={onLogout}
                  className="text-sm px-4 py-2 border border-gray-200 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <main className="w-full max-w-4xl px-6 py-12">
        {children}
      </main>
      <footer className="w-full py-8 mt-auto text-center text-gray-400 text-sm">
        <p>© {new Date().getFullYear()} Germiston Baptist Church. Internal Policy Test Portal.</p>
        <div className="mt-2 space-x-4">
          <a href="#" className="hover:text-gray-600">Help Center</a>
          <a href="#" className="hover:text-gray-600">Privacy Policy</a>
        </div>
      </footer>
    </div>
  );
};