import { ImageType } from "@/app/_types/definitions";
import { fetchImages, removeImage, selectAllImages, selectImagesStatus, setImage, setImageAlt } from "@/app/(backoffice)/_lib/slices/imagesSlice";
import { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import Gallery from "./gallery";
import { AppDispatch } from "../_lib/store";


export const BackendGallery = ({ children }: { children: React.ReactNode }) => {
    
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

    const dispatch = useDispatch<AppDispatch>();
    
    const images = useSelector(selectAllImages);
    const imagesStatus = useSelector(selectImagesStatus);

    
    useEffect(() => {
        if (imagesStatus === 'idle') {
            dispatch(fetchImages());
        }
    }, [imagesStatus, dispatch]);



    const handleImageUpload = useCallback((imageFiles: File[]) => {
        if (imageFiles && imageFiles.length > 0) {
            imageFiles.forEach((imageFile) => {
                dispatch(setImage(imageFile))
            });
        }
    }, [dispatch]);




    const handleAltChange = useCallback((image: ImageType) => {
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }
        debounceTimeout.current = setTimeout(() => {
            dispatch(setImageAlt(image));
            debounceTimeout.current = null;
        }, 400);
    }, [dispatch]);

    
    
    const handleRemoveImage = useCallback((image: ImageType) => {
        if (image.id) {
            dispatch(removeImage(image.id));
        }

    }, [dispatch]);


    return (

        <Gallery
            onUpload={handleImageUpload}
            onModifyImage={handleAltChange}
            onDeleteImage={handleRemoveImage}
            images={images}
            isLoading={imagesStatus === 'idle' || (imagesStatus === 'loading' && images.length === 0)}
        >
            {children}
        </Gallery>

    )
}