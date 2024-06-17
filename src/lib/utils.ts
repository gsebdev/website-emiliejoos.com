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

export const getBlurDataImage = async (url: string) => {
  const base64str = await fetch(
    `${process.env.BASE_URL}/_next/image?url=${url}&w=16&q=75`
  ).then(async (res) =>
    Buffer.from(await res.arrayBuffer()).toString('base64')
  );

  const blurSvg = `
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 5'>
      <filter id='b' color-interpolation-filters='sRGB'>
        <feGaussianBlur stdDeviation='1' />
      </filter>

      <image preserveAspectRatio='none' filter='url(#b)' x='0' y='0' height='100%' width='100%' 
      href='data:image/avif;base64,${base64str}' />
    </svg>
  `;
  const toBase64 = (str: string) =>
    typeof window === 'undefined'
      ? Buffer.from(str).toString('base64')
      : window.btoa(str);

  return `data:image/svg+xml;base64,${toBase64(blurSvg)}`;
}

