"use server";

import { NextResponse } from "next/server";
import { getPostsFromDB, insertPostToDB, updatePostInDB } from "@/app/_lib/db";
import { createResponseError, handleResponseError } from "@/app/_lib/utils";
import { postFormSchema } from "@/app/_lib/form-shemas";
import { PostType } from "@/app/_types/definitions";


/**
 * Handles the POST request to create a new post
 * 
 */
export async function POST(req: Request) {

    try {
        const requestData = await req.json();

        const parsedData = postFormSchema.safeParse(requestData);

        if (!parsedData.success) {
            throw createResponseError(parsedData.error.errors.map(e => e.message).join(', '), 400);
        }

        const { title, excerpt, content, cover } = parsedData.data;

        const result = await insertPostToDB({
            title,
            excerpt,
            content,
            cover
        });

        if (!result.success) {
            throw createResponseError('Erreur Interne du Serveur', 500);
        }

        return NextResponse.json(result);

    } catch (e) {

        return handleResponseError(e);

    }
}

/**
 * Handles the GET request to get all the posts
 *
 */
export async function GET() {
    try {
        const posts = await getPostsFromDB(null, true);

        const parsedPosts = posts.map((post: PostType) => postFormSchema.parse(post));

        return NextResponse.json({
            success: true,
            data: parsedPosts
        });

    } catch (e) {

        return handleResponseError(e);

    }
}

/**
 * Handles the PATCH request to update a post
 *
 */

export async function PATCH(req: Request) {
    try {
        const requestData = await req.json();

        if (!requestData || !Array.isArray(requestData)) {
            throw createResponseError('Données non valides', 400);
        }

        const parsedData = { success: false, data: [] as PostType[] };

        const valid = requestData.every((data: any) => {

            if (!data.id || typeof data.id !== 'number') return false;

            if(data.created_at) data.created_at = new Date(data.created_at);
            if(data.updated_at) data.updated_at = new Date(data.updated_at);

            const keys = Object.keys(data);
            if (keys.length < 2) return false;

            const keySchema = postFormSchema.keyof();
            
            //verify the keys are belonging to the schema
            if (
                !Object.keys(data).every(key => keySchema.safeParse(key).success)
            ) return false;

            //check every value of the object data
            Object.entries(data).map(([key, value]) => {
                const shape = postFormSchema.shape[key as keyof typeof postFormSchema.shape];
                const parsedValue = shape.safeParse(value);

                if (!parsedValue.success) throw createResponseError('Données non valides', 400);

                data[key] = parsedValue.data;
            });

            parsedData.data.push(data);
            return true;
        });

        if (!valid) {
            throw createResponseError('Données non valides', 400);
        }

        parsedData.success = true;

        const responseData = [] as any[];

        for (const data of parsedData.data) {
            const { old, updated } = await updatePostInDB(data);

            const oldParsed = postFormSchema.safeParse(old);
            const updatedParsed = postFormSchema.safeParse(updated);

            if (!oldParsed.success || !updatedParsed.success) {
                throw createResponseError('Mise à partiellement effectuée ayant généré une erreur', 400);
            }

            responseData.push({
                old: oldParsed.data,
                updated: updatedParsed.data
            })
        }

        return NextResponse.json({
            success: true,
            data: responseData.map((data: any) => data.updated),
            prevState: responseData.map((data: any) => data.old)
        });

    } catch (e) {

        return handleResponseError(e);
    }

}