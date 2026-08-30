import React from 'react';
import { Link } from 'react-router-dom';
import { PATHS } from '../router/AppRoutes';
import useUserStore from '../store/useUserStore';

export default function NotFoundPage() {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-earth-green p-4 font-sans text-center">
      
      {/* Glitch/Brand Accent */}
      <div className="w-16 h-16 bg-earth-beige border border-earth-rust/40 text-earth-maroon rounded-2xl flex items-center justify-center mb-6 shadow-lg rotate-12">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 -rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>

      <h1 className="text-5xl sm:text-7xl font-bold text-earth-beige tracking-tight mb-2">404</h1>
      <h2 className="text-lg sm:text-xl font-medium text-earth-beige/90 mb-4">Page not found</h2>
      
      <p className="text-sm sm:text-base text-earth-beige/70 max-w-md mb-8">
        Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
      </p>

      <Link 
        to={isAuthenticated ? PATHS.DASHBOARD : PATHS.LOGIN} 
        className="inline-flex items-center gap-2 bg-earth-rust text-earth-beige px-5 py-2.5 rounded-md text-sm font-bold hover:bg-earth-maroon transition-colors focus:outline-none focus:ring-2 focus:ring-earth-rust focus:ring-offset-2 focus:ring-offset-earth-green shadow-md"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Go back {isAuthenticated ? 'to Dashboard' : 'home'}
      </Link>
    </div>
  );
}