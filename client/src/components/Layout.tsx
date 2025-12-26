import { useState, useEffect } from 'react';
import { Link } from 'wouter';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        setIsLoggedIn(true);
        setUserName(parsed.name || parsed.emailOrPhone || 'User');
      }
    } catch (err) {
      console.error('Failed to read user from localStorage', err);
    }
  }, []);


  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserName('');
    localStorage.removeItem('user');
    localStorage.removeItem('isAdmin');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header/Navbar */}
      <header className="bg-white border-b border-border shadow-sm">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo and Site Name */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <i className="fas fa-bus text-white text-lg"></i>
            </div>
            <span className="text-xl font-bold text-primary hidden sm:inline">BusGo</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/search-results" className="text-foreground hover:text-primary transition-colors">
              Routes
            </Link>
            <Link href="/my-bookings" className="text-foreground hover:text-primary transition-colors">
              My Bookings
            </Link>
            {isLoggedIn && (
              <Link href="/admin" className="text-foreground hover:text-primary transition-colors">
                Admin
              </Link>
            )}
            <a href="#contact" className="text-foreground hover:text-primary transition-colors">
              Contact
            </a>
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center gap-4">
            {isLoggedIn ? (
              <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-muted transition-colors">
                  <i className="fas fa-user"></i>
                  <span className="text-sm font-medium">{userName}</span>
                  <i className="fas fa-chevron-down text-xs"></i>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <Link href="/profile" className="block px-4 py-2 text-sm text-foreground hover:bg-secondary">
                    <i className="fas fa-user-circle mr-2"></i>Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-secondary border-t border-border"
                  >
                    <i className="fas fa-sign-out-alt mr-2"></i>Logout
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Link href="/login" className="text-primary font-semibold hover:underline">
                  Login
                </Link>
                <Link href="/register" className="btn-accent">
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
          </button>
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border bg-card">
            <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
              <Link href="/" className="text-foreground hover:text-primary transition-colors py-2">
                Home
              </Link>
              <Link href="/search-results" className="text-foreground hover:text-primary transition-colors py-2">
                Routes
              </Link>
              <Link href="/my-bookings" className="text-foreground hover:text-primary transition-colors py-2">
                My Bookings
              </Link>
              {isLoggedIn && (
                <Link href="/admin" className="text-foreground hover:text-primary transition-colors py-2">
                  Admin
                </Link>
              )}
              <a href="#contact" className="text-foreground hover:text-primary transition-colors py-2">
                Contact
              </a>
              <div className="border-t border-border pt-4">
                {isLoggedIn ? (
                  <>
                    <Link href="/profile" className="block text-foreground hover:text-primary py-2">
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left text-foreground hover:text-primary py-2"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="block text-primary font-semibold py-2">
                      Login
                    </Link>
                    <Link href="/register" className="block btn-accent mt-2">
                      Register
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground border-t border-border mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* About Section */}
            <div>
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <i className="fas fa-bus"></i>
                BusGo
              </h3>
              <p className="text-sm opacity-90">
                Your trusted online platform for booking bus tickets across Pakistan and India.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#about" className="hover:underline opacity-90">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#terms" className="hover:underline opacity-90">
                    Terms & Conditions
                  </a>
                </li>
                <li>
                  <a href="#privacy" className="hover:underline opacity-90">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <i className="fas fa-envelope"></i>
                  <a href="mailto:support@busgo.pk" className="hover:underline opacity-90">
                    support@busgo.pk
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <i className="fas fa-phone"></i>
                  <a href="tel:+923001234567" className="hover:underline opacity-90">
                    +92 300 123 4567
                  </a>
                </li>
              </ul>
            </div>

            {/* Social Links */}
            <div>
              <h4 className="font-semibold mb-4">Follow Us</h4>
              <div className="flex gap-4">
                <a href="#facebook" className="hover:opacity-75 transition-opacity">
                  <i className="fab fa-facebook text-xl"></i>
                </a>
                <a href="#twitter" className="hover:opacity-75 transition-opacity">
                  <i className="fab fa-twitter text-xl"></i>
                </a>
                <a href="#instagram" className="hover:opacity-75 transition-opacity">
                  <i className="fab fa-instagram text-xl"></i>
                </a>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-primary-foreground border-opacity-20 pt-8 text-center text-sm opacity-90">
            <p>&copy; 2025 Online Bus Reservation. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
