"use server"

import { deletePartnerFromDB, getPartnersFromDB, updatePartnerInDB } from "@/app/_lib/db";
import { NextResponse } from "next/server";
import { createResponseError, handleResponseError } from "@/app/_lib/utils";
import { partnerFormSchema } from "@/app/_lib/form-shemas";


export async function GET(req: Request, { params }: { params: { id: string } }) {
    const { id } = params;

    try {

        if (!id || isNaN(Number(id))) {
            throw createResponseError('Invalid id', 400);
        }

        const partner = await getPartnersFromDB(Number(id));

        if (!partner.length) {
            throw createResponseError('Partner not found', 404);
        }

        const parsedPartner = partnerFormSchema.parse(partner[0]);

        return NextResponse.json({
            success: true,
            data: parsedPartner
        });

    } catch (e) {

        return handleResponseError(e);

    }
}
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    const { id } = params;

    try {

        if (!id || isNaN(Number(id))) {
            throw createResponseError('Invalid id', 400);
        }

        const deletedPartner = await deletePartnerFromDB(Number(id));

        const parsedDeletedPartner = partnerFormSchema.safeParse(deletedPartner);

        return NextResponse.json({
            success: true,
            prevState: parsedDeletedPartner.success ? parsedDeletedPartner.data : null
        });

    } catch (e) {

        return handleResponseError(e);

    }
}


export async function PUT(req: Request, { params }: { params: { id: string } }) {

    const id = Number(params.id);

    try {
        const requestData = await req.json();

        const parsedData = partnerFormSchema.safeParse({
            ...requestData,
            id
        });

        if (!parsedData.success) {
            throw createResponseError('Données non valides', 400);
        }

        const { title, url, logo, description, display_order } = parsedData.data;

        const { updated, old } = await updatePartnerInDB({
            id,
            title,
            url,
            logo,
            description,
            display_order
        });

        const parsedUpdated = partnerFormSchema.safeParse(updated);
        const parsedOld = partnerFormSchema.safeParse(old);

        if (!parsedUpdated.success || !parsedOld.success) {
            throw createResponseError('Le partenaire a été modifié. Données de retour non valides', 500);
        }

        return NextResponse.json({
            success: true,
            data: parsedUpdated.data,
            prevState: parsedOld.data
        });

    } catch (e) {

        return handleResponseError(e);

    }
}