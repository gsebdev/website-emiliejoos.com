import { SignJWT, jwtVerify } from 'jose';
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

