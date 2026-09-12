export const SERVICE_IDS = ["classic", "gel", "acrylic", "nail-art"] as const;
export type ServiceId = (typeof SERVICE_IDS)[number];

export const CATEGORY_IDS = [
  "all",
  "acrylic",
  "gel",
  "nail-art",
  "classic",
] as const;
export type CategoryId = (typeof CATEGORY_IDS)[number];

export interface Service {
  id: ServiceId;
  name: string;
  shortName: string;
  description: string;
  price: number;
  duration: number;
  note: string;
}

export interface Photo {
  id: string;
  image: string;
  title: string;
  category: CategoryId;
  alt: string;
  position: string;
}

export interface Category {
  id: CategoryId;
  label: string;
}

export interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  style: string;
  example: boolean;
}

export interface BookingFormValues {
  name: string;
  email: string;
  service: ServiceId | "";
  date: string;
  time: string;
}

export interface BookingRequestFormValues {
  name: string;
  email: string;
  phone: string;
  service: string;
  notes: string;
}

export interface ReviewFormValues {
  name: string;
  rating: number;
  comment: string;
}

export interface BookingConfirmation {
  service: string;
  date: string;
  time: string;
}
