
"use server"

import { getPagesFromDB, updatePageInDB } from "@/app/_lib/db";
import { pageFormSchema } from "@/app/_lib/form-shemas";
import { createResponseError, handleResponseError } from "@/app/_lib/utils";
import { PageType } from "@/app/_types/definitions";
import { NextRequest, NextResponse } from "next/server";
import pagesConfig from '@/app/_config/pages.config.json';

interface SuccessResponse {
  success: true;
  data: Partial<PageType>;
}

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {

  const { slug } = params;
  const { title, images_number } = (pagesConfig as Record<string, Partial<PageType>>)[slug] || {};

  try {

    if (!slug || !/^[a-zA-Z0-9_-]+$/.test(slug)) {
      throw createResponseError('Page non trouvée', 404);
    }

    const pages = await getPagesFromDB(params.slug);

    if (!pages.length) {
      throw createResponseError('Page non trouvée', 404);
    }

    const parsedPage = pageFormSchema.safeParse(pages[0]);

    if (title !== pages[0].title || images_number !== pages[0].images_number || !parsedPage.success) {
      throw createResponseError('Erreur de validité des données', 500);
    }

    return NextResponse.json<SuccessResponse>({
      success: true,
      data: {
        ...parsedPage.data,
        slug,
        title,
        images_number
      }
    });
  } catch (error) {

    return handleResponseError(error);

  }
}

export async function PUT(
  req: Request,
  { params }: { params: { slug: string } }): Promise<NextResponse> {

  const { slug } = params;
  const { title, images_number } = (pagesConfig as Record<string, Partial<PageType>>)[slug] || {};

  try {

    //check if page record exists
    const result = await getPagesFromDB(slug);

    if (result.length !== 1) {
      throw createResponseError('Page non trouvée', 404);
    }

    const { id } = result[0];

    const requestData = await req.json();

    // check data validity and sanitize it
    const parsedData = pageFormSchema.safeParse(requestData);

    if (!parsedData.success || parsedData.data?.id !== id) {
      throw createResponseError('Erreur de validité des données', 400);
    }

    const { content, images } = parsedData.data;

    // if no error, save it to database

    const { updated, old } = await updatePageInDB({
      id,
      title,
      images,
      content,
      images_number,
      slug
    });


    // check if data is valid

    const parsedUpdated = pageFormSchema.safeParse(updated);
    const parsedOld = pageFormSchema.safeParse(old);

    if (!parsedUpdated.success || !parsedOld.success) {
      throw createResponseError('Page mise à jour mais a généré une erreur serveur', 500);
    }

    return NextResponse.json({
      success: true,
      data: updated,
      prevState: old
    });

  } catch (e) {

    return handleResponseError(e);

  }
}


