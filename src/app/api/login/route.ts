"use server";
import { NextRequest, NextResponse } from "next/server";
import { createResponseError, handleResponseError } from "@/app/_lib/utils";
import { Auth } from "@/app/_lib/auth";
import { loginFormSchema } from "@/app/_lib/form-shemas";



export const GET = async () => {
    try {
        const { auth } = await Auth.authenticate();

        if (auth.isLoggedIn && auth.currentUser) {
            
            // return the current loggedUser if already loggedIn
            return NextResponse.json({

                success: true,
                data: auth.currentUser

            }, { status: 200 })
        } 
        else {

            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

    } catch (e) {

        return handleResponseError(e);

    }
}

export const POST = async (request: NextRequest) => {

    try {

        const { username, password } = await request.json();

        //assert and sanitize input values
        const result = loginFormSchema.safeParse({
            username,
            password
        });

        if (!result.success) {

            throw createResponseError(result.error.errors.map(e => e.message).join(', '), 400);
        }

        // signin with credentials
        const { auth, responseHeaders } = await Auth.signIn(username, password)

        //then verify if the signin process has succeeded
        if (auth.isLoggedIn && auth.currentUser && auth.currentUser.username === username) {

            return NextResponse.json({

                success: true,
                data: auth.currentUser

            }, {
                status: 200,
                headers: responseHeaders
            });

        } else {

            throw createResponseError('Invalid Username or password', 401);
        }

    } catch (e) {

        return handleResponseError(e);

    }
};
