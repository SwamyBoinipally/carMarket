import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Car } from '@/types/car';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, MapPin, Calendar, Gauge, Fuel, Settings, Trash2, Phone, Share2, PencilIcon } from 'lucide-react';
import { getShareableUrl } from '../lib/utils';
import { toast } from 'sonner';
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

export default function CarDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (id) {
      fetchCar(id);
    }
  }, [id]);

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
      console.error('Error fetching car:', error);
      toast.error('Failed to load car details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!car || !id) return;

    setDeleting(true);
    try {
      // Delete images from storage
      if (car.imageUrls && car.imageUrls.length > 0) {
        for (const url of car.imageUrls) {
          try {
            const imageRef = ref(storage, url);
            await deleteObject(imageRef);
          } catch (error) {
            console.error('Error deleting image:', error);
          }
        }
      }

      // Delete car document
      await deleteDoc(doc(db, 'cars', id));
      toast.success('Car deleted successfully');
      navigate('/');
    } catch (error) {
      console.error('Error deleting car:', error);
      toast.error('Failed to delete car');
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
        console.error('Error sharing:', error);
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
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Listings
              </Button>
            </Link>
            <Button onClick={handleShare} variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Images Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-0">
                <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                  {car.imageUrls && car.imageUrls.length > 0 ? (
                    <img
                      src={car.imageUrls[selectedImage]}
                      alt={car.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image Available
                    </div>
                  )}
                </div>
                {car.imageUrls && car.imageUrls.length > 1 && (
                  <div className="grid grid-cols-4 gap-2 p-4">
                    {car.imageUrls.map((url, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`aspect-video rounded-lg overflow-hidden border-2 ${
                          selectedImage === index ? 'border-blue-600' : 'border-transparent'
                        }`}
                      >
                        <img
                          src={url}
                          alt={`${car.title} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
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
                      <span>Mileage</span>
                    </div>
                    <Badge variant="secondary">{car.mileage.toLocaleString()} km</Badge>
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
                    <Link to={`/dashboard/edit/${car?.id}`}>
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