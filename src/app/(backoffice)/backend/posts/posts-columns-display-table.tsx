import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/app/_components/ui/alert-dialog"
import { Button } from "@/app/_components/ui/button"
import { DragTableColumn } from "@/app/_components/ui/drag-table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/app/_components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import { removePost } from "../../_lib/slices/postsSlice"
import { AppDispatch } from "../../_lib/store"
import { useRouter } from "next/navigation"
import { selectImageById } from "../../_lib/slices/imagesSlice"
import { PostType } from "@/app/_types/definitions"
import Image from "next/image"


const Cover = ({ row }: { row: PostType }) => {
    const cover = useSelector(selectImageById(row.cover));

    return (
        <>
            {cover ?
                <Image
                    className="max-w-[100px] h-full object-contain rounded"
                    src={cover.src}
                    alt={cover.alt ?? ""}
                    sizes="(max-width: 576px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    placeholder="blur"
                    blurDataURL={process.env.IMAGE_BLUR_DATA}
                    height={cover.height}
                    width={cover.width}
                />
                :
                <span>{JSON.stringify(row.cover)}</span>
            }
        </>
    )
}

const Title = ({ row }: { row: any }) => {
    return <h3>{row.title}</h3>
}

const ContextMenu = ({ row }: { row: any }) => {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();

    return (
        <DropdownMenu>
            <AlertDialog>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Ouvrir le menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => router.push(`/backend/posts/${row.id}`)}>Modifier le post</DropdownMenuItem>
                    <DropdownMenuSeparator />


                    <AlertDialogTrigger asChild>
                        <DropdownMenuItem>Supprimer le post</DropdownMenuItem>
                    </AlertDialogTrigger>


                </DropdownMenuContent>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ce temoignage ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Cette action est définitive
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => dispatch(removePost({ id: row.id }))}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </DropdownMenu>
    )
}

export const postsColumns: DragTableColumn[] = [
    {
        id: "title",
        header: "Titre",
        cell: Title
    },
    {
        id: "cover",
        header: "Couverture",
        headerCellClassName: "text-center",
        cell: Cover
    },
    {
        id: "actions",
        cell: ContextMenu
    },
]