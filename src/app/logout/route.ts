import { logEvent } from "@/db";
import { verifyJwt } from "@/auth";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    const { token } = JSON.parse(cookies().get('loggedUser')?.value ?? '{}');
    const payload = await verifyJwt(token);
    cookies().delete('loggedUser');
    const res = Response.redirect(new URL('/login', req.url))
    await logEvent(typeof payload?.username === 'string' ? payload.username : null, 'logout', null, null, Date.now());
    return res

 }