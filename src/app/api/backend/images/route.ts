import fs from "node:fs/promises";
import sharp from 'sharp';
import path from "node:path";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { deleteImageFromDB, getImagesFromDB, insertImageToDB } from "@/db";
import { createError, handleError } from "../../utils";
import { ImageType } from "@/lib/definitions";

function validateImageFile(file: File) {
    const ext = path.extname(file.name).toLowerCase();

    // check if good format
    if (!(file instanceof File) || !['.jpg', '.jpeg', '.png', '.webp', '.svg'].includes(ext) || !file.type.startsWith('image/')) {
        throw createError("Unsupported file format", 400);
    }

    //check file size
    if (file.size > 5 * 1024 * 1024) {
        throw createError("File too large", 400);
    }

}

async function saveImageOnServer(file: File) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    let filename = file.name;
    let metadata = null;

    try {
        //get file metadata
        metadata = await sharp(buffer).metadata();

        //rename file if name already exists
        let i = 0;

        while (
            await fs.access(`./public/images/${filename}`).then(() => true).catch(() => false)
        ) {
            filename = `${file.name.split('.')[0]}-${++i}.${file.name.split('.')[1]}`;
        }

        await fs.writeFile(`./public/images/${filename}`, buffer);

    } catch (e) {

        console.error(e)
        throw createError("file data error", 500);

    }

    revalidatePath("/");

    return { filename, metadata };
}

export async function POST(req: Request) {
    try {
        const formData = await req.formData();

        const file = formData.get("file") as File;

        //validate file
        validateImageFile(file);


        //save fileon server
        const { filename, metadata } = await saveImageOnServer(file);

        // Insert record in table 'images'
        const src = `${process.env.BASE_URL}/images/${filename}`;
        const result = await insertImageToDB(filename, metadata.height, metadata.width, '', src);

        return NextResponse.json({
            success: true,
            data: {
                id: result.insertId,
                filename: filename,
                height: metadata.height,
                width: metadata.width,
                alt: '',
                src: src
            }
        });
    } catch (e) {
        return handleError(e);
    }
}

export async function GET() {
    try {
        const images = await getImagesFromDB();

        const returnedImages: ImageType[] = [];

        for (const i of images) {
            const filePath = path.join(process.cwd(), 'public', 'images', i.filename);
            const fileExists = await fs.access(filePath).then(() => true).catch(() => false);
        
            if (fileExists) {
                returnedImages.push(i);
            } else if (i.id) {
                await deleteImageFromDB(i.id);
            }
        }

        return NextResponse.json({
            success: true,
            data: returnedImages
        });

    } catch (e) {
        return handleError(e);
    }
}