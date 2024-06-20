"use client"

import { Button } from "@/app/_components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/app/_components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import React from "react"
import { AppDispatch } from "../../_lib/store"
import { useDispatch, useSelector } from "react-redux"
import { removePartner } from "@/app/(backoffice)/_lib/slices/partnersSlice"
import { selectImageById } from "@/app/(backoffice)/_lib/slices/imagesSlice"
import { setEditedPartner } from "@/app/(backoffice)/_lib/slices/userSlice"
import Image from "next/image"
import { DragTableColumn } from "@/app/_components/ui/drag-table"



/**
 * Renders a context menu row for a partner.
 *
 * @param {Object} row - The row object containing partner data.
 * @param {Object} row.original - The original partner object.
 * @return {JSX.Element} The rendered context menu row.
 */
const ContextMenuRow = ({ row }: { row: any }) => {
    const dispatch = useDispatch<AppDispatch>();

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
                <DropdownMenuItem onClick={() => dispatch(removePartner({ id: partner.id }))}>Supprimer le partenaire</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

const LogoCell = ({ row }: { row: { logo: { id?: number, url?: string } } }) => {
    const logoImage = useSelector(row.logo.id ? selectImageById(row.logo.id) : () => row.logo.url)

    return (
        <>
            {logoImage ?
                <>
                    {
                        typeof logoImage === "object" && !!logoImage.src && !!logoImage.height && !!logoImage.width &&
                        <Image
                            className="max-w-[100px] h-full object-contain rounded"
                            src={logoImage.src}
                            alt={logoImage?.alt ?? ""}
                            sizes="(max-width: 576px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            placeholder="blur"
                            blurDataURL={process.env.IMAGE_BLUR_DATA}
                            height={logoImage?.height}
                            width={logoImage?.width}
                        />
                    }
                    {
                        typeof logoImage === "string" &&
                        <img
                            src={logoImage}
                            className="max-w-[100px] h-full object-contain rounded"
                            alt=""
                        />
                    }
                </>

                :
                <span>{JSON.stringify(row.logo)}</span>
            }
        </>
    )
}

const DetailsCell = ({ row }: { row: any }) => {
    return (
        <div>
            <p className="font-bold">{row.title}</p>
            <p className="text-xs mb-2">{row.description}</p>
            <p className="text-xs text-foreground border-t pt-2">{row.url}</p>
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