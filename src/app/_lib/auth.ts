import { SignJWT, jwtVerify } from 'jose';
import { countMissedLoginAttemps, getUserFromDB, logEvent } from '@/app/_lib/db';
import bcrypt from 'bcryptjs';
import { createResponseError } from './utils';
import { cookies, headers } from 'next/headers';
import { NextResponse } from 'next/server';


export type UserRecordType = {
    id: number;
    username: string;
    firstname: string;
    lastname: string;
    password: string;
    email: string;
}


export class Auth {
    private _isLoggedIn: boolean = false;
    private _currentUser: Partial<UserRecordType> | null = null;

    private constructor() {
        return this;
    }

    public static authenticate = async (checkCsrf: boolean = true) => {

        const auth = new Auth();

        try {
            //check if headers method is not GET
            if (checkCsrf) {

                //Use Double-Submit cookie verification to protect against csrf attacks
                const crsfTokenCookie = cookies().get('csrfToken');
                const csrfTokenHeader = headers().get('X-CSRF-Token');

                if (!crsfTokenCookie || !csrfTokenHeader || csrfTokenHeader !== crsfTokenCookie.value) {
                    throw createResponseError('Invalid csrf', 401);
                }

            }

            //get JWT Token cookie data in headers
            const sessionTokenCookie = cookies().get('sessionToken');

            if (!sessionTokenCookie) {
                throw createResponseError('Invalid Credentials', 401);
            }

            // verify validity of the token
            const tokenPayload = await auth._decodeJWT(sessionTokenCookie.value);

            if (
                !tokenPayload ||
                !Object.keys(tokenPayload).includes('id') ||
                !Object.keys(tokenPayload).includes('username') ||
                typeof tokenPayload.id !== 'number' ||
                typeof tokenPayload.username !== 'string'
            ) {
                throw createResponseError('Invalid Credentials', 401);
            }

            auth._isLoggedIn = true;
            auth._currentUser = {
                id: tokenPayload.id as number,
                username: tokenPayload.username as string,
                firstname: tokenPayload.firstname as string,
                lastname: tokenPayload.lastname as string,
                email: tokenPayload.email as string
            };

        } catch (error) {

            console.error(error);

            auth._isLoggedIn = false;
            auth._currentUser = null;

        }

        const responseNext = auth._setNewRequestHeaders();

        return {
            auth,
            responseNext
        };
    }

    public static getSession = () => {

        const currentUser = headers().get('X-user-session');
        const isLoggedIn = headers().get('X-is-logged-in');
        
        if (!currentUser || !isLoggedIn) return {
            isLoggedIn: false,
            currentUser: null
        };

        return {
            isLoggedIn: JSON.parse(isLoggedIn),
            currentUser: JSON.parse(currentUser)
        }
    }

    private _setNewRequestHeaders = () => {
        
        const newHeaders = new Headers(headers());

        // set new request headers then data is accessible later in server components
        newHeaders.set('X-user-session', JSON.stringify(this._currentUser));
        newHeaders.set('X-is-logged-in', JSON.stringify(this._isLoggedIn));

        return NextResponse.next({
            request: {
                headers: newHeaders
            }
        });
    }

    private _decodeJWT = async (token: string | undefined) => {

        if (!token || typeof token !== 'string') return null;

        try {
            const key = new TextEncoder().encode(process.env.JWT_SECRET_KEY);

            const { payload } = await jwtVerify(token, key);

            return payload;

        } catch (error) {

            console.error(error);

            return null;
        }
    };

    private _createJWT = async (payload: any, expiresIn = '1h') => {

        if (!process.env.JWT_SECRET_KEY || typeof process.env.JWT_SECRET_KEY !== 'string') {

            throw new Error('JWT_SECRET_KEY is not defined');

        }

        const key = new TextEncoder().encode(process.env.JWT_SECRET_KEY);

        const jwt = await new SignJWT(payload)
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime(expiresIn)
            .sign(key);

        return jwt;
    }

    private _createCSRF = async () => {
        const token = require('crypto').randomBytes(64).toString('hex');
        return token;
    }

    public static signIn = async (username: string, password: string) => {

        const auth = new Auth();

        let users: UserRecordType[] | null = null;

        try {
            //check if there is not too much login attemps for this username, else throw an error
            const missedAttemps = await countMissedLoginAttemps(username, 86400000 /*24h*/);

            if (missedAttemps.count > 5) {

                throw createResponseError('Too many failed login attempts', 429);
            }

            //find the user in database
            users = await getUserFromDB(username);

        } catch (e) {

            await logEvent(username, 'login', null, 'Error when fetching user in database');

            throw e;
        }

        //check if 1 and only 1 user is found
        if (!users || users?.length !== 1) {

            await logEvent(username, 'login', null, 'Invalid username or password');

            throw createResponseError('Invalid username or password', 401);
        }

        const { password: hashedPassword, id, email, firstname, lastname } = users[0];

        // check if password match
        const passwordMatch = await bcrypt.compare(password, hashedPassword);

        if (!passwordMatch) {

            await logEvent(username ?? '', 'login', null, 'Invalid username or password');

            throw createResponseError('Invalid username or password', 401);
        }

        //login is successfull
        //set JWT and csrf token cookies 

        try {

            const sessionToken = await auth._createJWT({
                id,
                username,
                email,
                firstname,
                lastname
            }, '7d');

            const csrfToken = await auth._createCSRF();

            auth._currentUser = {
                id,
                username,
                email,
                firstname,
                lastname
            };

            auth._isLoggedIn = true;

            const cookies = [
                `sessionToken=${sessionToken}; HttpOnly; Path=/; SameSite=strict; ${process.env.NODE_ENV === 'production' ? 'Secure; ' : ''}max-age=604800;`,
                `csrfToken=${csrfToken}; Path=/; SameSite=strict; ${process.env.NODE_ENV === 'production' ? 'Secure; ' : ''}max-age=604800;`
            ]

            const response = new NextResponse();

            response.headers.append('Set-Cookie', cookies[0]);
            response.headers.append('Set-Cookie', cookies[1]);

            return {
                responseHeaders: response.headers,
                auth
            };

        } catch (error) {

            console.error('failed generate jwt and csrf cookies');

            throw createResponseError('Internal Server Error', 500);

        }
    }

    public static signOut = async () => {

        const auth = new Auth();

        auth._isLoggedIn = false;
        auth._currentUser = null;

        try {

            const response = new NextResponse();

            //remove all cookies
            cookies().getAll().forEach(cookie => response.cookies.delete(cookie.name));

            return {
                responseHeaders: response.headers,
                auth
            };

        } catch (error) {

            console.error(error);

            throw createResponseError('Internal Server Error', 500);
        }


    }

    public static hashPassword = async (password: string) => {

        if (!password || typeof password !== 'string') {
            throw new Error('Password missing or bad format');
        }

        return await bcrypt.hash(password, 10);
    }

    get isLoggedIn() {
        return this._isLoggedIn;
    }

    get currentUser() {
        return this._currentUser;
    }
}