'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/app/_components/ui/card";
import PostEditForm from "../post-edit-form";
import { useRouter } from "next/navigation";
import { Button } from "@/app/_components/ui/button";

export default function NewPost() {
    const router = useRouter();

    return (
        <Card>
            <CardHeader className="flex-row justify-between flex-wrap items-center">
                <CardTitle>Nouvelle Publication</CardTitle>
                <Button variant={"outline"} onClick={() => router.push("/backend/posts")}>Annuler</Button>
            </CardHeader>

            <CardContent>
                <PostEditForm
                    isLoading={false}
                    afterSubmit={() => router.push("/backend/posts")}
                />
            </CardContent>
        </Card>
    )
}