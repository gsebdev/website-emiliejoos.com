import { fetchImages, removeImage, selectAllImages, selectImagesStatus, setImage, setImageAlt } from "@/lib/slices/imagesSlice"
import { addSelectedImages, openGallery, removeSelectedImages, selectGalleryOpen, selectSelectedImagesIndex, setSelectedImagesIndex } from "@/lib/slices/userSlice";
import { store } from "@/store";
import Image from "next/image";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux"
import { Dialog, DialogContent, DialogFooter } from "../ui/dialog";
import ImageInput from "../ui/image-input";
import { CircleX } from "lucide-react";
import clsx from "clsx";

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { ImageType } from "@/lib/definitions";
import { Button } from "../ui/button";

let debounceTimeout: NodeJS.Timeout | null = null;

export default function Gallery() {
    const selectedImagesIndex = useSelector(selectSelectedImagesIndex);
    const images = useSelector(selectAllImages);
    const imagesStatus = useSelector(selectImagesStatus);
    const dispatch = useDispatch<typeof store.dispatch>();
    const galleryOpen = useSelector(selectGalleryOpen);

    useEffect(() => {
        if (imagesStatus === 'idle') {
            dispatch(fetchImages());
        }
    }, [imagesStatus, dispatch]);

    const handleAltChange = (image: ImageType, value: string) => {
        if (debounceTimeout) {
            clearTimeout(debounceTimeout);
        }
        debounceTimeout = setTimeout(() => {
            dispatch(setImageAlt({ ...image, alt: value }));
            debounceTimeout = null;
        }, 700);
    }

    const handleImageUpload = (imageFiles: File[]) => {
        if (imageFiles && imageFiles.length > 0) {
            imageFiles.forEach((imageFile) => {
                dispatch(setImage(imageFile))
            });
        }
    }

    const handleImageClick = (e: React.MouseEvent, imageIndex: number) => {
        console.log('click', imageIndex)
        if (e.shiftKey) {
            if (selectedImagesIndex.length === 0) return dispatch(setSelectedImagesIndex([imageIndex]));
            const lowestIndex = Math.min(...selectedImagesIndex);
            if (selectedImagesIndex.includes(imageIndex)) {
                dispatch(removeSelectedImages(Array.from({ length: imageIndex - lowestIndex }, (_, i) => lowestIndex + i)));
            } else {
                const highestIndex = Math.max(...selectedImagesIndex);
                const refIndex = highestIndex > imageIndex ? highestIndex : lowestIndex;
                const length = Math.abs(imageIndex - refIndex) + 1;
                dispatch(setSelectedImagesIndex(Array.from({ length: length }, (_, i) => Math.min(refIndex, imageIndex) + i)));
            }

        } else if (e.ctrlKey) {
            if (selectedImagesIndex.includes(imageIndex)) {
                dispatch(removeSelectedImages([imageIndex]));
            } else {
                dispatch(addSelectedImages([imageIndex]));
            }
        } else {
            if(selectedImagesIndex.length === 1 && selectedImagesIndex[0] === imageIndex) {
                dispatch(setSelectedImagesIndex([]));
            } else {
               dispatch(setSelectedImagesIndex([imageIndex])); 
            }   
        }
    }

    return (
        <Dialog open={galleryOpen} onOpenChange={(open) => { dispatch(openGallery(open)) }}>
            <DialogContent className="max-w-6xl sm:w-[90%] sm:h-[90vh] h-full w-full overflow-hidden p-0">
                <div className="absolute overflow-y-auto p-8 mt-8 bottom-0" style={{ height: 'calc(100% - 3rem)' }}>
                    <h2 className="text-2xl font-bold text-primary mb-6">Gallery</h2>

                    <div className="mb-4 px-1">
                        <ImageInput className="grow mt-auto w-full" onChange={handleImageUpload} fileTypes={["jpg", "jpeg", "png", "svg", "webp"]} maxSize={5 * 1024 * 1024} multipleSelect />
                    </div>

                    <div className={"flex flex-wrap gap-4 transition-opacity"}>
                        {
                            !!images && images.map((image, index) => {
                                return image.tempId ?
                                    <div className="group relative pt-5 pr-5" key={image.filename + index}>
                                        <div className="z-2 mb-2">
                                            <button className="bg-primary text-primary-foreground rounded-md px-2">Chargement...</button>
                                        </div>
                                        <div className="relative">
                                            <div className="absolute opacity-50 w-full h-full origin-top bg-white top-0 transition-transform duration-300" style={{ transform: `scaleY(${Math.round(100 - (image.uploadProgress ?? 0))}%)` }}></div>
                                            <Image
                                                src={image.src}
                                                width={0}
                                                height={0}
                                                loader={() => image.src}
                                                alt={image.alt ?? ''}
                                                className={clsx("h-48 w-auto block object-contain rounded-md border-transparent border-2")}
                                            />
                                        </div>

                                    </div>
                                    :
                                    <div className="group relative pt-5 pr-5" key={image.filename + index}>
                                        <Popover>
                                            <div className="invisible z-2 group-hover:visible flex gap-6 justify-between mb-2">
                                                <PopoverTrigger asChild><button className="bg-primary text-primary-foreground rounded-md px-2">Détails</button></PopoverTrigger>
                                                <button onClick={() => { if (image.id) dispatch(removeImage(image.id)) }}><CircleX className="h-5 w-5" /></button>
                                            </div>
                                            <PopoverContent className="w-96 max-w-full">
                                                <p className="font-bold">Texte alternatif</p>
                                                <textarea onChange={(e) => { handleAltChange(image, e.target.value) }} className="w-full border border-muted-foreground rounded-md p-2" rows={5} defaultValue={image.alt} />
                                                <p className="text-xs flex justify-between"><span>Largeur : {image.width}px, Hauteur : {image.height}px</span> <span>{imagesStatus === 'altPending' ? 'Enregistrement...' : 'Enregistré'}</span></p>

                                            </PopoverContent>
                                        </Popover>
                                        <Image
                                            src={image.src}
                                            alt={image.alt ?? ''}
                                            height={image.height}
                                            width={image.width}
                                            placeholder="blur"
                                            blurDataURL={process.env.IMAGE_BLUR_DATA}
                                            sizes="(max-width: 576px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                            className={clsx(
                                                "h-48 w-auto block cursor-pointer object-contain rounded-md border-2 transition-all",
                                                selectedImagesIndex.includes(index) ? "border-cyan-600 p-1" : "border-transparent hover:border-cyan-200"
                                            )}
                                            onClick={(e) => handleImageClick(e, index)}
                                            onDoubleClick={() => {
                                                dispatch(setSelectedImagesIndex([index]));
                                                dispatch(openGallery(false))
                                            }}
                                        />
                                    </div>
                            }
                            )
                        }
                    </div>
                </div>
                {selectedImagesIndex.length > 0 &&
                    <Button
                        onClick={() => { dispatch(openGallery(false)) }}
                        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-cyan-600"
                    >
                        Valider la sélection
                    </Button>
                }
            </DialogContent>
        </Dialog>

    )
}