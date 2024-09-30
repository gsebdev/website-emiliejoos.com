import { getImagesFromDB, getPostBySlugFromDB } from "@/app/_lib/db"
import { notFound } from "next/navigation";
import { ServerErrorPage } from "../../_components/server-error-page";
import { ImageType, PostType } from "@/app/_types/definitions";
import { RenderBlocks } from "@/app/_lib/block-renderer";
import Image from "next/image";

export default async function PageOfSinglePost({ params }: { params: { slug: string } }): Promise<JSX.Element> {

    let post: PostType | null = null;
    let cover: ImageType | null = null;

    try {

        post = await getPostBySlugFromDB(params.slug);
        if (post?.cover) [cover] = await getImagesFromDB(post.cover);

    } catch (err: any) {
        if (err.status === 404) {
            notFound();
        } else {
            return <ServerErrorPage />
        }
    }

    if (!post) notFound();

    const begingingOfTitle = post.title?.split(' ').slice(0, 2).join(' ') ?? '';
    const restOfTitle = ' ' + post.title?.split(' ').slice(2).join(' ')?? '';

    return (
        <div className="mt-24 sm:mt-28 md:mt-32">
            <div className="grid grid-cols-12 max-w-screen-2xl mx-auto">
            <div className="relative left-20 z-10 col-span-4 w-[125%]">
                    <p className="uppercase text-xs text-popover md:text-lg pb-2">Publié le {
                        post.updated_at ?
                            new Intl.DateTimeFormat('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                                .format(new Date(post.updated_at)) :
                            ''
                    }</p>
                    <h1 className="blog-title"><span className="relative emphased text-background">{begingingOfTitle}</span><br />{restOfTitle}</h1>
                </div>

                <div className="col-span-8 relative aspect-video">
                    {cover &&
                        <Image
                            src={cover?.src ?? ''}
                            alt={cover?.alt ?? ''}
                            fill
                            className="object-cover"
                        />
                    }

                </div>
            </div>


            <div className="px-8 xs:px-12 sm:px-20 max-w-screen-2xl mx-auto box-content">
                <RenderBlocks content={post.content ?? []} />
            </div>
        </div>
    )
}