import React from 'react';
import { Link } from 'react-router-dom';
import { PATHS } from '../router/AppRoutes';
import useUserStore from '../store/useUserStore';
import { CuteCupIcon } from '../components/icons/UiIcons';

export default function NotFoundPage() {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-earth-beige via-[#F8F2EB] to-[#F1E5D8] p-4 font-sans text-center">
      <div className="max-w-md w-full bg-white/90 backdrop-blur-md border border-earth-rust/15 rounded-3xl p-8 shadow-xl flex flex-col items-center">
        <div className="w-14 h-14 bg-earth-rust/10 border border-earth-rust/20 text-earth-rust rounded-2xl flex items-center justify-center mb-4 shadow-xs">
          <CuteCupIcon className="w-7 h-7" />
        </div>

        <h1 className="text-4xl font-extrabold text-earth-maroon tracking-tight mb-2 font-display">404</h1>
        
        <p className="text-xs text-earth-maroon/70 max-w-xs mb-6 leading-relaxed">
          Looks like this page took an afternoon snack break or doesn't exist anymore.
        </p>

        <Link 
          to={isAuthenticated ? PATHS.DASHBOARD : PATHS.LOGIN} 
          className="inline-flex items-center gap-2 bg-earth-rust text-white px-6 py-2.5 rounded-full text-xs font-bold hover:bg-earth-maroon transition-all shadow-xs hover:shadow-sm"
        >
          Go Back {isAuthenticated ? 'to Studio' : 'Home'}
        </Link>
      </div>
    </div>
  );
}
