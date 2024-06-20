import { useCallback, useEffect, useRef, useState } from "react";
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "./table";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Button } from "./button";
import { Grip } from "lucide-react";
import update from 'immutability-helper'
import type { Identifier, XYCoord } from 'dnd-core'
import type { FC } from 'react'



export interface DragTableColumn {
    id: string,
    accessorKey?: string,
    headerCellClassName?: string,
    cellClassName?: string,
    cell?: ({ row }: { row: any }) => JSX.Element
    header?: string
}

interface DragTableProps {
    rows: { [key: string]: any }[]
    columns: DragTableColumn[]
    caption?: string
    footer?: JSX.Element
    onReorder: (rows: any[]) => (void | Promise<any>),
    orderAccessorKey?: string,
    onRowDoubleClick?: (row: any) => void
}


interface CardProps {
    id: any
    columns: DragTableColumn[]
    row: { [key: string]: any }
    index: number
    moveRow: (dragIndex: number, hoverIndex: number) => void
    onDrop: (item?: any, monitor?: any) => (void | Promise<void>),
    onDoubleClick?: (row: any) => void
}

const Row: FC<CardProps> = ({ id, row, columns, index, moveRow, onDrop, onDoubleClick }) => {
    const [isMutating, setIsMutating] = useState<boolean>(false);
    const ref = useRef<HTMLTableRowElement>(null)

    const [{ handlerId }, drop] = useDrop<
        any,
        void,
        { handlerId: Identifier | null }
    >({
        accept: 'row',
        collect(monitor) {
            return {
                handlerId: monitor.getHandlerId(),
            }
        },
        hover(item: any, monitor) {
            if (!ref.current) {
                return
            }
            const dragIndex = item.index
            const hoverIndex = index

            // Don't replace items with themselves
            if (dragIndex === hoverIndex) {
                return
            }

            // Determine rectangle on screen
            const hoverBoundingRect = ref.current?.getBoundingClientRect()

            // Get vertical middle
            const hoverMiddleY =
                (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2

            // Determine mouse position
            const clientOffset = monitor.getClientOffset()

            // Get pixels to the top
            const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top

            // Only perform the move when the mouse has crossed half of the items height
            // When dragging downwards, only move when the cursor is below 50%
            // When dragging upwards, only move when the cursor is above 50%

            // Dragging downwards
            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
                return
            }

            // Dragging upwards
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
                return
            }

            // Time to actually perform the action
            moveRow(dragIndex, hoverIndex)

            // Note: we're mutating the monitor item here!
            // Generally it's better to avoid mutations,
            // but it's good here for the sake of performance
            // to avoid expensive index searches.
            item.index = hoverIndex
        },
        drop() {
            console.log("DROP" , isMutating)
            setIsMutating(true);

            ( async () => {
                await onDrop();
            })().then(() => {
                setIsMutating(false);
            }).catch(() => {
                setIsMutating(false);
            })
        },
    })

    const [{ isDragging }, drag] = useDrag({
        type: 'row',
        item: () => {
            return { id, index }
        },
        collect: (monitor: any) => ({
            isDragging: monitor.isDragging(),
        }),
    })

    const opacity = isDragging || isMutating ? 0 : 1

    drag(drop(ref))

    return (
        < TableRow ref={ref} data-handler-id={handlerId} style={{ opacity }} className={"cursor-move"} onDoubleClick={() => onDoubleClick?.(row)}>
            <TableCell >
                <Button variant={"ghost"} >
                    <Grip />
                </Button>
            </TableCell>
            {
                columns.map((column, index) => (
                    <TableCell key={'cell' + index} className={column.cellClassName}>{column.cell ? column.cell({ row }) : row?.[column.accessorKey ?? column.id]}</TableCell>
                ))
            }
        </TableRow >
    )
}

export default function DragTable({ rows, columns, caption, footer, onReorder, onRowDoubleClick, orderAccessorKey }: DragTableProps) {
    const [rowsData, setRowsData] = useState<any[]>(rows);

    useEffect(() => {
       setRowsData(rows)
    }, [rows]);

    const moveRow = useCallback((dragIndex: number, hoverIndex: number) => {
        setRowsData((prevCards: any[]) =>
            update(prevCards, {
                $splice: [
                    [dragIndex, 1],
                    [hoverIndex, 0, prevCards[dragIndex] as any],
                ],
            }),
        )
    }, [])

    const renderRow = useCallback(
        (row: any, index: number) => {
            return (
                <Row
                    key={row.id}
                    index={index}
                    id={row.id}
                    columns={columns}
                    row={row}
                    moveRow={moveRow}
                    onDrop={async () => await onReorder(rowsData)}
                    onDoubleClick={onRowDoubleClick}
                />
            )
        },
        [rowsData, onRowDoubleClick, onReorder, columns, moveRow],
    )

    return (
        <DndProvider
            backend={HTML5Backend}>
            <Table className="table-layout-auto w-full">
                <TableCaption>{caption}</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead></TableHead>
                        {columns.map((column, index) => (
                            <TableHead className={column.headerCellClassName} key={index}>{column?.header}</TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rowsData.map((row, index) => renderRow(row, index))}
                </TableBody>
                {
                    !!footer &&
                    <TableFooter>
                        {footer}
                    </TableFooter>
                }

            </Table>
        </DndProvider>
    )
}