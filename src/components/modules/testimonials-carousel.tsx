'use client'

import Image from "next/image";
import { Carousel, CarouselApi, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../ui/carousel";
import { ImageType } from "@/lib/definitions";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";

export default function TestimonialsCarousel({ testimonials }: { testimonials: ImageType[] }) {

    const [current, setCurrent] = useState(0);
    const [count, setCount] = useState(0);
    const [api, setApi] = useState<CarouselApi>();
    const autoplay = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!api) {
            return
        }

        setCount(api.scrollSnapList().length)
        setCurrent(api.selectedScrollSnap())

        autoplay.current = setInterval(() => {
            api.scrollNext()
        }, 3000)

        api.on("pointerDown", () => {
            autoplay.current && clearInterval(autoplay.current)
        })

        api.on("select", () => {
            setCurrent(api.selectedScrollSnap())
        })

        return () => {
            autoplay.current && clearInterval(autoplay.current)
        }
    }, [api])

    return (
        <Carousel
            setApi={setApi}
            opts={{
                loop: true
            }}
            className="grid w-full h-full grid-rows-[1fr_auto] max-w-screen-2xl"
        >
            <CarouselContent className="h-full md:gap-x-8 md:ml-0 justify-center">
                {
                    testimonials.map((image, index) => (
                        <CarouselItem key={index} className="w-full h-full aspect-square relative md:basis-1/2 lg:basis-1/3 md:pl-0">
                            <Image
                                src={image.src}
                                sizes="(max-width: 768px) 100vw, 50vw"
                                alt={image.alt ?? ''}
                                className="object-contain object-center"
                                fill
                            />
                        </CarouselItem>
                    )
                    )
                }
            </CarouselContent>
            <div className="py-8 flex gap-x-8 justify-center items-center">
                <CarouselPrevious className="static border-0 hover:bg-transparent translate-x-0 translate-y-0" onClick={() => {
                    api?.scrollPrev();
                    autoplay.current && clearInterval(autoplay.current)
                }} />
                <div className="flex gap-x-2 items-center justify-center">
                    {
                        Array.from({ length: count }).map((_, index) => (
                            <button
                                onClick={() => {
                                    autoplay.current && clearInterval(autoplay.current)
                                    api?.scrollTo(index)
                                }}
                                key={index}
                                className={clsx(
                                    "rounded-full transition-all duration-300",
                                    current === index ? "bg-primary w-3 h-3" : "bg-primary/30 w-2 h-2"
                                )}
                            />
                        ))
                    }
                </div>
                <CarouselNext className="static border-0 hover:bg-transparent translate-x-0 translate-y-0"
                    onClick={() => {
                        api?.scrollNext();
                        autoplay.current && clearInterval(autoplay.current)
                    }} />
            </div>

        </Carousel>
    );
}