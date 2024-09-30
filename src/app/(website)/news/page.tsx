import { getImagesFromDB, getPostsFromDB } from "@/app/_lib/db";
import Image from "next/image";
import { ServerErrorPage } from "../_components/server-error-page";
import { ImageType, PostType } from "@/app/_types/definitions";
import Link from "next/link";

export default async function News(): Promise<JSX.Element> {

    let posts: PostType[] | null = null;
    let covers: ImageType[] = [];


    try {

        posts = await getPostsFromDB();
        if (posts?.length) {
            for (const [i, post] of Array.from(posts.entries())) {
                const [cover] = await getImagesFromDB(post.cover);
                covers[i] = cover;
            }

        }
    } catch (e) {

        return <ServerErrorPage />

    }

    return (
        <div className="w-full relative pt-20 px-8 max-w-[1280px] mx-auto">
            <h1 className="text-center text-4xl md:text-6xl xl:text-7xl text-foreground pb-4">News</h1>
            {(posts === null || posts.length === 0) && covers[0] ?
                (
                    <p className="text-center text-xl font-bold">{"Aucune news n\'a encore été postée."}</p>
                ) : (
                    <ul className="grid grid-cols-2 gap-8 mt-16">
                        <li className="col-span-2">
                            <Link href={`/news/${posts?.[0].slug}`} legacyBehavior>
                                <a className="no-underline hover:no-underline grid grid-cols-2 gap-x-8 border border-gray-300">
                                    <div className="h-full relative">
                                        <Image
                                            src={covers[0]?.src}
                                            alt={covers[0]?.alt ?? ''}
                                            fill
                                            placeholder="blur"
                                            blurDataURL={covers[0].blur_data_image}
                                            sizes="(max-width: 576px) 100vw, 40vw"
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex flex-col py-8 pr-8">
                                        <p className="uppercase text-xs pb-2">Publié le {
                                            posts?.[0].updated_at ?
                                                new Intl.DateTimeFormat('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                                                    .format(new Date(posts?.[0].updated_at)) :
                                                ''
                                        }</p>
                                        <h2 className="text-5xl">
                                            {posts?.[0].title ?? ''}
                                        </h2>
                                        <p className="py-8 text-lg">
                                        {`${posts?.[0].excerpt?.slice(0, 300) ?? ''}${posts?.[0].excerpt?.length && posts?.[0].excerpt.length > 301 ? '...' : ''}`}
                                        </p>
                                        <button className="btn-secondary-inverted self-end mt-auto">
                                            Lire l&apos;article
                                        </button>
                                    </div>
                                </a>
                            </Link>
                        </li>
                        {
                            posts?.slice(1).map((post, index) => (
                                <li key={post.id}>
                                    <Link href={`/news/${post.slug}`} legacyBehavior>
                                        <a className="no-underline h-full hover:no-underline grid grid-cols-2 gap-x-4 border border-gray-300">
                                            <div className="h-full relative ">
                                                <Image
                                                    src={covers[index]?.src}
                                                    alt={covers[index]?.alt ?? ''}
                                                    fill
                                                    placeholder="blur"
                                                    blurDataURL={covers[index].blur_data_image}
                                                    sizes="(max-width: 576px) 100vw, 40vw"
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="flex flex-col pb-4 pr-4">
                                                <div className="bg-background relative -left-1/2 p-4">
                                                    <p className="uppercase text-xs pb-2">Publié le {
                                                        post.updated_at ?
                                                            new Intl.DateTimeFormat('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                                                                .format(new Date(post.updated_at)) :
                                                            ''
                                                    }</p>
                                                    <h2 className="text-4xl break-anywhere">
                                                        {post.title ?? ''}
                                                    </h2>
                                                </div>

                                                <p className="py-4 break-anywhere">
                                                    {`${post.excerpt?.slice(0, 200) ?? ''}${post.excerpt?.length && post.excerpt.length > 201 ? '...' : ''}`}
                                                </p>
                                                <button className="btn-secondary-inverted btn-secondary-inverted--small self-end p-2 text-sm mt-auto">
                                                    Lire l&apos;article
                                                </button>
                                            </div>
                                        </a>
                                    </Link>
                                </li>

                            ))
                        }
                    </ul>

                )}

        </div>
    )
}
