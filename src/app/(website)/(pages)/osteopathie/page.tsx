import Image from "next/image";
import { notFound } from "next/navigation";
import { getPageData } from "@/app/_lib/db";
import { ServerErrorPage } from "../../_components/server-error-page";
import PageContent from "../../_components/page-content";
import { cn } from "@/app/_lib/client-utils";;

const imagesClassNames: Record<number, { container: string, image: string }> = {
    0: { container: 'md:row-span-5', image: 'object-top' },
    1: { container: 'md:row-span-5', image: 'object-top' },
    2: { container: 'md:row-span-3 xl:row-span-6', image: '' },
    3: { container: 'row-span-2 xl:row-span-4', image: '' },
    4: { container: 'row-span-2 xl:row-span-4', image: '' },
    5: { container: 'xl:row-span-4 xl:col-start-3', image: '' },
    6: { container: 'col-span-2 row-span-2 md:row-span-3 md:row-start-6 md:col-start-2 xl:col-start-4 xl:row-start-5 xl:row-span-6', image: '' },
}


export default async function OsteopathyPage(): Promise<JSX.Element> {

    let page = null;

    try {

        page = await getPageData('osteopathie');

    } catch (e) {

        return <ServerErrorPage />

    }

    if (page === null) notFound();

    const { content, images, title, images_number } = page;

    return (
        <div
            className="relative grid gap-2 grid-rows-[40vh_repeat(5,_30vh)_auto] grid-cols-2 md:grid-cols-3 md:grid-rows-[repeat(10,_10vh)] md:min-h-screen xl:grid-cols-5"
            data-menu-color="secondary"
        >
            <h1 className="absolute w-fit text-nowrap top-[40vh] md:top-1/2 xl:top-1/3 left-1/2 md:left-1/3 xl:left-[20%] -translate-x-1/2 -translate-y-1/2 text-4xl md:text-6xl xl:text-7xl bg-background text-foreground z-10 px-8 py-4">{title}</h1>
            {
                Array.from({ length: images_number }).map((_, index) => (
                    <div
                        key={index}
                        className={cn(
                            "relative",
                            imagesClassNames[index]?.container
                        )}>
                        <Image
                            src={images[index].src}
                            alt={images[index]?.alt ?? ''}
                            fill
                            placeholder="blur"
                            blurDataURL={images[index].blur_data_image}
                            sizes="(max-width: 576px) 100vw, 40vw"
                            className={cn(
                                "object-cover",
                                imagesClassNames[index]?.image
                            )}
                        />
                    </div>
                ))
            }
            <PageContent className="p-4 col-span-2 md:col-span-3 md:row-span-2 xl:col-span-2" content={content ?? ''} />
        </div>
    );
}