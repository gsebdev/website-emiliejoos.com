import { logEvent } from "@/db";
import { redirectToLogin } from "@/lib/utils";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    let username = null;

    try {
        const cookie = cookies().get('loggedUser');

        if (!cookie) {
            throw new Error('Cookie not found', {
                cause: 400
            });
        }

        const cookiePayload = JSON.parse(cookie.value);

        if (!cookiePayload.token) {
            throw new Error('Token not found', {
                cause: 400
            });
        }

        username = cookiePayload.username;

    } catch (error) {

        console.error(error);

    } finally {
        // delete cookie where is stored the token
        cookies().delete('loggedUser');
        logEvent(username, 'logout', null, null, Date.now());
        return redirectToLogin();
    }
}