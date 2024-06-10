import { getLogsFromDB } from "@/db";
import { NextResponse } from "next/server";
import { handleError } from "../../utils";

export async function GET() {
    try {
        const logs = await getLogsFromDB();

        return NextResponse.json({ 
            success: true, 
            data: logs 
        });

    } catch (e) {
        return handleError(e);
    }
}