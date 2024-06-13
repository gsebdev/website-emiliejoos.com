'use client'
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, CircleUser, Menu, StickyNote } from "lucide-react";
import './backoffice.css'

import { Button } from "@/components/ui/button"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { usePathname } from "next/navigation.js";
import clsx from "clsx";
import { Toaster } from "@/components/ui/sonner";
import { store } from "@/store";
import { Provider, useDispatch, useSelector } from "react-redux";
import { getLoggedInUser, selectUser } from "@/lib/slices/userSlice";
import { useCallback, useEffect, useState } from "react";
import Gallery from "@/components/modules/gallery";
import { fetchPartners } from "@/lib/slices/partnersSlice";
import { fetchPages } from "@/lib/slices/pagesSlice";
import { fetchImages, removeImage, selectAllImages, selectImagesStatus, setImage, setImageAlt, setImageSaving } from "@/lib/slices/imagesSlice";
import { ImageType } from "@/lib/definitions";

let debounceTimeout: NodeJS.Timeout | null = null;

const UserLabel = () => {
    const user = useSelector(selectUser);
    return (
        <span>{`${user?.firstname} ${user?.lastname}`}</span>
    )
}

const Notifications = () => {
    return (
        <Toaster
            toastOptions={{
                classNames: {
                    error: 'text-white bg-red-500 border-red-500',
                }
            }}
        />
    )
}

const BackendGallery = ({ children }: { children: React.ReactNode }) => {
    const dispatch = useDispatch<typeof store.dispatch>();
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
        dispatch(setImageSaving({ id: image.id, isSaving: true }));
        if (debounceTimeout) {
            clearTimeout(debounceTimeout);
        }
        debounceTimeout = setTimeout(() => {
            dispatch(setImageAlt(image));
            debounceTimeout = null;
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


export default function BackendLayout({ children }: { children: React.ReactNode }) {
    const path = usePathname();


    useEffect(() => {
        store.dispatch(getLoggedInUser());
    }, []);

    return (
        <Provider store={store}>
            <div className="flex min-h-screen w-full flex-col">
                <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
                    <Image src="/logo/logo-h-black.webp" alt="logo" width={256} height={80} className="h-[80px]" />
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="shrink-0 md:hidden"
                            >
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle navigation menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left">
                            <nav className="grid gap-6 text-lg font-medium">
                                <Link href="/">Accueil du site</Link>
                                <Collapsible open={path === "/backend/pages" ? true : undefined}>
                                    <CollapsibleTrigger className={path === "/backend/pages" ? "active" : ""}>Pages<ChevronDown className="ml-2" /></CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <Link href="/backend/pages/about" className={path === "/backend/pages/about" ? "active" : ""}>A propos</Link>
                                    </CollapsibleContent>
                                </Collapsible>
                                <Link href="/backend/posts" className={path === "/backend/posts" ? "active" : ""}>Posts</Link>
                                <Link
                                    href="/backend/partners"
                                    className={clsx(
                                        "text-muted-foreground hover:text-foreground",
                                        path === "/backend/partners" && "active"
                                    )}
                                >
                                    Partenaires
                                </Link>
                                <Link
                                    href="/backend/logs"
                                    className={clsx(
                                        "text-muted-foreground hover:text-foreground",
                                        path === "/backend/logs" && "active"
                                    )}
                                >
                                    Historique
                                </Link>
                            </nav>
                        </SheetContent>
                    </Sheet>
                    <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4 justify-end">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="secondary" size="icon" className="rounded-full">
                                    <CircleUser className="h-5 w-5" />
                                    <span className="sr-only">Toggle user menu</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>
                                    <UserLabel />
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>Options</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem><Link href="/logout">Déconexion</Link></DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>
                <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
                    <div className="mx-auto grid w-full max-w-6xl gap-2">
                        <h1 className="text-3xl font-semibold"></h1>
                    </div>
                    <div className="mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
                        <nav
                            className="grid gap-4 text-sm text-muted-foreground"
                        >
                            <Link href="/">Accueil du site</Link>
                            <Collapsible open={path === "/backend/pages" ? true : undefined} className="space-y-2">
                                <CollapsibleTrigger className={path === "/backend/pages" ? "active" : ""}>Pages<ChevronDown className="ml-2 inline" /></CollapsibleTrigger>
                                <CollapsibleContent className="pl-4">
                                    <Link
                                        href="/backend/pages/about"
                                        className={path === "/backend/pages/about" ? "active" : ""}
                                        onMouseOver={() => {
                                            if (!store.getState().pages.items.about) {
                                                store.dispatch(fetchPages('about'))
                                            }
                                        }}
                                    ><StickyNote className="h-4 w-4 inline" /> A propos</Link>
                                </CollapsibleContent>
                            </Collapsible>
                            <Link href="/backend/posts" className={path === "/backend/posts" ? "active" : ""}>Posts</Link>
                            <Link
                                href="/backend/partners"
                                className={path === "/backend/partners" ? "active" : ""}
                                onMouseOver={() => {
                                    if (store.getState().partners.status === 'idle') {
                                        store.dispatch(fetchPartners())
                                    }
                                }}
                            >Partenaires</Link>
                            <Link href="/backend/logs" className={path === "/backend/logs" ? "active" : ""}>Historique</Link>
                        </nav>
                        <BackendGallery>
                            <div className="grid gap-6">
                                {children}
                            </div>
                        </BackendGallery >
                    </div>
                </main>
            </div >
            <Notifications />

        </Provider >
    );
}