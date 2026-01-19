import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { getRemainingContracts } from '@/lib/subscription';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogOut, LayoutDashboard, ShoppingCart, Menu, X } from 'lucide-react';
import { toast } from 'sonner';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const BETA_VERSION = true;

export default function Navbar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [remainingContracts, setRemainingContracts] = useState<number>(0);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (user && !BETA_VERSION) {
      loadRemainingContracts();
    }
  }, [user]);

  const loadRemainingContracts = async () => {
    if (!user) return;
    const remaining = await getRemainingContracts(user.id);
    setRemainingContracts(remaining);
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    console.log('=== Navbar: Logout clicked ===');
    setIsLoggingOut(true);
    
    try {
      console.log('Calling logout function...');
      const result = await logout();
      console.log('Logout result:', result);
      
      if (result.success) {
        toast.success(t('nav.logout'));
        console.log('Redirecting to login page...');
        setTimeout(() => {
          navigate('/login', { replace: true });
          window.location.reload();
        }, 500);
      } else {
        toast.error(result.message || t('common.error'));
        console.error('Logout failed:', result.message);
        setIsLoggingOut(false);
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error(t('common.error'));
      setIsLoggingOut(false);
    }
  };

  const navLinks = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.pricing'), path: '/pricing' },
    { name: t('nav.aiReview'), path: '/ai-review' },
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side: Language Switcher + Logo */}
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link to="/" className="flex items-center group">
              <img 
                src="/images/pba-logo.png" 
                alt="PBA Logo" 
                className="h-10 w-auto transition-transform duration-300 group-hover:scale-105" 
              />
            </Link>
          </div>

          {/* Desktop Navigation - Right side */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                {link.name}
              </Link>
            ))}

            {user ? (
              <div className="flex items-center gap-4">
                {!BETA_VERSION && remainingContracts > 0 && (
                  <Badge
                    variant="outline"
                    className="border-blue-500 text-blue-700 cursor-pointer hover:bg-blue-50"
                    onClick={() => navigate('/dashboard')}
                  >
                    {t('nav.remaining', { count: remainingContracts })}
                  </Badge>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      <span className="hidden lg:inline">{user.email}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      {t('nav.dashboard')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/orders')}>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      {t('nav.myOrders')}
                    </DropdownMenuItem>
                    {!BETA_VERSION && (
                      <DropdownMenuItem onClick={() => navigate('/booster-pack')}>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        {t('nav.buyBooster')}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleLogout} 
                      className="text-red-600"
                      disabled={isLoggingOut}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      {isLoggingOut ? t('nav.loggingOut') : t('nav.logout')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Button variant="ghost" onClick={() => navigate('/login')}>
                  {t('nav.login')}
                </Button>
                <Button
                  onClick={() => navigate('/register')}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {t('nav.register')}
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium px-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}

              {user ? (
                <>
                  {!BETA_VERSION && remainingContracts > 0 && (
                    <div className="px-2">
                      <Badge variant="outline" className="border-blue-500 text-blue-700">
                        {t('nav.remaining', { count: remainingContracts })}
                      </Badge>
                    </div>
                  )}
                  <Link
                    to="/dashboard"
                    className="text-gray-700 hover:text-blue-600 transition-colors font-medium px-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('nav.dashboard')}
                  </Link>
                  <Link
                    to="/orders"
                    className="text-gray-700 hover:text-blue-600 transition-colors font-medium px-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('nav.myOrders')}
                  </Link>
                  {!BETA_VERSION && (
                    <Link
                      to="/booster-pack"
                      className="text-gray-700 hover:text-blue-600 transition-colors font-medium px-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t('nav.buyBooster')}
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    disabled={isLoggingOut}
                    className="text-red-600 hover:text-red-700 transition-colors font-medium px-2 text-left disabled:opacity-50"
                  >
                    {isLoggingOut ? t('nav.loggingOut') : t('nav.logout')}
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 px-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      navigate('/login');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full justify-start"
                  >
                    {t('nav.login')}
                  </Button>
                  <Button
                    onClick={() => {
                      navigate('/register');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
                  >
                    {t('nav.register')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}