"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import React from "react"
import { store } from "@/store"
import { useDispatch, useSelector } from "react-redux"
import { removePartner } from "@/lib/slices/partnersSlice"
import { selectImageById } from "@/lib/slices/imagesSlice"
import { setEditedPartner, setViewedPartner } from "@/lib/slices/userSlice"
import Image from "next/image"
import { DragTableColumn } from "@/components/ui/drag-table"



/**
 * Renders a context menu row for a partner.
 *
 * @param {Object} row - The row object containing partner data.
 * @param {Object} row.original - The original partner object.
 * @return {JSX.Element} The rendered context menu row.
 */
const ContextMenuRow = ({ row }: { row: any }) => {
    const dispatch = useDispatch<typeof store.dispatch>();

    const partner = row;
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Ouvrir le menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => dispatch(setEditedPartner(partner.id))}> Modifier le partenaire</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => dispatch(removePartner(partner.id))}>Supprimer le partenaire</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

const LogoCell = ({ row }: { row: any }) => {
    const logoImage = useSelector(selectImageById(Number(row.logo)))

    return (
        <>
            {logoImage ?
                <Image
                    className="max-w-[100px] h-full object-contain rounded"
                    src={logoImage.src}
                    alt={logoImage.alt}
                    sizes="(max-width: 576px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    placeholder="blur"
                    blurDataURL={process.env.IMAGE_BLUR_DATA}
                    height={logoImage.height}
                    width={logoImage.width}
                />
                :
                <span>{row.logo}</span>
            }
        </>
    )
}

const DetailsCell = ({ row }: { row: any }) => {
    return (
        <div>
            <p className="font-bold text-lg">{row.title}</p>
            <p className="text-xs font-bold underline text-foreground">{row.url}</p>
            <p className="text-xs text-foreground mt-2">{row.description}</p>
        </div>
    )
}

export const partnersColumns: DragTableColumn[] = [
    {
        id: "details",
        header: "Details",
        cell: DetailsCell
    },
    {
        id: "logo",
        header: "Logo",
        headerCellClassName: "text-center",
        cell: LogoCell
    },
    {
        id: "actions",
        cell: ContextMenuRow
    },
]