'use client'

import { cn } from "@/lib/utils"
import { X } from "lucide-react"
import React, { useContext, useState, createContext } from "react"
import AnimateWrapper from "./animate-wrapper"


interface BookingDialogProps {
    children: React.ReactNode
}

interface BookingDialogContextInterface {
    open: boolean
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const BookingDialogContext = createContext<BookingDialogContextInterface>({
    open: false,
    setOpen: () => { },
})

export function BookingDialog({ children }: BookingDialogProps) {
    const [open, setOpen] = useState(false)
    return (
        <BookingDialogContext.Provider value={{ open, setOpen }}>
            {children}
        </BookingDialogContext.Provider>
    )
}

export interface BookingDialogTriggerProps {
    className?: string
    children: React.ReactNode
    'aria-label'?: string
}

export const BookingDialogTrigger: React.FC<BookingDialogTriggerProps> = ({ className, children, ...props }) => {

    const { open, setOpen } = useContext<BookingDialogContextInterface>(BookingDialogContext)

    return (

        <button
            className={cn(
                className
            )}
            onClick={() => setOpen(true)}
            aria-label={props?.['aria-label'] || "Ouvrir la boite de dialogue pour prendre rendez-vous"}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls="booking-dialog"
        >
            {children}
        </button>

    )
}

export interface BookingDialogContentProps {
    children: React.ReactNode,
    className?: string,
    title?: string,
    showAnimationClassName?: string,
    hideAnimationClassName?: string,
    showAnimationDuration?: number,
    hideAnimationDuration?: number,
    overlay?: boolean,
    overlayClassName?: string
}

export const BookingDialogContent: React.FC<BookingDialogContentProps> = ({
    children,
    className,
    title,
    showAnimationClassName,
    hideAnimationClassName,
    showAnimationDuration,
    hideAnimationDuration,
    overlay,
    overlayClassName
}) => {

    const { open, setOpen } = useContext<BookingDialogContextInterface>(BookingDialogContext)

    return (
        <AnimateWrapper
            show={open}
            onMountAnimationName={showAnimationClassName}
            onUnmoutAnimationName={hideAnimationClassName}
            onMountDuration={showAnimationDuration}
            onUnmountDuration={hideAnimationDuration}
        >
            {
                overlay &&
                <div
                    onClick={() => setOpen(false)}
                    className={cn(
                        "fixed w-full h-full left-0 top-0 bg-black bg-opacity-50 z-40",
                        overlayClassName
                    )} />
            }
            <div
                id="booking-dialog"
                className={cn(
                    "fixed w-screen h-screen top-0 left-0 bg-background z-50 p-4 grid grid-rows-[auto_1fr]",
                    className
                )}
                aria-modal="true"
                role="dialog"
            >
                <div className="sticky top-0 left-0 w-full flex justify-between pb-4 z-10 bg-background">
                    <h2>{title}</h2>
                    <button
                        aria-label="Fermer la boite de dialogue"
                        aria-controls="booking-dialog"
                        onClick={() => setOpen(false)}>
                        <X className="size-8" />
                    </button>
                </div>
                <div className="overflow-y-auto h-full">
                    <iframe className="w-full min-h-[50vh]" src="https://emiliejoos.com/rdv" />
                </div>

            </div>
        </AnimateWrapper>
    )
}