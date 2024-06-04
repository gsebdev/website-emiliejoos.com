import { createConnection } from "@/db";
import { RowDataPacket } from "mysql2";
import { NextResponse } from "next/server";

export async function GET() {
    const db = await createConnection();
    try {
        const sql = 'SELECT * FROM `logs`';
        const [logs] = await db.query<RowDataPacket[]>(sql);
        db.end();
        return NextResponse.json({ success: true, data: logs });
    } catch (e) {
        db.end();
        return NextResponse.json({ success: false, error: e });
    }
}