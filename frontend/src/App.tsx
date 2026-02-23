import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { 
  Home, 
  PlusSquare, 
  User, 
  Moon, 
  Sun, 
  LogOut,
  Users,
} from 'lucide-react';
import { authService } from './services/authService';
import { UserProfile } from './types';
import Feed from './pages/Feed';
import PostOpening from './pages/PostOpening';
import OpeningDetail from './pages/OpeningDetail';
import Profile from './pages/Profile';
import MyTeams from './pages/MyTeams';
import TeamChat from './pages/TeamChat';
import DirectChat from './pages/DirectChat';
import { Login, SignUp } from './pages/Auth';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = authService.getCurrentUser();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setUser(authService.getCurrentUser());
    document.documentElement.classList.add('dark');
  }, [location.pathname]);

  const navItems = [
    { path: '/', icon: Home, label: 'Feed' },
    { path: '/post', icon: PlusSquare, label: 'Post' },
    { path: '/teams', icon: Users, label: 'My Teams' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  if (isAuthPage) {
    return <div className="min-h-screen bg-black text-[#e0e0e0]">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-black text-[#e0e0e0] transition-colors duration-200">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-12 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform font-black italic tracking-tighter">
                INAT
              </div>
              <span className="font-bold text-2xl tracking-tight hidden sm:block text-white">
                I Need A Team
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-4 py-2 rounded-lg flex items-center space-x-2 text-sm font-medium transition-all ${
                      isActive 
                        ? 'bg-indigo-600/10 text-indigo-400' 
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center space-x-3">
              {user ? (
                <>
                  <div className="h-8 w-[1px] bg-white/10 hidden sm:block"></div>
                  <div className="flex items-center space-x-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                    <div className="w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {(user.displayName || user.email).charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium hidden lg:block text-slate-200">{user.displayName || user.email.split('@')[0]}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-lg text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                    title="Logout"
                  >
                    <LogOut size={20} />
                  </button>
                </>
              ) : (
                <Link to="/login">
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20">
                    Log In
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        {children}
      </main>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-lg border-t border-white/10 px-6 py-3 z-50">
        <div className="flex justify-between items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center space-y-1 transition-colors ${
                  isActive ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Icon size={22} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        
        <Route path="/" element={<Feed />} />
        <Route path="/opening/:id" element={<OpeningDetail />} />
        <Route path="/profile/:id" element={<Profile />} />
        
        <Route path="/post" element={<PrivateRoute><PostOpening /></PrivateRoute>} />
        <Route path="/edit/:id" element={<PrivateRoute><PostOpening /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/teams" element={<PrivateRoute><MyTeams /></PrivateRoute>} />
        <Route path="/chat/:teamId" element={<PrivateRoute><TeamChat /></PrivateRoute>} />
        <Route path="/chat/direct/:userId" element={<PrivateRoute><DirectChat /></PrivateRoute>} />
      </Routes>
    </Layout>
  );
};

export default App;