
import Image from "next/image";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent } from "../ui/dialog";
import ImageInput from "../ui/image-input";
import { Check, TriangleAlert } from "lucide-react";
import clsx from "clsx";
import { ImageType } from "@/lib/definitions";
import { Button } from "../ui/button";
import { AlertDialog } from "@radix-ui/react-alert-dialog";
import { AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { Skeleton } from "../ui/skeleton";

type ImageElementDisplayProps = {
    image: ImageType,
    index: number,
    setEditedImage?: () => void,
    isSaving?: boolean,
    onModifyImage: (image: ImageType) => void,
    onClick?: (e?: React.MouseEvent) => void,
    onDoubleClick?: (e?: React.MouseEvent) => void,
    isSelected?: boolean,
    onDeleteImage?: (image: ImageType) => void,
    isEdited?: boolean
}


type GalleryProps = {
    images: ImageType[],
    isLoading: boolean,
    onUpload: (imageFiles: File[]) => void,
    onModifyImage: (image: ImageType) => void,
    onDeleteImage: (image: ImageType) => void,
    children?: React.ReactNode,
    onClose?: (selected?: ImageType[]) => void,
    onOpen?: () => void
}

type GalleryContextType = {
    isOpen: boolean;
    selectedImagesIndex: number[];
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setSelectedImagesIndex: React.Dispatch<React.SetStateAction<number[]>>;
    onClose?: (selected?: ImageType[]) => void;
    onValidateSelection?: (selected: ImageType[]) => void;
    setOnValidateSelection: React.Dispatch<React.SetStateAction<((selected: ImageType[]) => void) | undefined>>;
    setOnClose: React.Dispatch<React.SetStateAction<((selected?: ImageType[]) => void) | undefined>>;
    setSelectedImagesIds?: (selectedImagesIds: (number | string)[]) => void;
    getSelectedImages?: () => ImageType[],
    multipleSelect?: boolean,
    setMultipleSelect?: React.Dispatch<React.SetStateAction<boolean>>
};

type GalleryContentProps = {
    images: ImageType[],
    isLoading: boolean,
    onUpload: (imageFiles: File[]) => void,
    onDeleteImage: (image: ImageType) => void,
    onModifyImage: (image: ImageType) => void,
    children?: React.ReactNode
}

const GalleryContext = createContext<GalleryContextType | undefined>(undefined);



const ImageElementDisplay = ({ image, setEditedImage, onModifyImage, onDeleteImage, onClick, onDoubleClick, isSelected, isEdited }: ImageElementDisplayProps) => {

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (isEdited && textareaRef.current) {
            textareaRef.current.focus();
            const handleOutsideClick = (e: MouseEvent) => {
                if (textareaRef.current && !textareaRef.current.contains(e.target as Node)) {
                    setEditedImage?.();
                }
            }
            document.addEventListener('click', handleOutsideClick);

            return () => {
                document.removeEventListener('click', handleOutsideClick);
            }
        }
    }, [isEdited, setEditedImage]);


    const isTempImg = useMemo(() => !!image.tempId && !image.id, [image.id, image.tempId]);

    return (
        <div>
            <div className="flex flex-col md:flex-row gap-2">
                <div className="relative">
                    {
                        isTempImg &&
                        <div
                            className="absolute opacity-50 w-full h-full origin-top bg-white top-0 transition-transform duration-300"
                            style={{ transform: `scaleY(${Math.round(100 - (image.uploadProgress ?? 0))}%)` }}
                        />

                    }
                    <Image
                        src={image.src}
                        alt={image.alt ?? ''}
                        height={image.height ?? 0}
                        width={image.width ?? 0}
                        placeholder="blur"
                        loader={isTempImg ? () => image.src : undefined}
                        blurDataURL={process.env.IMAGE_BLUR_DATA}
                        sizes="(max-width: 576px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className={clsx(
                            "h-48 w-fit block cursor-pointer object-contain rounded-md border-2 transition-all p-1",
                            isSelected ? "border-cyan-600" : "border-transparent hover:border-cyan-200"
                        )}
                        onClick={onClick}
                        onDoubleClick={onDoubleClick}
                    />
                </div>

                <div className="w-full md:w-48">

                    <p className="font-bold text-xs uppercase">Description</p>
                    {
                        isEdited ?
                            <div className="relative">
                                <textarea
                                    ref={textareaRef}
                                    onChange={(e) => { onModifyImage({ ...image, alt: e.target.value }) }}
                                    className="w-full border border-muted-foreground rounded-md p-2 text-xs"
                                    rows={4}
                                    defaultValue={image.alt}
                                />
                                <p className="text-xs absolute bottom-2 right-2 bg-white px-2 text-muted-foreground">
                                    {
                                        image.isSaving ?
                                            <span><TriangleAlert className="h-4 w-4" /></span> :
                                            <span><Check className="h-4 w-4 inline" />Enregistré</span>
                                    }
                                </p>
                            </div> :
                            <p
                                className="text-xs mb-4 mt-1 break-all"
                                onDoubleClick={setEditedImage}
                            >
                                {image.alt}
                            </p>
                    }
                    {
                        !isTempImg &&
                        <>
                            <p className="text-xs">Largeur : {image.width}px</p>
                            <p className="text-xs">Hauteur : {image.height}px</p>
                        </>
                    }

                    {
                        !isTempImg && setEditedImage &&
                        <button
                            className="text-xs bg-primary block text-primary-foreground rounded-md px-2 mt-2"
                            onClick={(e) => { 
                                e.stopPropagation(); 
                                setEditedImage(); 
                            }}
                        >
                            {!!isEdited ? 'Fermer' : 'Modifier'}
                        </button>
                    }
                    {
                        isTempImg &&
                        <p className="text-xs bg-primary block text-primary-foreground rounded-md px-2 mt-2">Chargement...</p>
                    }

                    {
                        !isTempImg &&
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <button className="text-xs px-2 rounded-md bg-red-600 text-primary-foreground">Supprimer</button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Êtes vous sûr ?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        {'Ceci est irréversible. Cela supprimera définitivement l\'image sur le serveur.'}
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => onDeleteImage && onDeleteImage(image)}>Supprimer</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    }

                </div>
            </div>
        </div>
    )
}



export const useGallery = () => {
    const context = useContext(GalleryContext);
    const {
        setOpen,
        setOnValidateSelection,
        setOnClose,
        setSelectedImagesIds,
        setMultipleSelect,
    } = context ?? {}

    const setGalleryOpen = useCallback(({ 
        selection, 
        onValidateSelection, 
        onClose, 
        multipleSelect 
    }: {
        selection: (number | string)[],
        onValidateSelection?: ((selected: ImageType[]) => void),
        onClose?: ((selected?: ImageType[]) => void),
        multipleSelect?: boolean
    }) => {

        setSelectedImagesIds?.(selection);
        setOpen?.(true);
        setOnValidateSelection?.(() => onValidateSelection);
        setOnClose?.(() => onClose);
        setMultipleSelect?.(multipleSelect ?? false);

    }, [setOnValidateSelection, setSelectedImagesIds, setOpen, setOnClose, setMultipleSelect]);

    return {
        setGalleryOpen
    };
};

const GalleryContent = ({
    images,
    isLoading,
    onUpload,
    onDeleteImage,
    onModifyImage
}: GalleryContentProps) => {
    const context = useContext(GalleryContext);
    const {
        isOpen,
        selectedImagesIndex,
        setSelectedImagesIndex,
        onClose,
        onValidateSelection,
        setOpen,
        getSelectedImages,
        multipleSelect
    } = context ?? {
        isOpen: false,
        selectedImagesIndex: [] as number[],
    };

    const [editedImage, setEditedImage] = useState<string | number | undefined>(undefined);

    const handleOpenChange = useCallback((open: boolean) => {
        if (!open) {
            setOpen && setOpen(false);
            onClose && onClose();
        } else {
            setOpen && setOpen(true);
        }
    }, [onClose, setOpen]);

    const handleImageClick = useMemo(() => !!setSelectedImagesIndex ?
        (e: React.MouseEvent | undefined, imageIndex: number) => {
            
            if (!e) return;

            if(!multipleSelect) return setSelectedImagesIndex([imageIndex]);

            const removeSelectedImages = (indexesToRemove: number[]) => {
                setSelectedImagesIndex(selectedImagesIndex?.filter((index) => !indexesToRemove.includes(index)));
            };

            const addSelectedImages = (indexesToAdd: number[]) => {
                setSelectedImagesIndex([...selectedImagesIndex, ...indexesToAdd]);
            };

            if (e.shiftKey) {
                // shift + click but no images already selected
                if (selectedImagesIndex.length === 0) return setSelectedImagesIndex([imageIndex]);


                const lowestIndex = Math.min(...selectedImagesIndex);

                // shift + click and images already selected and click on a selected image
                if (selectedImagesIndex.includes(imageIndex)) {
                    removeSelectedImages(Array.from({ length: imageIndex - lowestIndex }, (_, i) => lowestIndex + i));

                    // shift + click and images already selected and click on an unselected image
                } else {
                    const highestIndex = Math.max(...selectedImagesIndex);
                    const refIndex = highestIndex > imageIndex ? highestIndex : lowestIndex;
                    const length = Math.abs(imageIndex - refIndex) + 1;
                    setSelectedImagesIndex(Array.from({ length: length }, (_, i) => Math.min(refIndex, imageIndex) + i));
                }

            } else if (e.ctrlKey) {
                // ctrl + click on a selected image
                if (selectedImagesIndex.includes(imageIndex)) {
                    removeSelectedImages([imageIndex]);

                    // ctrl + click on an unselected image
                } else {
                    addSelectedImages([imageIndex]);
                }

            } else {
                // click on a unique selected image
                if (selectedImagesIndex.length === 1 && selectedImagesIndex[0] === imageIndex) {
                    setSelectedImagesIndex([]);

                    // click on an unselected image or a multiple selected image
                } else {
                    setSelectedImagesIndex([imageIndex]);
                }
            }
        } :
        undefined,
        [setSelectedImagesIndex, selectedImagesIndex, multipleSelect]);

    const handleImageDoucleClick = useCallback((e: React.MouseEvent | undefined, image: ImageType) => {
        setOpen?.(false);
        onValidateSelection?.([image]);
    }, [onValidateSelection, setOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-6xl sm:w-[90%] sm:h-[90vh] h-full w-full overflow-hidden p-0">
                <div className="absolute overflow-y-auto p-8 mt-8 bottom-0" style={{ height: 'calc(100% - 3rem)' }}>
                    <h2 className="text-2xl font-bold text-primary mb-6">Gallery</h2>

                    <div className="mb-4 px-1">
                        <ImageInput className="grow mt-auto w-full" onChange={onUpload} fileTypes={["jpg", "jpeg", "png", "svg", "webp"]} maxSize={5 * 1024 * 1024} multipleSelect />
                    </div>

                    <div className={"grid grid-cols-2 md:flex md:flex-wrap gap-4 transition-opacity"}>
                        {
                            isLoading &&
                            Array.from({ length: 4 }, (_, i) => i).map((_, index) =>
                                <Skeleton key={index} className="h-48 w-[250px] rounded-md" />
                            )
                        }
                        {
                            !!(images && !isLoading) &&
                            images.map((image: ImageType, index) =>
                                <ImageElementDisplay
                                    key={image.id ?? image.tempId}
                                    image={image}
                                    index={index}
                                    onClick={(e) => handleImageClick && handleImageClick(e, index)}
                                    onDoubleClick={(e) => handleImageDoucleClick(e, image)}
                                    onModifyImage={onModifyImage}
                                    onDeleteImage={onDeleteImage}
                                    setEditedImage={() => {
                                        if (editedImage && editedImage === image.id) return setEditedImage(undefined);
                                        setEditedImage(image.id);

                                    }}
                                    isSelected={selectedImagesIndex.includes(index)}
                                    isEdited={!!editedImage && editedImage === image.id}
                                />
                            )
                        }
                        {images.length === 0 && !isLoading &&
                            <p className="flex align-center justify-center h-48 text-foreground text-lg">Aucune image trouvée...</p>
                        }
                    </div>
                </div>
                {selectedImagesIndex && selectedImagesIndex.length > 0 &&
                    <Button
                        onClick={() => {
                            const selectedImages = getSelectedImages && getSelectedImages();
                            onValidateSelection && onValidateSelection(selectedImages ?? []);
                            setOpen && setOpen(false)
                        }}
                        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-cyan-600"
                    >
                        Valider la sélection
                    </Button>
                }
            </DialogContent>
        </Dialog>
    );
};

export default function Gallery({
    images,
    isLoading,
    onUpload,
    onModifyImage,
    onDeleteImage,
    children,
    onClose: onCloseCallback,
    onOpen
}: GalleryProps) {

    const [isOpen, setOpen] = useState(false);
    const [selectedImagesIndex, setSelectedImagesIndex] = useState<number[]>([]);
    const [onClose, setOnClose] = useState<((selected?: ImageType[]) => void) | undefined>(undefined);
    const [onValidateSelection, setOnValidateSelection] = useState<((selected: ImageType[]) => void) | undefined>(undefined);
    const [ multipleSelect, setMultipleSelect ] = useState<boolean>(false);

    const getSelectedImages = useCallback(() => {
        return selectedImagesIndex.map(index => images[index]);
    }, [images, selectedImagesIndex]);


    const setSelectedImagesIds = useCallback((selectedImagesIds: (number | string)[]) => {
        const indexesArray = selectedImagesIds.map(id => images.findIndex(image => image.id === id));
        setSelectedImagesIndex(indexesArray);
    }, [images]);


    useEffect(() => {
        if (!isOpen && onCloseCallback) {
            const selected = getSelectedImages();
            onCloseCallback(selected);
        }
        if (isOpen && onOpen) onOpen();

    }, [onCloseCallback, isOpen, onOpen, getSelectedImages]);

    return (
        <GalleryContext.Provider value={{
            isOpen,
            selectedImagesIndex,
            setSelectedImagesIndex,
            setOpen,
            setOnValidateSelection,
            setOnClose,
            onClose,
            onValidateSelection,
            setSelectedImagesIds,
            getSelectedImages,
            multipleSelect,
            setMultipleSelect
        }}>
            <GalleryContent
                images={images}
                isLoading={isLoading}
                onUpload={onUpload}
                onModifyImage={onModifyImage}
                onDeleteImage={onDeleteImage}
            />
            {children}
        </GalleryContext.Provider>
    )
}