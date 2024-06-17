import { NextRequest, NextResponse } from "next/server";
import { createError, handleError } from "../../utils";
import { getSettingFromDB, saveSettingInDB } from "@/db";

export async function GET() {
    try {
        const testimonials = await getSettingFromDB('testimonials');

        if (!testimonials || !testimonials.length) {
            throw createError('No testimonials found', 404);
        }

        return NextResponse.json({
            success: true,
            data: testimonials[0]
        });

    } catch (e) {
        return handleError(e);
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
            throw createError('Invalid data', 400);
        }

        const responseData = await saveSettingInDB('testimonials', data);

        if (!responseData) {
            throw createError('Failed to update testimonials', 500);
        }

        return NextResponse.json({
            success: true,
            data: responseData.updated,
            prevState: responseData.old
        });

    } catch (e) {

        return handleError(e);
    }
}