import fs from "node:fs/promises";
import sharp from 'sharp';
import path from "node:path";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { createConnection } from "@/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";

export async function POST(req: Request) {
    const db = await createConnection();
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        // check if good format
        const ext = path.extname(file.name).toLowerCase();
        if (!(file instanceof File) || !['.jpg', '.jpeg', '.png', '.webp', '.svg'].includes(ext) || !file.type.startsWith('image/')) {
            db.end();
            return NextResponse.json({ success: false, error: "Unsupported file format" });
        }
        //check file size
        if (file.size > 5 * 1024 * 1024) {
            db.end();
            return NextResponse.json({ success: false, error: "File too large" });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);

        //get file metadata
        let metadata;
        try {
            metadata = await sharp(buffer).metadata();
        } catch (e) {
            db.end();
            return NextResponse.json({ success: false, error: "file data error" });
        }
        //rename file if name already exists
        let filename = file.name;
        let i = 0;
        while (await fs.access(`./public/images/${filename}`).then(() => true).catch(() => false)) {
            filename = `${file.name.split('.')[0]}-${++i}.${file.name.split('.')[1]}`;
        }
        await fs.writeFile(`./public/images/${filename}`, buffer);


        revalidatePath("/");

        // Insert record in table 'images'
        
        const sql = 'INSERT INTO `images` (`filename`, `height`, `width`, `alt`, `src`) VALUES (?, ?, ?, ?, ?)';
        const [result] = await db.query<ResultSetHeader>(sql, [filename, metadata.height, metadata.width, '', `${process.env.BASE_URL}/images/${filename}`]);
        db.end();
        return NextResponse.json({
            success: true,
            data: {
                id: result.insertId,
                filename: filename,
                height: metadata.height,
                width: metadata.width,
                alt: '',
                src: `${process.env.BASE_URL}/images/${filename}`
            }
        });
    } catch (e) {
        db.end();
        return NextResponse.json({ success: false, error: e });
    }
}

export async function GET() {
    const db = await createConnection();
    try {
        
        const sql = 'SELECT * FROM `images`';
        const [images] = await db.query<RowDataPacket[]>(sql);
        db.end();
        return NextResponse.json({ success: true, data: images });

    } catch (e) {
        db.end();
        return NextResponse.json({ success: false, error: e });
    }
}