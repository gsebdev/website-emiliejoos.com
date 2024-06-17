import { generateJwt, setLoginCookie } from "@/auth";
import { getUserFromDB, logEvent } from "@/db";
import { NextRequest, NextResponse } from "next/server";
import * as bcrypt from "bcrypt";


export async function POST(request: NextRequest) {

    const { username, password } = await request.json();

    try {

        if (!username || !password) {

            logEvent(username, 'login', null, 'missing username or password', Date.now());
            return NextResponse.json({ error: 'Missing username or password' }, { status: 400 });

        }

        const users = await getUserFromDB(username);

        if (users.length !== 1) {

            logEvent(username, 'login', null, 'no found username', Date.now());
            return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });

        }

        const loggedUser = users[0];

        const passwordMatch = await verifyPassword(password, loggedUser.password);

        if (!passwordMatch) {

            logEvent(username, 'login', null, 'invalid password', Date.now());
            return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });

        }

        const token = await generateJwt({
            id: loggedUser.id,
            username: loggedUser.username,
            firstname: loggedUser.firstname,
            lastname: loggedUser.lastname
        }, '7d');

        setLoginCookie(token, loggedUser);

        logEvent(username, 'login', null, null, Date.now());

        return NextResponse.json({ success: true }, { status: 200 });

    } catch (e) {

        logEvent(username, 'login', null, e instanceof Error ? e.message : 'Unknown error', Date.now());

        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
};

export const verifyPassword = async (password: string, hashedPassword: string) => {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  }
  
  export const encodePassword = async (password: string) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    return hashedPassword;
  }