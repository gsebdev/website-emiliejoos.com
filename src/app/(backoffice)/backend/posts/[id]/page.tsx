'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/app/_components/ui/card";
import PostEditForm from "../post-edit-form";
import { useRouter } from "next/navigation";
import { Button } from "@/app/_components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { fetchPosts, selectPostById, selectPostsStatus } from "@/app/(backoffice)/_lib/slices/postsSlice";
import Loader from "@/app/_components/ui/loader";
import { useEffect } from "react";
import { AppDispatch } from "@/app/(backoffice)/_lib/store";

interface PostPageProps {
  params: {
    id: string;
  };
}

export default function EditPost({ params }: PostPageProps) {
  const { id } = params;
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const post = useSelector(selectPostById(Number(id)));
  const postsStatus = useSelector(selectPostsStatus);

  useEffect(() => {
      dispatch(fetchPosts(Number(id)));
  }, [dispatch, id]);

  return (
    <Card>
      <CardHeader className="flex-row justify-between flex-wrap items-center">
        <CardTitle>Modifier la Publication : {post?.title ?? ""}</CardTitle>
        <Button variant={"outline"} onClick={() => router.push("/backend/posts")}>Annuler</Button>
      </CardHeader>

      <CardContent>
        {!post && postsStatus === 'loading' && <Loader />}
        {!post && postsStatus === 'succeeded' && <div>Publication non trouvée</div>}
        {!post && postsStatus === 'error' && <div>Erreur, veuillez réessayer</div>}
        {post &&
          <PostEditForm
            post={post}
            isLoading={false}
            afterSubmit={() => router.push("/backend/posts")}
          />
        }
      </CardContent>
    </Card>
  )
}