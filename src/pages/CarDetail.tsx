import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { deleteImagesByUrls } from '@/lib/imageUpload';
import { Car } from '@/types/car';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { MapPin, Calendar, Gauge, Fuel, Settings, Trash2, Phone, Share2, PencilIcon, ChevronLeft, ChevronRight, ArrowLeft, Zap, Users, FileText, Palette } from 'lucide-react';
import { getShareableUrl } from '../lib/utils';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';
import type { CarouselApi } from '@/components/ui/carousel';

export default function CarDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (id) {
      fetchCar(id);
    }
  }, [id]);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const fetchCar = async (carId: string) => {
    try {
      const carDoc = await getDoc(doc(db, 'cars', carId));
      if (carDoc.exists()) {
        setCar({
          id: carDoc.id,
          ...carDoc.data(),
          createdAt: carDoc.data().createdAt?.toDate() || new Date(),
        } as Car);
      }
    } catch (error) {
      toast.error('Failed to load car details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!car || !id) return;

    setDeleting(true);
    try {
      // Delete all associated images from storage
      if (car.imageUrls && car.imageUrls.length > 0) {
        await deleteImagesByUrls(car.imageUrls);
      }

      // Delete car document from Firestore
      await deleteDoc(doc(db, 'cars', id));

      toast.success('Car listing deleted successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to delete car listing');
    } finally {
      setDeleting(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} Lakhs`;
    }
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const handleWhatsAppClick = () => {
    const message = `Hi, I'm interested in ${car?.title} - ${formatPrice(car?.price || 0)}`;
    window.open(`https://wa.me/919949989823?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: car?.title,
          text: `Check out this car: ${car?.title}`,
          url: getShareableUrl(window.location.pathname),
        });
      } catch (error) {
        // Handle share cancellation silently
      }
    } else {
      navigator.clipboard.writeText(getShareableUrl(window.location.pathname));
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Car not found</p>
          <Link to="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between py-3">
        <Link to="/">
          <Button variant="ghost" size="sm" className="h-9 px-3">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Listing
          </Button>
        </Link>
        <Button onClick={handleShare} variant="outline" size="sm" className="h-9 px-3">
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Images Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-0">
                {car.imageUrls && car.imageUrls.length > 0 ? (
                  <div className="space-y-4">
                    <Carousel setApi={setApi} className="w-full">
                      <CarouselContent>
                        {car.imageUrls.map((url, index) => (
                          <CarouselItem key={index}>
                            <div className="aspect-[4/3] bg-gray-200 rounded-lg overflow-hidden">
                              <img src={url} alt={`${car.title} ${index + 1}`} className="w-full h-full object-cover" />
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      {car.imageUrls.length > 1 && (
                        <>
                          <CarouselPrevious className="left-2 right-auto" />
                          <CarouselNext className="right-2 left-auto" />
                        </>
                      )}
                    </Carousel>

                    {/* Thumbnail Navigation */}
                    {car.imageUrls.length > 1 && (
                      <div className="px-4 pb-4">
                        <div className="flex gap-2 overflow-x-auto">
                          {car.imageUrls.map((url, index) => (
                            <button
                              key={index}
                              onClick={() => api?.scrollTo(index)}
                              className={`flex-shrink-0 aspect-[4/3] w-16 rounded-md overflow-hidden border-2 transition-all ${
                                current === index ? 'border-blue-600 ring-2 ring-blue-400' : 'border-gray-300 hover:border-gray-400'
                              }`}
                            >
                              <img src={url} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                        <div className="mt-2 text-center text-sm text-gray-600">
                          {current + 1} / {count}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-[4/3] bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
                    <div className="text-gray-400">No Image Available</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Description */}
            <Card className="mt-6">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Description</h2>
                <p className="text-gray-700 whitespace-pre-line">{car.description}</p>
              </CardContent>
            </Card>

            {/* Vehicle Specifications */}
            <Card className="mt-6">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Vehicle Specifications</h2>
                <div className="space-y-4">
                  {car.bodyType && (
                    <div className="flex items-center justify-between py-3 border-b">
                      <span className="text-gray-600">Body Type</span>
                      <Badge variant="secondary">{car.bodyType}</Badge>
                    </div>
                  )}
                  {car.color && (
                    <div className="flex items-center justify-between py-3 border-b">
                      <div className="flex items-center text-gray-600 gap-2">
                        <Palette className="w-4 h-4" />
                        <span>Color</span>
                      </div>
                      <Badge variant="secondary">{car.color}</Badge>
                    </div>
                  )}
                  {car.engineCapacity && (
                    <div className="flex items-center justify-between py-3 border-b">
                      <span className="text-gray-600">Engine Capacity</span>
                      <Badge variant="secondary">{car.engineCapacity} cc</Badge>
                    </div>
                  )}
                  {car.powerOutput && (
                    <div className="flex items-center justify-between py-3 border-b">
                      <div className="flex items-center text-gray-600 gap-2">
                        <Zap className="w-4 h-4" />
                        <span>Power Output</span>
                      </div>
                      <Badge variant="secondary">{car.powerOutput} bhp</Badge>
                    </div>
                  )}
                  {car.torque && (
                    <div className="flex items-center justify-between py-3 border-b">
                      <span className="text-gray-600">Torque</span>
                      <Badge variant="secondary">{car.torque} Nm</Badge>
                    </div>
                  )}
                  {car.seatingCapacity && (
                    <div className="flex items-center justify-between py-3 border-b">
                      <div className="flex items-center text-gray-600 gap-2">
                        <Users className="w-4 h-4" />
                        <span>Seating Capacity</span>
                      </div>
                      <Badge variant="secondary">{car.seatingCapacity} Seats</Badge>
                    </div>
                  )}
                  {car.fuelConsumption && (
                    <div className="flex items-center justify-between py-3 border-b">
                      <span className="text-gray-600">Fuel Consumption</span>
                      <Badge variant="secondary">{car.fuelConsumption} km/l</Badge>
                    </div>
                  )}
                  {car.ownerCount && (
                    <div className="flex items-center justify-between py-3 border-b">
                      <span className="text-gray-600">Owner</span>
                      <Badge variant="secondary">{car.ownerCount === 1 ? '1st Owner' : car.ownerCount === 2 ? '2nd Owner' : car.ownerCount === 3 ? '3rd Owner' : '4+ Owners'}</Badge>
                    </div>
                  )}
                  {car.registrationState && (
                    <div className="flex items-center justify-between py-3 border-b">
                      <div className="flex items-center text-gray-600 gap-2">
                        <FileText className="w-4 h-4" />
                        <span>Registration State</span>
                      </div>
                      <Badge variant="secondary">{car.registrationState}</Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Features & Amenities */}
            {car.features && car.features.length > 0 && (
              <Card className="mt-6">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Features & Amenities</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {car.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2 p-2 bg-blue-50 rounded-md">
                        <span className="text-blue-600">✓</span>
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h1 className="text-3xl font-bold mb-2">{car.title}</h1>
                <div className="flex items-center text-gray-600 mb-4">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{car.location}</span>
                </div>
                <p className="text-4xl font-bold text-blue-600 mb-6">
                  {formatPrice(car.price)}
                </p>

                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-5 h-5 mr-2" />
                      <span>Year</span>
                    </div>
                    <Badge variant="secondary">{car.year}</Badge>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b">
                    <div className="flex items-center text-gray-600">
                      <Gauge className="w-5 h-5 mr-2" />
                      <span>KM Driven</span>
                    </div>
                    <Badge variant="secondary">{(car.kmDriven ?? 0).toLocaleString()} km</Badge>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b">
                    <div className="flex items-center text-gray-600">
                      <Fuel className="w-5 h-5 mr-2" />
                      <span>Fuel Type</span>
                    </div>
                    <Badge variant="secondary">{car.fuelType}</Badge>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b">
                    <div className="flex items-center text-gray-600">
                      <Settings className="w-5 h-5 mr-2" />
                      <span>Transmission</span>
                    </div>
                    <Badge variant="secondary">{car.transmission}</Badge>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t space-y-2">
                  <Button onClick={handleWhatsAppClick} className="w-full bg-green-600 hover:bg-green-700">
                    <Phone className="w-4 h-4 mr-2" />
                    Contact via WhatsApp
                  </Button>
                </div>

                {isAdmin && (
                  <div className="mt-4 space-y-2">
                    <Link to={`/add-vehicle/edit/${car?.id}`}>
                      <Button className="w-full" variant="outline">
                        <PencilIcon className="w-4 h-4 mr-2" />
                        Edit Listing
                      </Button>
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full" disabled={deleting}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          {deleting ? 'Deleting...' : 'Delete Listing'}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the car listing
                            and all associated images.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}