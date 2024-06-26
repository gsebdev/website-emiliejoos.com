"use server"

import { deletePostFromDB, getPostsFromDB } from "@/app/_lib/db";
import { NextResponse } from "next/server";
import { createResponseError, handleResponseError } from "@/app/_lib/utils";
import { postFormSchema } from "@/app/_lib/form-shemas";


export async function GET(req: Request, { params }: { params: { id: string } }) {
    const { id } = params;

    try {

        if (!id || isNaN(Number(id))) {
            throw createResponseError('Invalid id', 400);
        }

        const post = await getPostsFromDB(Number(id));

        if (!post.length) {
            throw createResponseError('post not found', 404);
        }

        const parsedPost = postFormSchema.parse(post[0]);

        return NextResponse.json({
            success: true,
            data: parsedPost
        });

    } catch (e) {

        return handleResponseError(e);

    }
}
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    const { id } = params;

    try {

        if (!id || isNaN(Number(id))) {
            throw createResponseError('Invalid id', 400);
        }

        const deletedPost = await deletePostFromDB(Number(id));

        const parsedDeletedPost = postFormSchema.safeParse(deletedPost);

        return NextResponse.json({
            success: true,
            prevState: parsedDeletedPost.success ? parsedDeletedPost.data : null
        });

    } catch (e) {

        return handleResponseError(e);

    }
}