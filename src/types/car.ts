export interface Car {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  year: number;
  kmDriven?: number;
  fuelType: string;
  transmission: string;
  bodyType?: string;
  color?: string;
  engineCapacity?: string;
  powerOutput?: string;
  torque?: string;
  seatingCapacity?: number;
  fuelConsumption?: string;
  ownerCount?: number;
  registrationState?: string;
  features?: string[];
  imageUrls: string[];
  createdAt: Date;
}

export interface CarFormData {
  title: string;
  description: string;
  price: number;
  location: string;
  year: number;
  kmDriven: number;
  fuelType: string;
  transmission: string;
  bodyType: string;
  color: string;
  engineCapacity: string;
  powerOutput: string;
  torque: string;
  seatingCapacity: number;
  fuelConsumption: string;
  ownerCount: number;
  registrationState: string;
  features: string[];
}