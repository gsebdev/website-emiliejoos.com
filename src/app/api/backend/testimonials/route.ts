import { NextRequest, NextResponse } from "next/server";
import { getSettingFromDB, saveSettingInDB } from "@/app/_lib/db";
import { createResponseError, handleResponseError } from "@/app/_lib/utils";

export async function GET() {
    try {
        const testimonials = await getSettingFromDB('testimonials');

        if (!testimonials || !testimonials.length) {
            throw createResponseError('No testimonials found', 404);
        }

        return NextResponse.json({
            success: true,
            data: testimonials[0]
        });

    } catch (e) {
        return handleResponseError(e);
    }
}

export async function POST(req: NextRequest) {

    try {
        const data = await req.json();

        //check data error
        if (
            !data ||
            !Array.isArray(data) ||
            data.some(val => typeof val !== 'object' || typeof val.image !== 'number' || typeof val.id !== 'string')
        ) {
            throw createResponseError('Invalid data', 400);
        }

        const responseData = await saveSettingInDB('testimonials', data);

        if (!responseData) {
            throw createResponseError('Failed to update testimonials', 500);
        }

        return NextResponse.json({
            success: true,
            data: responseData.updated,
            prevState: responseData.old
        });

    } catch (e) {

        return handleResponseError(e);
    }
}