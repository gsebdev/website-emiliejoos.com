'use client'

import { Button } from "@/app/_components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/_components/ui/card";
import { Loader, Plus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPosts, patchPosts, selectAllPosts, selectPostsStatus } from "../../_lib/slices/postsSlice";
import DragTable from "@/app/_components/ui/drag-table";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import { PostType } from "@/app/_types/definitions";
import { AppDispatch } from "../../_lib/store";
import { postsColumns } from "./posts-columns-display-table";

export default function Posts() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();

    const posts = useSelector(selectAllPosts);
    const postsStatus = useSelector(selectPostsStatus);

    const handleRowDBClick = useCallback(({ id }: { id: string }) => {
        router.push(`/backend/posts/${id}`);
    }, [router]);

    const onReorder = useCallback((newData: PostType[]) => {
        const newPosts = newData.map(({ id, display_order }, index) =>
            display_order !== index ?
                {
                    id,
                    display_order: index
                } : null).filter(post => post !== null);

        if (newPosts.length === 0) return Promise.resolve();

        return dispatch(patchPosts({ posts: newPosts as Partial<PostType>[] }));

    }, [dispatch]);

    useEffect(() => {
        dispatch(fetchPosts());
    }, [dispatch]);

    return (
        <Card>
            <CardHeader className="flex-row justify-between flex-wrap items-center">
                <CardTitle>Liste des Posts</CardTitle>
                <Button onClick={() => router.push('/backend/posts/new')}><Plus className="mr-2" /> Ajouter</Button>
            </CardHeader>

            <CardContent>
                {!posts && ['loading', 'idle'].includes(postsStatus) && <div className="flex justify-center items-center h-96"><Loader /></div>}
                {!!posts && posts.length > 0 &&
                    <DragTable
                        columns={postsColumns}
                        rows={posts}
                        onReorder={onReorder}
                        onRowDoubleClick={handleRowDBClick}
                        orderAccessorKey="display_order" />
                }
            </CardContent>
        </Card>
    )
}