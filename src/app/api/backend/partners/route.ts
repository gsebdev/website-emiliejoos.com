import { NextResponse } from "next/server";
import { createError, handleError } from "../../utils";
import { getPartnersFromDB, insertPartnerToDB } from "@/db";
import { Partner } from "@/lib/definitions";

export function validatePartnerData(title: any, url: any, logo: any, description: any, display_order: any) {
    if (!title || !url || !logo || !description || typeof display_order !== 'number') {
        throw createError('Missing required fields', 400);
    }

    if (typeof title !== 'string' || typeof url !== 'string' || typeof logo !== 'object' || typeof description !== 'string') {
        throw createError('Invalid data type', 400);
    }
}
export async function POST(req: Request) {

    try {
        const { title, url, logo, description, display_order } = await req.json();

        validatePartnerData(title, url, logo, description, display_order);

        const result = await insertPartnerToDB({
            title: title as string,
            url: url as string,
            logo: logo as Partner['logo'],
            description: description as string,
            display_order: display_order as number
        });

        return NextResponse.json({
            success: true,
            data: {
                id: result.insertId,
                title: title,
                url: url,
                logo: logo,
                description: description,
                display_order: Number(display_order)
            }
        });
    } catch (e) {

        return handleError(e);

    }
}

export async function GET() {
    try {
        const partners = await getPartnersFromDB(null, true);

        return NextResponse.json({
            success: true,
            data: partners
        });

    } catch (e) {

        return handleError(e);

    }
}