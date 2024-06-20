'use client'

import Image from "next/image";
import Link from "next/link";
import { ChevronDown, CircleUser, Menu } from "lucide-react";

import { Button } from "@/app/_components/ui/button"
import { HiOutlineDocument } from "react-icons/hi";


import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/app/_components/ui/dropdown-menu"

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/app/_components/ui/collapsible"

import { Sheet, SheetContent, SheetTrigger } from "@/app/_components/ui/sheet"
import { usePathname } from "next/navigation.js";
import clsx from "clsx";
import { Toaster } from "@/app/_components/ui/sonner";
import { useDispatch, useSelector } from "react-redux";
import { PropsWithChildren, useState } from "react";
import { PagesConfigInterface } from "@/app/_types/definitions";
import pagesConfigJson from "@/app/_config/pages.config.json";
import { selectUser, signUserOut } from "@/app/(backoffice)/_lib/slices/authSlice";
import withAuth from "../_components/withAuth";
import { BackendGallery } from "../_components/backend-gallery";
import { AppDispatch } from "../_lib/store";
import { cn } from "@/app/_lib/client-utils";;

const pagesConfig: PagesConfigInterface = pagesConfigJson;

const navBackendLinks = [
    {
        label: 'Accueil du site',
        href: "/",
    },
    {
        label: 'Pages',
        base: '/backend/pages',
        children: Object.entries(pagesConfig).map(([key, value]) => (
            {
                label: value.title,
                href: `/backend/pages/${key}`,
            }
        ))
    },
    {
        label: 'Partenaires',
        href: "/backend/partners",
    },
    {
        label: 'Temoignages',
        href: "/backend/testimonials",
    },
    {
        label: 'Posts',
        href: "/backend/posts",
    },
    {
        label: 'Images',
        href: "/backend/images",
    },
    {
        label: 'Logs',
        href: "/backend/logs",
    },
]

const NavMenuBack = ({ className, path, onClickLink }: { className?: string, path?: string, onClickLink?: () => void }) => {

    return (
        <nav className={cn(
            "grid gap-6 text-lg font-medium",
            className
        )}>
            {
                navBackendLinks.map((link, index) => {

                    if (link.href && link.label) {
                        return (
                            <span key={index} onClick={onClickLink}>
                                <Link
                                    href={link.href}
                                    className={clsx(
                                        "text-muted-foreground hover:text-foreground",
                                        path === link.href && "active"
                                    )}
                                >
                                    {link.label}
                                </Link>
                            </span>

                        )
                    }
                    if (link.children) {
                        const MenuCollapsible: React.FC = () => {
                            const [isOpen, setIsOpen] = useState<boolean>(path && path.indexOf(link.base) > -1 ? true : false);
                            return (
                                <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                                    <CollapsibleTrigger className={clsx(
                                        path === "/backend/pages" ? "active" : "",
                                        "text-sm"
                                    )}>{link.label}<ChevronDown className="ml-2 inline-block" /></CollapsibleTrigger>
                                    {
                                        link.children.map((child, index) => {
                                            return (
                                                <CollapsibleContent key={index}>
                                                    <span onClick={onClickLink}>
                                                        <Link
                                                            href={child.href}
                                                            className={path === child.href ? "active" : ""}>
                                                            <HiOutlineDocument className="mx-2 inline-block" />
                                                            {child.label}
                                                        </Link>
                                                    </span>
                                                </CollapsibleContent>
                                            )
                                        })
                                    }
                                </Collapsible>

                            )
                        }
                        return <MenuCollapsible key={index} />
                    }
                    return null;
                })
            }
        </nav>
    )
}

const UserLabel = () => {
    const user = useSelector(selectUser);

    if (!user) {
        return <span>Aucun utilisateur</span>
    }

    return (
        <span>{`${user.data?.firstname} ${user.data?.lastname}`}</span>
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

const BackendLayout: React.FC<PropsWithChildren> = ({ children }) => {

    const path = usePathname();
    const dispatch = useDispatch<AppDispatch>();

    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div className="flex min-h-screen w-full flex-col">
            <header className="sticky top-0 flex h-16 items-center justify-between gap-4 border-b bg-background px-4 md:px-6">
                <Image src="/logo/logo-h-black.webp" alt="logo" width={256} height={80} className="object-contain py-2 h-full order-2" />
                <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                    <SheetTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            className="shrink-0 md:hidden order-1"
                        >
                            <Menu className="size-5" />
                            <span className="sr-only">Toggle navigation menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left">
                        <NavMenuBack path={path} onClickLink={() => setMenuOpen(false)} />
                    </SheetContent>
                </Sheet>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="icon" className="rounded-full order-3">
                            <CircleUser className="size-5" />
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
                        <DropdownMenuItem><Button onClick={() => dispatch(signUserOut())}>Déconexion</Button></DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </header>
            <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
                <div className="mx-auto grid w-full max-w-6xl gap-2">
                    <h1 className="text-3xl font-semibold"></h1>
                </div>
                <div className="mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
                    <NavMenuBack path={path} className="hidden md:grid" />
                    <BackendGallery>
                        <div className="grid gap-6">
                            {children}
                        </div>
                    </BackendGallery >
                </div>
            </main>
            <Notifications />
        </div >
    );
}

export default withAuth(BackendLayout);