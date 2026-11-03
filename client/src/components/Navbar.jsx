import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Search,
  UploadCloud,
  History,
  BarChart3,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Badge, Button } from './ui';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    setMobileOpen(false);
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinkClass = ({ isActive }) =>
    `inline-flex items-center gap-1.5 px-3 py-1.8 rounded-xl text-xs font-semibold transition-all duration-150 ${
      isActive
        ? 'text-indigo-600 bg-indigo-50/90 shadow-2xs'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
    }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
      isActive
        ? 'text-indigo-600 bg-indigo-50'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group cursor-pointer focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm group-hover:shadow-soft transition-all duration-200">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-extrabold text-base tracking-tight text-slate-900 leading-tight">
                Fraud<span className="text-indigo-600">Shield</span>
              </span>
              <span className="text-[10px] text-slate-600 font-medium tracking-wider uppercase">
                Detector
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          {isAuthenticated ? (
            <nav className="hidden md:flex items-center space-x-1.5">
              <NavLink to="/analyze" className={navLinkClass}>
                <Search className="w-3.5 h-3.5" />
                <span>Analyze Job</span>
              </NavLink>
              <NavLink to="/bulk" className={navLinkClass}>
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Bulk Upload</span>
              </NavLink>
              <NavLink to="/history" className={navLinkClass}>
                <History className="w-3.5 h-3.5" />
                <span>History</span>
              </NavLink>
              <NavLink to="/analytics" className={navLinkClass}>
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Analytics</span>
              </NavLink>

              {isAdmin && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `inline-flex items-center gap-1.5 px-3 py-1.8 rounded-xl text-xs font-semibold transition-all duration-150 ${
                      isActive
                        ? 'text-amber-800 bg-amber-100/90 shadow-2xs'
                        : 'text-amber-700 bg-amber-50 hover:bg-amber-100/70 border border-amber-200/60'
                    }`
                  }
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>Admin Panel</span>
                </NavLink>
              )}
            </nav>
          ) : null}

          {/* Right Side: Auth / User Profile */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2.5 p-1 pl-2.5 rounded-full border border-slate-200/80 hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  aria-expanded={profileOpen}
                  aria-label="User menu"
                >
                  <div className="flex flex-col text-right">
                    <span className="text-xs font-semibold text-slate-800 max-w-[120px] truncate leading-tight">
                      {user?.name}
                    </span>
                    <span className="text-[10px] text-slate-600 uppercase font-medium">
                      {user?.role}
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-bold text-xs uppercase shadow-2xs">
                    {user?.name ? user.name[0] : 'U'}
                  </div>
                </button>

                {/* Profile Dropdown */}
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-soft-lg py-2 z-50 animate-fade-in">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {user?.name}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {user?.email}
                      </p>
                      <div className="mt-1.5">
                        <Badge
                          variant={isAdmin ? 'warning' : 'brand'}
                          size="sm"
                          dot
                        >
                          {user?.role}
                        </Badge>
                      </div>
                    </div>

                    <div className="p-1.5">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none"
              aria-label="Toggle mobile menu"
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-md px-4 pt-3 pb-5 space-y-2 animate-fade-in">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 mb-2">
                <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm uppercase">
                  {user?.name ? user.name[0] : 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {user?.email}
                  </p>
                </div>
                <Badge variant={isAdmin ? 'warning' : 'brand'} size="sm">
                  {user?.role}
                </Badge>
              </div>

              <NavLink
                to="/analyze"
                onClick={() => setMobileOpen(false)}
                className={mobileNavLinkClass}
              >
                <Search className="w-4 h-4 text-slate-500" />
                <span>Analyze Job</span>
              </NavLink>
              <NavLink
                to="/bulk"
                onClick={() => setMobileOpen(false)}
                className={mobileNavLinkClass}
              >
                <UploadCloud className="w-4 h-4 text-slate-500" />
                <span>Bulk CSV Upload</span>
              </NavLink>
              <NavLink
                to="/history"
                onClick={() => setMobileOpen(false)}
                className={mobileNavLinkClass}
              >
                <History className="w-4 h-4 text-slate-500" />
                <span>Analysis History</span>
              </NavLink>
              <NavLink
                to="/analytics"
                onClick={() => setMobileOpen(false)}
                className={mobileNavLinkClass}
              >
                <BarChart3 className="w-4 h-4 text-slate-500" />
                <span>My Analytics</span>
              </NavLink>

              {isAdmin && (
                <NavLink
                  to="/admin"
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      isActive
                        ? 'text-amber-800 bg-amber-100'
                        : 'text-amber-700 bg-amber-50 hover:bg-amber-100/80'
                    }`
                  }
                >
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>Admin Management Console</span>
                </NavLink>
              )}

              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          ) : (
            <div className="pt-2 space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="block"
              >
                <Button variant="secondary" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileOpen(false)}
                className="block"
              >
                <Button variant="primary" className="w-full">
                  Create Account
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
