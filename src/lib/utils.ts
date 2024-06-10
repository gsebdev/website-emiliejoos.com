import { type ClassValue, clsx } from "clsx"
import { NextResponse } from "next/server";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function redirectToLogin(origin?: string) {
  const originUrl = origin ?? process.env.BASE_URL + '/backend';
  const redirectUrl = `${process.env.BASE_URL}/login?origin=${originUrl}`;
  return NextResponse.redirect(redirectUrl);
}

export function redirectToBackend() {
  return NextResponse.redirect(process.env.BASE_URL + '/backend');
}


export const handleAsyncThunkError = (errorMessage: string, action?: { label: string, onClick: () => void }) => {
  toast.error(errorMessage, {
    description: "Quelque chose a mal tourné. Veuillez réessayer plus tard.",
    action: action,
  });

  throw new Error(errorMessage);

}