import { getLogsFromDB } from "@/app/_lib/db";
import { NextResponse } from "next/server";
import { handleResponseError } from "@/app/_lib/utils";
import DOMPurify from "isomorphic-dompurify";

export async function GET() {
    try {
        const logs = await getLogsFromDB();

        const purifiedLogs = logs.map(log => {

            log.username = DOMPurify.sanitize(log.username);
            log.action = DOMPurify.sanitize(log.action);
            log.payload = DOMPurify.sanitize(log.payload);
            log.error = DOMPurify.sanitize(log.error);

            return log;

        })

        return NextResponse.json({
            success: true,
            data: purifiedLogs
        });

    } catch (e) {

        return handleResponseError(e);

    }
}