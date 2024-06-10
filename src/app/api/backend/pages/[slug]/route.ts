import { createError, handleError } from "@/app/api/utils";
import { getPagesFromDB, updatePageInDB } from "@/db";
import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";

interface SuccessResponse {
  success: true;
  data: RowDataPacket;
}

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {

    validateGETParams(params);

    const page = await getPagesFromDB(params.slug);

    if (!page.length) {
      throw createError('Page not found', 404);
    }

    return NextResponse.json<SuccessResponse>({ 
        success: true, 
        data: page[0] 
    });
  } catch (error) {

    return handleError(error);

  }
}

export async function PUT(req: Request, { params }: { params: { slug: string } }) {
    
    const { slug } = params;

    try {
        const { id, title, images, content, images_number} = await req.json();

        if(!slug || !title || !images || !content || !images_number || !id) {
            throw createError('Données manquantes', 400);
        }

        const { updated, old } = await updatePageInDB({
            id: Number(id),
            title: title as string,
            images: images as Array<string>,
            content: content as string,
            images_number: Number(images_number),
            slug: slug as string
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

function validateGETParams(params: { slug: string }) {
  if (!params.slug || typeof params.slug !== 'string') {
    throw createError('Slug non valide', 400);
  }
}


