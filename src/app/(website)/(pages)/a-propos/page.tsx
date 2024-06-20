import Image from "next/image";
import { notFound } from "next/navigation";
import { getPageData } from "@/app/_lib/db";
import { ServerErrorPage } from "../../_components/server-error-page";
import PageContent from "../../_components/page-content";
import { cn } from "@/app/_lib/client-utils";;


const imagesClassNames: Record<number, { container: string, image: string }> = {
    0: { container: 'h-[65vh] md:h-[75vh] w-full md:basis-1/3 md:grow xl:h-full xl:order-2 xl:shrink xl:grow-0', image: 'object-top sm:object-center' },
    1: { container: ' h-[35vh] w-full md:basis-1/3 md:h-[75vh] xl:h-full xl:order-3 xl:shrink', image: 'object-center' },
}

export default async function AProposPage(): Promise<JSX.Element> {

    let page = null;

    try {

        page = await getPageData('a-propos');

    } catch (e) {

        return <ServerErrorPage />

    }

    if (page === null) notFound();

    const { content, images, title, images_number } = page;

    return (
        <div
            className="relative flex flex-col md:flex-row md:flex-wrap xl:flex-nowrap md:gap-x-4 items-center gap-y-4 h-full xl:h-screen"
            data-menu-color="primary"
        >
            <h1 className="absolute w-fit text-nowrap top-[64vh] md:top-1/2 left-1/2 md:left-2/3 -translate-x-1/2 -translate-y-1/2  text-4xl md:text-6xl xl:text-7xl bg-background text-accent z-10 px-8 py-4">{title}</h1>
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
            <PageContent className="p-4 self-start md:basis-full xl:basis-1/3 xl:order-1 xl:pl-8 xl:my-24" content={content ?? ''} />
        </div>
    );
}