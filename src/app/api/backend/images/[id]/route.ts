import { createError, handleError } from "@/app/api/utils";
import { deleteImageFromDB, updateImageAlt } from "@/db";
import { NextResponse } from "next/server";
import fs from "node:fs/promises";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    const { id } = params;
    
    try {

        const deletedImage = await deleteImageFromDB(Number(id));

        try {

            await fs.unlink(`./public/images/${deletedImage.filename}`);

        } catch(e) {

            console.error(e);
            throw createError('Failed to delete image', 500);
    
        }
        
        return NextResponse.json({ 
            success: true, 
            prevState: deletedImage
        });

    } catch (e) {

        return handleError(e);

    }
}


export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    
    const { id } = params;

    try {
        const { alt } = await req.json();

        const { updated, old } = await updateImageAlt(Number(id), alt);


        return NextResponse.json({
            success: true,
            data: updated,
            prevState: old
        });

    } catch (e) {
        return handleError(e);
    }
}

