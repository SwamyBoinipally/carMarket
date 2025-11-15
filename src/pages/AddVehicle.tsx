import { useState, useEffect } from 'react';
import { Navigate, useParams, useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, ADMIN_ONLY_UPLOADS } from '@/lib/firebase';
import { uploadImagesWithFallback, handleImageUpdate } from '@/lib/imageUpload';
import { compressImages, formatFileSize, getCompressionRatio } from '@/lib/imageCompress';
import { CarFormData } from '@/types/car';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, X, AlertCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import Footer from '@/components/Footer';
import Header from '@/components/Header';

export default function AddVehicle() {
  const { user, isAdmin, loading } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isEditing] = useState(!!id);
  const [formData, setFormData] = useState<CarFormData>({
    title: '',
    description: '',
    price: 0,
    location: '',
    year: new Date().getFullYear(),
    kmDriven: 0,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    bodyType: 'Sedan',
    color: '',
    engineCapacity: '',
    powerOutput: '',
    torque: '',
    seatingCapacity: 5,
    fuelConsumption: '',
    ownerCount: 1,
    registrationState: '',
    features: [],
  });
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [originalImageUrls, setOriginalImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [imageSizeInfo, setImageSizeInfo] = useState<Array<{ original: number; compressed: number }>>([]);

  useEffect(() => {
    return () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  useEffect(() => {
    if (isEditing && id) {
      const fetchCar = async () => {
        try {
          const carDoc = await getDoc(doc(db, 'cars', id));
          if (carDoc.exists()) {
            const carData = carDoc.data();
            setFormData({
              title: carData.title,
              description: carData.description,
              price: carData.price,
              location: carData.location,
              year: carData.year,
              kmDriven: carData.kmDriven || 0,
              fuelType: carData.fuelType,
              transmission: carData.transmission,
              bodyType: carData.bodyType || 'Sedan',
              color: carData.color || '',
              engineCapacity: carData.engineCapacity || '',
              powerOutput: carData.powerOutput || '',
              torque: carData.torque || '',
              seatingCapacity: carData.seatingCapacity || 5,
              fuelConsumption: carData.fuelConsumption || '',
              ownerCount: carData.ownerCount || 1,
              registrationState: carData.registrationState || '',
              features: carData.features || [],
            });
            if (carData.imageUrls) {
              setImagePreviews(carData.imageUrls);
              setOriginalImageUrls(carData.imageUrls);
            }
          } else {
            toast.error('Car not found');
            navigate('/add-vehicle');
          }
        } catch (error) {
          toast.error('Failed to load vehicle details');
          navigate('/add-vehicle');
        }
      };
      fetchCar();
    }
  }, [id, isEditing, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Determine whether the current user is allowed to upload.
  // If ADMIN_ONLY_UPLOADS is true, only admins can upload. Otherwise any logged-in user can upload.
  const allowUpload = ADMIN_ONLY_UPLOADS ? isAdmin : !!user;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 12) {
      toast.error('Maximum 12 images allowed');
      return;
    }

    // Start compression process
    setCompressing(true);
    setCompressionProgress(0);

    compressImages(files, undefined, (current, total) => {
      setCompressionProgress(Math.round((current / total) * 100));
    })
      .then((compressedFiles) => {
        // Store compressed files
        setImages((prev) => [...prev, ...compressedFiles]);

        // Create object URLs for previews
        const newPreviews = compressedFiles.map((file) => URL.createObjectURL(file));
        setImagePreviews((prev) => [...prev, ...newPreviews]);

        // Track size info
        const newSizeInfo = files.map((original, idx) => ({
          original: original.size,
          compressed: compressedFiles[idx]?.size || original.size,
        }));

        setImageSizeInfo((prev) => [...prev, ...newSizeInfo]);

        // Show success toast with compression info
        const totalOriginal = newSizeInfo.reduce((sum, info) => sum + info.original, 0);
        const totalCompressed = newSizeInfo.reduce((sum, info) => sum + info.compressed, 0);
        const ratio = getCompressionRatio(totalOriginal, totalCompressed);

        toast.success(
          `${files.length} image(s) compressed! Reduced by ${ratio}%\nOriginal: ${formatFileSize(totalOriginal)} → ${formatFileSize(totalCompressed)}`
        );

        setCompressing(false);
        setCompressionProgress(0);
      })
      .catch((error) => {
        toast.error(`Failed to compress images: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setCompressing(false);
        setCompressionProgress(0);
      });
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setImageSizeInfo(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!allowUpload) {
      toast.error('Only admins can upload vehicles');
      return;
    }

    // Check if there are either new images or existing images (when editing)
    const hasImages = images.length > 0 || imagePreviews.length > 0;
    if (!hasImages) {
      toast.error('Please upload at least one image');
      return;
    }

    setUploading(true);

    try {
      // Upload new images with Firebase → Cloudinary fallback
      const newImageUrls = await uploadImagesWithFallback(images);

      toast.dismiss();

      if (isEditing && id) {
        // Handle image updates: delete removed images and keep existing ones
        const finalImageUrls = await handleImageUpdate(
          originalImageUrls,
          imagePreviews,
          newImageUrls
        );

        // Update car document
        await updateDoc(doc(db, 'cars', id), {
          ...formData,
          imageUrls: finalImageUrls,
          updatedAt: serverTimestamp(),
        });
        toast.success('Vehicle listing updated successfully!');
        navigate(`/car/${id}`);
      } else {
        // Create car document
        const docRef = await addDoc(collection(db, 'cars'), {
          ...formData,
          imageUrls: newImageUrls,
          createdAt: serverTimestamp(),
        });
        toast.success('Vehicle listing created successfully!');
        navigate(`/car/${docRef.id}`);
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        price: 0,
        location: '',
        year: new Date().getFullYear(),
        kmDriven: 0,
        fuelType: 'Petrol',
        transmission: 'Automatic',
        bodyType: 'Sedan',
        color: '',
        engineCapacity: '',
        powerOutput: '',
        torque: '',
        seatingCapacity: 5,
        fuelConsumption: '',
        ownerCount: 1,
        registrationState: '',
        features: [],
      });
      setImages([]);
      setImagePreviews([]);
    } catch (error) {
      toast.dismiss();
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to create vehicle listing'
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
        {/* Back Button */}
        {isEditing && id && (
          <div className="mb-6">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/car/${id}`)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Vehicle Details
            </Button>
          </div>
        )}

        {/* User Info */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-12 w-12 border-2 border-gray-200">
                {user.photoURL ? (
                  <AvatarImage 
                    src={user.photoURL} 
                    alt={user.displayName || 'User'} 
                    className="object-cover"
                    referrerPolicy="no-referrer"  // Add this to fix Google Photos cross-origin issues
                  />
                ) : null}
                <AvatarFallback className="bg-blue-600 text-white text-lg">
                  {(user.displayName || 'User').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              </div>
              <div>
                <p className="font-semibold">{user.displayName}</p>
                <p className="text-sm text-gray-600">{user.email}</p>
                <span className={`inline-block mt-1 px-2 py-1 text-xs font-semibold rounded ${
                  isAdmin 
                    ? "text-white bg-blue-600" 
                    : "text-gray-700 bg-gray-200"
                }`}>
                  {isAdmin ? "Admin" : "Non-admin"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Form or View Only Message */}
        {allowUpload ? (
          <Card>
            <CardHeader>
              <CardTitle>{isEditing ? 'Edit Vehicle Listing' : 'Add New Vehicle Listing'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Image Upload */}
                <div>
                  <Label htmlFor="images">Images (Max 12)</Label>
                  <div className="mt-2">
                    <label
                      htmlFor="images"
                      className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ pointerEvents: compressing ? 'none' : 'auto', opacity: compressing ? 0.6 : 1 }}
                    >
                      <div className="text-center">
                        <Upload className="mx-auto h-8 w-8 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">
                          {compressing ? `Compressing... ${compressionProgress}%` : 'Click to upload images'}
                        </p>
                      </div>
                      <input
                        id="images"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        disabled={compressing}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                          <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                          {imageSizeInfo[index] && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-1">
                              <div className="text-center">
                                <div>
                                  {formatFileSize(imageSizeInfo[index].compressed)} 
                                  <span className="text-green-400 ml-1">
                                    (-{getCompressionRatio(imageSizeInfo[index].original, imageSizeInfo[index].compressed)}%)
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Title */}
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., 2020 Honda Civic LX"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the vehicle's condition, features, etc."
                    rows={4}
                    required
                  />
                </div>

                {/* Price and Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price (₹)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      placeholder="500000"
                      required
                      min="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">Enter price in Rupees</p>
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="City, State"
                      required
                    />
                  </div>
                </div>

                {/* Year and KM Driven */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                      placeholder="2020"
                      required
                      min="1900"
                      max={new Date().getFullYear() + 1}
                    />
                  </div>
                  <div>
                    <Label htmlFor="kmDriven">KM Driven</Label>
                    <Input
                      id="kmDriven"
                      type="number"
                      value={formData.kmDriven}
                      onChange={(e) => setFormData({ ...formData, kmDriven: Number(e.target.value) })}
                      placeholder="50000"
                      required
                      min="0"
                    />
                  </div>
                </div>

                {/* Fuel Type and Transmission */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fuelType">Fuel Type</Label>
                    <Select
                      value={formData.fuelType}
                      onValueChange={(value) => setFormData({ ...formData, fuelType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Petrol">Petrol</SelectItem>
                        <SelectItem value="Diesel">Diesel</SelectItem>
                        <SelectItem value="Electric">Electric</SelectItem>
                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                        <SelectItem value="CNG">CNG</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="transmission">Transmission</Label>
                    <Select
                      value={formData.transmission}
                      onValueChange={(value) => setFormData({ ...formData, transmission: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Automatic">Automatic</SelectItem>
                        <SelectItem value="Manual">Manual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Vehicle Specifications */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-semibold text-lg">Vehicle Specifications</h3>
                  
                  {/* Body Type and Color */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bodyType">Body Type</Label>
                      <Select
                        value={formData.bodyType}
                        onValueChange={(value) => setFormData({ ...formData, bodyType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Sedan">Sedan</SelectItem>
                          <SelectItem value="SUV">SUV</SelectItem>
                          <SelectItem value="Hatchback">Hatchback</SelectItem>
                          <SelectItem value="Coupe">Coupe</SelectItem>
                          <SelectItem value="Convertible">Convertible</SelectItem>
                          <SelectItem value="Wagon">Wagon</SelectItem>
                          <SelectItem value="Pickup Truck">Pickup Truck</SelectItem>
                          <SelectItem value="Minivan">Minivan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="color">Color</Label>
                      <Input
                        id="color"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        placeholder="e.g., Black, White, Silver"
                        required
                      />
                    </div>
                  </div>

                  {/* Engine Capacity and Power Output */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="engineCapacity">Engine Capacity (cc)</Label>
                      <Input
                        id="engineCapacity"
                        value={formData.engineCapacity}
                        onChange={(e) => setFormData({ ...formData, engineCapacity: e.target.value })}
                        placeholder="e.g., 1400"
                      />
                    </div>
                    <div>
                      <Label htmlFor="powerOutput">Power Output (bhp)</Label>
                      <Input
                        id="powerOutput"
                        value={formData.powerOutput}
                        onChange={(e) => setFormData({ ...formData, powerOutput: e.target.value })}
                        placeholder="e.g., 120"
                      />
                    </div>
                  </div>

                  {/* Torque and Seating Capacity */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="torque">Torque (Nm)</Label>
                      <Input
                        id="torque"
                        value={formData.torque}
                        onChange={(e) => setFormData({ ...formData, torque: e.target.value })}
                        placeholder="e.g., 200"
                      />
                    </div>
                    <div>
                      <Label htmlFor="seatingCapacity">Seating Capacity</Label>
                      <Select
                        value={formData.seatingCapacity.toString()}
                        onValueChange={(value) => setFormData({ ...formData, seatingCapacity: Number(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">2 Seats</SelectItem>
                          <SelectItem value="4">4 Seats</SelectItem>
                          <SelectItem value="5">5 Seats</SelectItem>
                          <SelectItem value="6">6 Seats</SelectItem>
                          <SelectItem value="7">7 Seats</SelectItem>
                          <SelectItem value="8">8 Seats</SelectItem>
                          <SelectItem value="9">9 Seats</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Fuel Consumption and Owner Count */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fuelConsumption">Fuel Consumption (km/l)</Label>
                      <Input
                        id="fuelConsumption"
                        value={formData.fuelConsumption}
                        onChange={(e) => setFormData({ ...formData, fuelConsumption: e.target.value })}
                        placeholder="e.g., 18.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="ownerCount">Number of Previous Owners</Label>
                      <Select
                        value={formData.ownerCount.toString()}
                        onValueChange={(value) => setFormData({ ...formData, ownerCount: Number(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1st Owner</SelectItem>
                          <SelectItem value="2">2nd Owner</SelectItem>
                          <SelectItem value="3">3rd Owner</SelectItem>
                          <SelectItem value="4">4+ Owners</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Registration State */}
                  <div>
                    <Label htmlFor="registrationState">Registration State</Label>
                    <Input
                      id="registrationState"
                      value={formData.registrationState}
                      onChange={(e) => setFormData({ ...formData, registrationState: e.target.value })}
                      placeholder="e.g., Maharashtra, Delhi, Karnataka"
                      required
                    />
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-semibold text-lg">Features & Amenities</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      'ABS',
                      'Power Steering',
                      'Air Conditioning',
                      'Power Windows',
                      'Power Locks',
                      'Central Locking',
                      'Parking Sensor',
                      'Reverse Camera',
                      'Sunroof',
                      'Leather Seats',
                      'Alloy Wheels',
                      'Navigation System',
                      'Bluetooth',
                      'Fog Lights',
                      'Cruise Control',
                      'Hill Assist',
                    ].map((feature) => (
                      <div key={feature} className="flex items-center space-x-2">
                        <Checkbox
                          id={feature}
                          checked={formData.features.includes(feature)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData({
                                ...formData,
                                features: [...formData.features, feature],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                features: formData.features.filter((f) => f !== feature),
                              });
                            }
                          }}
                        />
                        <Label htmlFor={feature} className="font-normal cursor-pointer">
                          {feature}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={uploading}>
                  {uploading ? 'Uploading...' : isEditing ? 'Update Listing' : 'Create Listing'}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>View Only Mode</strong>
              <p className="mt-1">You don't have admin privileges to upload vehicle listings. Please contact an administrator for access.</p>
            </AlertDescription>
          </Alert>
        )}
      </div>
      <Footer />
    </div>
  );
}
