import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getShareableUrl(path: string): string {
  const prodDomain = import.meta.env.VITE_APP_DOMAIN || window.location.origin;
  return `${prodDomain}${path}`;
}
