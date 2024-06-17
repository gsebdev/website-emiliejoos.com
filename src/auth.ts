import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

export type UserType = {
    id: number;
    username: string;
    firstname: string;
    lastname: string;
}

export const generateJwt = async (payload: any, expiresIn = '1h') => {
    if (!process.env.JWT_SECRET_KEY) throw new Error('JWT_SECRET_KEY is not defined')
    const key = new TextEncoder().encode(process.env.JWT_SECRET_KEY)
    const jwt = await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime(expiresIn)
        .sign(key);
    return jwt;
};

export const verifyJwt = async (token: string | undefined) => {
    if (!token) return null;
    try {
        if (!process.env.JWT_SECRET_KEY) throw new Error('JWT_SECRET_KEY is not defined');
        const key = new TextEncoder().encode(process.env.JWT_SECRET_KEY);
        const { payload } = await jwtVerify(token, key);
        return payload;
    } catch (error) {
        return null;
    }
};

export async function setLoginCookie(token: string, user: any) {
    const cookieData = JSON.stringify({
        token,
        firstname: user.firstname,
        lastname: user.lastname,
        username: user.username,
        id: user.id
    });

    cookies().set('loggedUser', cookieData, {
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    });
}