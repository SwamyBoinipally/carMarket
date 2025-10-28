import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Car } from '@/types/car';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { Search, LogIn, LogOut, LayoutDashboard, Phone, Menu } from 'lucide-react';

export default function Home() {
  const [cars, setCars] = useState<Car[]>([]);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceFilter, setPriceFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const { user, signInWithGoogle, logout } = useAuth();

  useEffect(() => {
    fetchCars();
  }, []);

  useEffect(() => {
    filterAndSortCars();
  }, [cars, searchTerm, priceFilter, yearFilter, sortBy]);

  // Close sheet when auth state changes
  useEffect(() => {
    setSheetOpen(false);
  }, [user]);

  const fetchCars = async () => {
    try {
      const carsQuery = query(collection(db, 'cars'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(carsQuery);
      const carsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Car[];
      setCars(carsData);
    } catch (error) {
      console.error('Error fetching cars:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortCars = () => {
    let filtered = [...cars];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(car =>
        car.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Price filter (in lakhs)
    if (priceFilter !== 'all') {
      const [min, max] = priceFilter.split('-').map(Number);
      filtered = filtered.filter(car => {
        if (max) {
          return car.price >= min && car.price <= max;
        }
        return car.price >= min;
      });
    }

    // Year filter
    if (yearFilter !== 'all') {
      const [minYear, maxYear] = yearFilter.split('-').map(Number);
      filtered = filtered.filter(car => {
        if (maxYear) {
          return car.year >= minYear && car.year <= maxYear;
        }
        return car.year >= minYear;
      });
    }

    // Sort
    if (sortBy === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'year-new') {
      filtered.sort((a, b) => b.year - a.year);
    } else if (sortBy === 'year-old') {
      filtered.sort((a, b) => a.year - b.year);
    } else if (sortBy === 'mileage-low') {
      filtered.sort((a, b) => a.mileage - b.mileage);
    }

    setFilteredCars(filtered);
  };

  const formatPrice = (price: number) => {
    if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} L`;
    }
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const handleWhatsAppClick = () => {
    window.open('https://wa.me/919949989823', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center gap-3">
              <img src="/logo.svg" alt="CarMarket Logo" className="w-10 h-10" />
              <span className="text-2xl font-bold text-blue-600">CarMarket</span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex gap-2">
              <Button onClick={handleWhatsAppClick} variant="outline" size="sm" className="!bg-transparent !hover:bg-transparent border-green-600 text-green-600 hover:bg-green-50">
                <Phone className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
              {user && (
                <Link to="/dashboard">
                  <Button variant="outline" size="sm">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
              )}
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
                  <Button onClick={() => { handleWhatsAppClick(); setSheetOpen(false); }} variant="outline" className="w-full justify-start">
                    <Phone className="w-4 h-4 mr-2" />
                    WhatsApp
                  </Button>
                  {user && (
                    <Link to="/dashboard" className="w-full" onClick={() => setSheetOpen(false)}>
                      <Button variant="outline" className="w-full justify-start">
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Dashboard
                      </Button>
                    </Link>
                  )}
                  {user ? (
                    <Button 
                      onClick={async () => {
                        setSheetOpen(false);
                        await logout();
                      }} 
                      variant="outline" 
                      className="w-full justify-start"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  ) : (
                    <Button 
                      onClick={async () => {
                        setSheetOpen(false);
                        await signInWithGoogle();
                      }} 
                      className="w-full justify-start"
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      Sign In
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Find Your Perfect Car</h1>
          <p className="text-lg opacity-90">Browse our collection of quality second-hand vehicles</p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={priceFilter} onValueChange={setPriceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="0-100000">Under ₹1 Lakh</SelectItem>
                <SelectItem value="100000-200000">₹1 Lakh - ₹2 Lakhs</SelectItem>
                <SelectItem value="200000-500000">₹2 Lakhs - ₹5 Lakhs</SelectItem>
                <SelectItem value="500000-1500000">₹5 Lakhs - ₹15 Lakhs</SelectItem>
                <SelectItem value="1500000-3000000">₹15 Lakhs - ₹30 Lakhs</SelectItem>
                <SelectItem value="3000000-99999999">₹30 Lakhs & Above</SelectItem>
              </SelectContent>
            </Select>
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                <SelectItem value="2020-2025">2020 - 2025</SelectItem>
                <SelectItem value="2015-2019">2015 - 2019</SelectItem>
                <SelectItem value="2010-2014">2010 - 2014</SelectItem>
                <SelectItem value="2000-2009">2000 - 2009</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="year-new">Year: Newest First</SelectItem>
                <SelectItem value="year-old">Year: Oldest First</SelectItem>
                <SelectItem value="mileage-low">Mileage: Low to High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Car Listings */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-500 mt-4">Loading cars...</p>
          </div>
        ) : filteredCars.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No cars found. Try adjusting your filters.</p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-gray-600">
              Showing {filteredCars.length} {filteredCars.length === 1 ? 'car' : 'cars'}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCars.map((car) => (
                <Link key={car.id} to={`/car/${car.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader className="p-0">
                      <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                        {car.imageUrls && car.imageUrls.length > 0 ? (
                          <img
                            src={car.imageUrls[0]}
                            alt={car.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No Image
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <CardTitle className="text-xl mb-2">{car.title}</CardTitle>
                      <p className="text-2xl font-bold text-blue-600 mb-2">
                        {formatPrice(car.price)}
                      </p>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>{car.year} • {car.mileage.toLocaleString()} km</p>
                        <p>{car.fuelType} • {car.transmission}</p>
                        <p className="text-gray-500">{car.location}</p>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <Button className="w-full" variant="outline">
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}