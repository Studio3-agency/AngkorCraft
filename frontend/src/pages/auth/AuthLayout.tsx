import React from 'react';
import { Link } from 'react-router-dom';
import { LanguageToggle } from '../../components/LanguageToggle';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}

/** Shared shell for the login / signup screens. */
export const AuthLayout: React.FC<AuthLayoutProps> = ({ title, subtitle, children, footer }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#2C221E]">
      <div className="flex-1 flex items-center justify-center px-4 py-10 sm:py-12">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between mb-8">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-full shadow-lg overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                <img src="/logo.png" alt="AngkorCraft" className="w-full h-full object-contain" />
              </div>
              <div className="font-heading font-extrabold text-3xl tracking-tight text-[#134E4A] !font-['Poppins',sans-serif]">
                ANGKOR<span className="text-[#BF5A36]">CRAFT</span>
              </div>
            </Link>
            <LanguageToggle />
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-[#E8DEC8] p-7 sm:p-10">
            <h1 className="font-sans text-2xl sm:text-3xl font-bold text-[#134E4A] mb-1.5">{title}</h1>
            <p className="text-sm text-[#8C7A70] mb-7">{subtitle}</p>
            {children}
          </div>

          <div className="text-center mt-6 text-sm text-[#8C7A70]">{footer}</div>
        </div>
      </div>
    </div>
  );
};
