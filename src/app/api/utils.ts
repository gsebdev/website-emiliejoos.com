import { NextResponse } from "next/server";

export interface ErrorResponse {
    success: false;
    error: string;
}

export function createError(message: string, status: number): Error {
    const error = new Error(message);
    (error as any).status = status;
    return error;
}

export function handleError(error: unknown): NextResponse {
    const status = (error as any).status ? (error as any).status : 500;
    const message = error instanceof Error ? error.message : 'Erreur du serveur';

    return NextResponse.json<ErrorResponse>({ success: false, error: message }, { status });
}