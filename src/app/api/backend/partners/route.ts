"use server";

import { NextResponse } from "next/server";
import { getPartnersFromDB, insertPartnerToDB, updatePartnerInDB } from "@/app/_lib/db";
import { createResponseError, handleResponseError } from "@/app/_lib/utils";
import { partnerFormSchema } from "@/app/_lib/form-shemas";
import { PartnerType } from "@/app/_types/definitions";
import { z } from "zod";


/**
 * Handles the POST request to create a new partner entry in the database. Data is sanitized before insertion.
 *
 * @param {Request} req - The request object containing the partner data.
 * @return {Promise} A promise that resolves to the response data after creating the partner entry.
 */
export async function POST(req: Request) {

    try {
        const requestData = await req.json();

        const parsedData = partnerFormSchema.safeParse(requestData);

        if (!parsedData.success) {
            throw createResponseError(parsedData.error.errors.map(e => e.message).join(', '), 400);
        }

        const { title, url, logo, description, display_order } = parsedData.data;

        const result = await insertPartnerToDB({
            title,
            url,
            logo,
            description,
            display_order
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

        return handleResponseError(e);

    }
}

/**
 * Retrieves partners from the database and returns them in a JSON response. Data is sanitized before sending it.
 *
 * @return {Promise<NextResponse>} A Promise that resolves to a NextResponse object.
 * @throws {Error} If there is an error retrieving the partners.
 */
export async function GET() {
    try {
        const partners = await getPartnersFromDB(null, true);

        const parsedPartners = partners.map(partner => partnerFormSchema.parse(partner));

        return NextResponse.json({
            success: true,
            data: parsedPartners
        });

    } catch (e) {

        return handleResponseError(e);

    }
}

export async function PATCH(req: Request) {
    try {
        const requestData = await req.json();
     
        if (!requestData || !Array.isArray(requestData)) {
            throw createResponseError('Données non valides', 400);
        }

        

        const parsedData = { success: false, data: [] as PartnerType[] };

        const valid = requestData.every((data: any) => {
            if (!data.id || typeof data.id !== 'number') return false;

            const keySchema = partnerFormSchema.keyof();
            const keys = Object.keys(data);

            if (keys.length < 2) return false;

            Object.keys(data).forEach(key => {
                if(!keySchema.safeParse(key).success) return false;
            });
 
            //check every value of the object data
            Object.entries(data).map(([key, value]) => {
                const shape = partnerFormSchema.shape[key as keyof typeof partnerFormSchema.shape];
                const parsedValue = shape.safeParse(value);

                if (!parsedValue.success) throw createResponseError('Données non valides', 400);

                data[key] = parsedValue.data;
            });

            parsedData.data.push(data);
            return true;
        });

        if (!valid) {
            throw createResponseError('Données non valides', 400);
        }

        parsedData.success = true;

        const responseData = [] as any[];

        for (const data of parsedData.data) {
            const { old, updated } = await updatePartnerInDB(data);
           
            const oldParsed = partnerFormSchema.safeParse(old);
            const updatedParsed = partnerFormSchema.safeParse(updated);
   
            if (!oldParsed.success || !updatedParsed.success) {
                throw createResponseError('Mise à partiellement effectuée ayant généré une erreur', 400);
            }

            responseData.push({
                old: oldParsed.data,
                updated: updatedParsed.data
            })
        }

        return NextResponse.json({
            success: true,
            data: responseData.map((data: any) => data.updated),
            prevState: responseData.map((data: any) => data.old)
        });

    } catch (e) {

        return handleResponseError(e);
    }

}