import { Auth } from "@/app/_lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {

    try {

        const { auth, responseHeaders } = await Auth.signOut();

        return NextResponse.json(
            {
                success: true
            },
            {
                headers: responseHeaders
            }
        );

    } catch (e) {

        console.error(e);

        return new NextResponse('Internal Server Error', { status: 500 });
    }
}