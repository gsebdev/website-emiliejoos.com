'use client'
import { useGallery } from "@/components/modules/gallery";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DragTable, { DragTableColumn } from "@/components/ui/drag-table";
import { ImageType, TestimonialType } from "@/lib/definitions";
import { selectImageById } from "@/lib/slices/imagesSlice";
import { fetchTestimonials, removeTestimonial, selectAllTestimonials, selectTestimonialsStatus, setTestimonials } from "@/lib/slices/testimonialsSlice";
import { store } from "@/store";
import { Loader, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const Delete = ({ row }: { row: any }) => {
    const dispatch = useDispatch<typeof store.dispatch>();

    return (
        <div>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <button><Trash2 /><span className="sr-only">Supprimer le temoignage</span></button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ce temoignage ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Cette action est définitive
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => dispatch(removeTestimonial({ id: row.id }))}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

        </div>
    )
}
const ImageCell = ({ row }: { row: { image: number } }) => {
    const image: ImageType = useSelector(selectImageById(row.image))

    return (
        <>
            {image &&
                <Image
                    className="max-w-[100px] md:max-w-[200px] lg:max-w-[300px] h-full object-contain rounded"
                    src={image.src}
                    alt={image?.alt ?? ""}
                    sizes="(max-width: 576px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    placeholder="blur"
                    blurDataURL={process.env.IMAGE_BLUR_DATA}
                    height={image?.height}
                    width={image?.width}
                />
            }
        </>
    )
}

export const testimonialsColumns: DragTableColumn[] = [
    {
        id: "image",
        header: "Bribe",
        headerCellClassName: "text-center",
        cell: ImageCell
    },
    {
        id: "delete",
        cell: Delete
    },
]

export default function Testimonials() {

    const dispatch = useDispatch<typeof store.dispatch>();
    const testimonials = useSelector(selectAllTestimonials);
    const testimonialsStatus = useSelector(selectTestimonialsStatus);

    useEffect(() => {
        if (testimonialsStatus === 'idle') {
            dispatch(fetchTestimonials());
        }
    }, [])

    const { setGalleryOpen } = useGallery();

    const onReorder = (newTestimonials: TestimonialType[]) => {
        dispatch(setTestimonials({ testimonials: newTestimonials, notification: false }));
    }

    const handleAddTestimonial = () => {
        setGalleryOpen({
            selection: [],
            onValidateSelection: (selected) => {
                if (!selected?.[0]?.id) return;

                dispatch(setTestimonials({
                    testimonials: { id: Math.random().toString(15).slice(4, 9), image: selected[0].id }
                }));
            },
        })
    }

    return (
        <Card className="overflow-x-auto">
            <CardHeader className="flex-row justify-between flex-wrap">
                <CardTitle>Témoignages</CardTitle>
                <Button onClick={handleAddTestimonial}><Plus className="mr-2" /> Ajouter</Button>
            </CardHeader>
            <CardContent>
                {!testimonials && ['loading', 'idle'].includes(testimonialsStatus) && <div className="flex justify-center items-center h-96"><Loader /></div>}
                {!!testimonials && testimonials.length > 0 &&
                    <DragTable
                        columns={testimonialsColumns}
                        rows={testimonials}
                        onReorder={onReorder}
                    />
                }
            </CardContent>
        </Card>
    )
}