export interface Car {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  year: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  imageUrls: string[];
  createdAt: Date;
}

export interface CarFormData {
  title: string;
  description: string;
  price: number;
  location: string;
  year: number;
  mileage: number;
  fuelType: string;
  transmission: string;
}