// Only server side functions here !!!! Don't import them in client components ! 

import { NextResponse } from "next/server";
import { ErrorResponse } from "../_types/definitions";
import { Auth } from "./auth";
import { logEvent } from "./db";

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

interface SafeError extends Error {
  status: number;
  isResponseSafe: boolean;
}

export function createResponseError(message: string, status: number): SafeError {
  const error = {
    message: message,
    status: status,
    name: 'Error',
    isResponseSafe: true,
    toString() {
      return `Error ${status}: ${this.message}`;
    },
  }

  return error;
}

export function handleResponseError(error: any): NextResponse {

  let status = 500;
  let message = 'Erreur Interne du Serveur';

  if (typeof error === 'object' && error !== null) {
    status = error.status ?? 500;

    if (!error.isResponseSafe) {

      const { currentUser } = Auth.getSession();
      logEvent(currentUser?.username ?? 'anonymous', 'Error', null, error.message);

    } else {
      message = error.toString();
    }
  }

  return NextResponse.json<ErrorResponse>({
    success: false,
    error: message
  },
    { status });
}