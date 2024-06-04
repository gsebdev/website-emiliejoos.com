'use client'
import Image from "next/image";
import Link from "next/link";
import { CircleUser, Menu } from "lucide-react"

import { Button } from "@/components/ui/button"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { usePathname } from "next/navigation.js";
import clsx from "clsx";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner"
import { store } from "@/store";
import { Provider, useDispatch, useSelector } from "react-redux";
import { getLoggedInUser, selectUser } from "@/lib/slices/userSlice";
import { useEffect } from "react";
import Gallery from "@/components/modules/gallery";
import { selectPartnersStatus, setPartnerResolvedAction } from "@/lib/slices/partnersSlice";
import { selectImagesStatus, setImageResolvedAction } from "@/lib/slices/imagesSlice";


const UserLabel = () => {
    const user = useSelector(selectUser);
    return (
        <span>{`${user?.firstname} ${user?.lastname}`}</span>
    )
}

const partnersNotifications = {
    add: 'Partenaire ajouté avec succès',
    update: 'Partenaire modifié avec succès',
    delete: 'Partenaire supprimé avec succès',
    error: (error: string | undefined) => error ? error : 'Une erreur est survenue',
}

const imagesNotifications = {
    add: 'Image ajoutée avec succès',
    delete: 'Image supprimée avec succès',
    error: (error: string | undefined) => error ? error : 'Une erreur est survenue',
}

const notificationsHandler = (actionState: string, resolvedAction: string | null, error: string | null, messages: any) => {
    if (actionState === 'idle' || actionState === 'loading') return;
    if (actionState === 'failed') {
        return {
            title: 'Erreur !',
            description: messages.error(error) as string,
            variant: 'destructive' as 'default' | 'destructive',
        };
    }
    if (actionState === 'succeeded') {
        return resolvedAction && messages[resolvedAction] ? {
            title: 'Succès !',
            description: messages[resolvedAction] as string,
            variant: 'default' as 'default' | 'destructive',
        }
            :
            null;
    }
}

const Notifications = () => {
    const dispatch = useDispatch();
    const partnersStatus = useSelector(selectPartnersStatus);
    const imagesStatus = useSelector(selectImagesStatus);


    /**
     * Partners Notifications
     */

    useEffect(() => {
        const { resolvedAction, error } = store.getState().partners;
        const toastObject = notificationsHandler(partnersStatus, (resolvedAction ?? null), (error ?? null), partnersNotifications);

        if (toastObject) {
            if(toastObject.variant === 'destructive') {
                toast.error(toastObject.title, {
                    description: toastObject.description
                });
            } else {
                toast(toastObject.title, {
                    description: toastObject.description
                });
            }
            dispatch(setPartnerResolvedAction(null));
        }
    }, [partnersStatus, dispatch]);

    /**
    * Images Notifications
    */

    useEffect(() => {
        const { resolvedAction, error } = store.getState().images;
        const toastObject = notificationsHandler(imagesStatus, (resolvedAction ?? null), (error ?? null), imagesNotifications);

        if (toastObject) {
            if(toastObject.variant === 'destructive') {
                toast.error(toastObject.title, {
                    description: toastObject.description
                });
            } else {
                toast(toastObject.title, {
                    description: toastObject.description
                });
            }
            dispatch(setImageResolvedAction(null));
        }
    }, [imagesStatus, dispatch]);

    /**
     * general error
     */

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


export default function BackendLayout({ children }: { children: React.ReactNode }) {
    const path = usePathname();

    useEffect(() => {
        store.dispatch(getLoggedInUser());
    }, []);

    return (
        <Provider store={store}>
            <Gallery />
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
                            <Link href="/backend/posts" className={path === "/backend/posts" ? "active" : ""}>Posts</Link>
                            <Link href="/backend/partners" className={path === "/backend/partners" ? "active" : ""}>Partenaires</Link>
                            <Link href="/backend/logs" className={path === "/backend/logs" ? "active" : ""}>Historique</Link>
                        </nav>
                        <div className="grid gap-6">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
            <Notifications />
        </Provider>
    );
}