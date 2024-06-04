import { createConnection } from "@/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { NextResponse } from "next/server";
import fs from "node:fs/promises";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    const { id } = params;
    const db = await createConnection();
    try {
        const sqlGet = 'SELECT * FROM `images` WHERE `id` = ?';    
        const sqlDel = 'DELETE FROM `images` WHERE `id` = ?';
        const [image] = await db.query<RowDataPacket[]>(sqlGet, [id]);
        if (!image.length) {
            return NextResponse.json({ success: false, error: 'Image not found' });
        }
        await db.query<ResultSetHeader>(sqlDel, [id]);
        fs.unlink(`./public/images/${image[0].filename}`);
        db.end();
        return NextResponse.json({ success: true, prevState: image[0]} );
    } catch (e) {
        db.end();
        return NextResponse.json({ success: false, error: e });
    }
}


export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    const { id } = params;
    const db = await createConnection();
    try {
        
        const body = await req.json();
        const sqlGet = 'SELECT * FROM `images` WHERE `id` = ?';
        const [image] = await db.query<RowDataPacket[]>(sqlGet, [id]);
        if (!image.length) {
            return NextResponse.json({ success: false, error: 'Image not found' });
        }
        const sqlSet = 'UPDATE `images` SET `alt` = ? WHERE `id` = ?';
        await db.query<ResultSetHeader>(sqlSet, [body.alt, id]);
        db.end();
        return NextResponse.json({ success: true, data: { ...image[0], alt: body.alt } });
    } catch (e) {
        db.end();
        return NextResponse.json({ success: false, error: e });
    }
}

