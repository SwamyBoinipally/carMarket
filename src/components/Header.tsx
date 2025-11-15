import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LogIn, LogOut, LayoutDashboard, Phone, Menu, Building2, Home as HomeIcon 
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface HeaderProps {
  hideNav?: boolean; // Option to hide navigation on certain pages if needed
}

export default function Header({ hideNav = false }: HeaderProps) {
  const { user, signInWithGoogle, logout } = useAuth();
  const [sheetOpen, setSheetOpen] = useState(false);

  // Close sheet when auth state changes
  useEffect(() => {
    setSheetOpen(false);
  }, [user]);

  const handleWhatsAppClick = () => {
    window.open('https://wa.me/919949989823', '_blank', 'noopener,noreferrer');
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.svg" alt="CarMarket Logo" className="w-10 h-10" />
            <span className="text-2xl font-bold text-blue-600">CarMarket</span>
          </Link>
          
          {!hideNav && (
            <>
              {/* Desktop Navigation */}
              <div className="hidden md:flex gap-2">
                <Link to="/">
                  <Button variant="outline" size="sm">
                    <HomeIcon className="w-4 h-4 mr-2" />
                    Home
                  </Button>
                </Link>
                <Link to="/about">
                  <Button variant="outline" size="sm">
                    <Building2 className="w-4 h-4 mr-2" />
                    About
                  </Button>
                </Link>
                {user && (
                  <Link to="/add-vehicle">
                    <Button variant="outline" size="sm">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Add Vehicle
                    </Button>
                  </Link>
                )}
                <Button 
                  onClick={handleWhatsAppClick} 
                  variant="outline" 
                  size="sm" 
                  className="!bg-transparent !hover:bg-transparent border-green-600 text-green-600 hover:bg-green-50"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
                {user ? (
                  <Button onClick={logout} variant="outline" size="sm">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                ) : (
                  <Button onClick={signInWithGoogle} size="sm">
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                )}
              </div>

              {/* Mobile Navigation */}
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px]" onCloseAutoFocus={(e) => e.preventDefault()}>
                  <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col gap-4 mt-6">
                    <Link to="/" className="w-full" onClick={() => setSheetOpen(false)}>
                      <Button variant="outline" className="w-full justify-start">
                        <HomeIcon className="w-4 h-4 mr-2" />
                        Home
                      </Button>
                    </Link>
                    <Link to="/about" className="w-full" onClick={() => setSheetOpen(false)}>
                      <Button variant="outline" className="w-full justify-start">
                        <Building2 className="w-4 h-4 mr-2" />
                        About
                      </Button>
                    </Link>
                    {user && (
                      <Link to="/add-vehicle" className="w-full" onClick={() => setSheetOpen(false)}>
                        <Button variant="outline" className="w-full justify-start">
                          <LayoutDashboard className="w-4 h-4 mr-2" />
                          Add Vehicle
                        </Button>
                      </Link>
                    )}
                    <Button 
                      onClick={() => { handleWhatsAppClick(); setSheetOpen(false); }} 
                      variant="outline" 
                      className="w-full justify-start"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      WhatsApp
                    </Button>
                    {user ? (
                      <Button 
                        onClick={() => { logout(); setSheetOpen(false); }} 
                        variant="outline" 
                        className="w-full justify-start"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => { signInWithGoogle(); setSheetOpen(false); }} 
                        className="w-full justify-start"
                      >
                        <LogIn className="w-4 h-4 mr-2" />
                        Sign In
                      </Button>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
