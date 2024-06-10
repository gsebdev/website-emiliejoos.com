import { createError, handleError } from "@/app/api/utils";
import { deletePartnerFromDB, getPartnersFromDB, updatePartnerInDB } from "@/db";
import { NextResponse } from "next/server";
import { validatePartnerData } from "../route";
import { Partner } from "@/lib/definitions";


export async function GET(req: Request, { params }: { params: { id: string } }) {
    const { id } = params;

    try {
        
        if(!id || isNaN(Number(id))) {
            throw createError('Invalid id', 400);
        }

        const partner = await getPartnersFromDB(Number(id));

        return NextResponse.json({
            success: true,
            data: partner[0]
        });

    } catch (e) {

        return handleError(e);

    }
}
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    const { id } = params;
    
    try {

        if(!id || isNaN(Number(id))) {
            throw createError('Invalid id', 400);
        }

        const deletedPartner = await deletePartnerFromDB(Number(id));
        
        return NextResponse.json({ 
            success: true, 
            prevState: deletedPartner
        });

    } catch (e) {

        return handleError(e);

    }
}


export async function PUT(req: Request, { params }: { params: { id: string } }) {
    
    const { id } = params;

    try {
        const { title, url, logo, description, display_order} = await req.json();

        if(!id || isNaN(Number(id))) {
            throw createError('Invalid id', 400);
        }

        validatePartnerData(title, url, logo, description, display_order);

        const { updated, old } = await updatePartnerInDB({
            id: Number(id),
            title: title as string,
            url: url as string,
            logo: logo as Partner['logo'],
            description: description as string,
            display_order: display_order as number
        });


        return NextResponse.json({
            success: true,
            data: updated,
            prevState: old
        });

    } catch (e) {

        return handleError(e);

    }
}