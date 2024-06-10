import { getPagesFromDB } from "@/db";
import { NextResponse } from "next/server";
import { createError, handleError } from "../../utils";

export async function GET() {
    try {
        const pages = await getPagesFromDB();

        if(!pages.length) {
            throw createError('Aucune page n\'a été trouvée', 404);
        }
        
        return NextResponse.json({ 
            success: true, 
            data: pages 
        });

    } catch (e) {

        return handleError(e);
        
    }
}