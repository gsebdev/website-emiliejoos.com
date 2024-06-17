'use client'

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SiFacebook, SiInstagram, SiLinkedin } from "react-icons/si";
import { FaCalendarCheck } from "react-icons/fa6";
import Image from "next/image";
import { BookingDialog, BookingDialogContent, BookingDialogTrigger } from "./booking-dialog";
import { cn } from "@/lib/utils";
import { navLinks } from "@/app/(website)/layout";
import { usePathname } from "next/navigation";
import clsx from "clsx";


const NavLogoLink = ({ className, invert = false }: { className?: string, invert?: boolean }) => {

    return (
        <div className={cn(
            'aspect-[512/160] h-10 md:h-16 z-40 transition-all duration-300',
            invert ? "invert" : "",
            className
        )}>

            <Link href={'/'} className={`relative`} >
                <Image
                    src={`/logo/logo-h-black.webp`}
                    className={"object-contain h-full w-full"}
                    width={512}
                    height={160}
                    alt="logo Emilie Joos Ostéopathe Briançon"
                    sizes="(max-width: 768px) 250px, 350px"
                />
            </Link>
        </div>
    );
}

const defaultTriggerColor = 'primary';

export default function NavMenuFront({ triggerClassName }: { triggerClassName?: string }) {

    const pathname = usePathname();

    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

    const [triggerColor, setTriggerColor] = useState<string>(defaultTriggerColor);
    const [triggerTransitionDuration, setTriggerTransitionDuration] = useState<"short" | "long">("short");
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [windowHeight, setWindowHeight] = useState<number>(0);

    const triggerRef = useRef<HTMLButtonElement>(null);
    const lastColorBeforeOpen = useRef<string | null>(null);


    useEffect(() => {
        lastColorBeforeOpen.current = null;
        setIsMenuOpen(false);
    }, [pathname]);

    useEffect(() => {

        if (!triggerRef.current || !windowHeight) return;

        const colorControllers = document.querySelectorAll("[data-menu-color]");

        if (!colorControllers) return setIsLoading(false);

        const bottomMargin = windowHeight - triggerRef.current.getBoundingClientRect().bottom;

        const observer = new IntersectionObserver(
            (entries) => {
                let noEntryIntersecting = true;
                entries.forEach((entry) => {

                    if (entry.isIntersecting) {
                        noEntryIntersecting = false;
                        const newColor = entry.target.getAttribute('data-menu-color');
                        if (newColor) {
                            setTriggerColor(newColor);
                        }
                        setTriggerTransitionDuration("long");
                    }
                });

                if (lastColorBeforeOpen.current === null && noEntryIntersecting) {
                    lastColorBeforeOpen.current = defaultTriggerColor;
                    setTriggerTransitionDuration("short");
                    setTriggerColor(defaultTriggerColor);
                }

                setIsLoading(false);
            },
            {
                root: null,
                threshold: 0,
                rootMargin: `0px 0px -${bottomMargin}px 0px`,
            }
        );

        colorControllers.forEach((colorController) => {
            observer.observe(colorController);
        });

        return () => {
            observer.disconnect();
        };
    }, [windowHeight, pathname]);

    useEffect(() => {
        const setScrollBarWidth = () => {
            const scrollBarWidth = window.innerWidth - document.body.offsetWidth;
            document.documentElement.style.setProperty("--scrollbar-width", `${scrollBarWidth}px`);
            document.body.classList.add("menu-open");
        };

        const resetScrollBarWidth = () => {
            document.documentElement.style.removeProperty("--scrollbar-width");
            document.body.classList.remove("menu-open");
        };

        if (isMenuOpen) {
            setScrollBarWidth();
            setTriggerColor((lastColor) => {
                lastColorBeforeOpen.current = lastColor;
                return defaultTriggerColor;
            });

            setTriggerTransitionDuration("long");
        } else {
            resetScrollBarWidth();
            setTriggerTransitionDuration("short");
            setTriggerColor(lastColorBeforeOpen.current || defaultTriggerColor);
        }
        return () => resetScrollBarWidth();

    }, [windowHeight, isMenuOpen]);

    useEffect(() => {

        const resizeObserver = new ResizeObserver(() => {
            setWindowHeight(window.innerHeight);
            setIsMenuOpen(false);
        });
        resizeObserver.observe(document.body);

        return () => resizeObserver.disconnect();
    }, []);

    return (
        <BookingDialog>
            <nav
                id="main-menu"
                className={`flex flex-col justify-between pb-16 px-4 pt-0 overflow-y-auto overflow-x-hidden menu-nav fixed top-0 left-0 bg-background text-center h-screen w-screen z-40 origin-right ${isMenuOpen ? "translate-y-0" : "translate-y-full"}`}
            >
                <div className="sticky top-0 min-h-24 grid items-center bg-background z-10">
                    <NavLogoLink
                        invert={['background', 'secondary'].includes(triggerColor)}
                        className={""}
                    />
                </div>
                <div className="py-4">
                    <ul className="grid gap-y-4 justify-items-center">
                        {
                            navLinks.map(({ href, label }) => (
                                <li key={href}>
                                    <Link href={href} className="btn-primary--menu">{label}</Link>
                                </li>
                            ))
                        }
                        <li>
                            <BookingDialogTrigger className="btn-secondary--menu flex gap-x-2 items-center mt-4" >
                                <FaCalendarCheck />Rendez-vous
                            </BookingDialogTrigger>
                        </li>

                    </ul>
                </div>


                <div className="flex flex-col px-4 gap-6 lg:flex-row lg:justify-between items-center">

                    <Link className="font-heading text-lg" href="tel:+33623679842">+33 (0) 6 23 67 98 42</Link>

                    <ul className='flex flex-col lg:flex-row items-center justify-center gap-x-4 gap-y-2 uppercase text-xl tracking-wide font-heading'>
                        <li><Link href="/partenaires">Partenaires</Link></li>
                        <li><Link href="/temoignages">Témoignages</Link></li>

                    </ul>


                    <ul className='flex justify-center gap-x-6 text-2xl'>
                        <li><Link title="Facebook de Emilie Joos Ostéopathe" aria-label="Facebook de Emilie Joos Ostéopathe" href={"https://www.facebook.com/emiliejoos"}><SiFacebook /></Link></li>
                        <li><Link title="Instagram de Emilie Joos Ostéopathe" aria-label="Instagram de Emilie Joos Ostéopathe" href={"https://www.instagram.com/emiliejoos/"}><SiInstagram /></Link></li>
                        <li><Link title="LinkedIn de Emilie Joos Ostéopathe" aria-label="LinkedIn de Emilie Joos Ostéopathe" href={"https://www.linkedin.com/in/emiliejoos/"}><SiLinkedin /></Link></li>
                    </ul>
                </div>
            </nav>

            <button
                ref={triggerRef}
                id="menu-toggler"
                tabIndex={0}
                aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
                aria-expanded={isMenuOpen}
                aria-controls="main-menu"
                className={cn(
                    "menu-toggler right-0 px-4 md:px-8 top-8 text-xl md:text-2xl font-heading uppercase z-40 transition-all",
                    isMenuOpen ? "is-open ease-in-slow-out-fast" : "",
                    triggerClassName,
                    triggerTransitionDuration === 'short' ? 'duration-75' : 'duration-300',
                    `text-${triggerColor}`,
                    isLoading ? "opacity-0" : "opacity-100",
                    pathname === '/' ? 'fixed' : 'absolute lg:fixed'
                )}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
                {isMenuOpen ? 'Fermer' : 'Menu'}
            </button>
            {
                pathname !== '/' &&
                <NavLogoLink
                    invert={['background', 'secondary'].includes(triggerColor)}
                    className={"absolute top-8 md:top-4 left-4 z-30"}
                />
            }
            <BookingDialogContent
                title="Prendre rendez-vous"
                overlay
                overlayClassName="bg-black bg-opacity-60"
                className="lg:max-w-5xl lg:h-fit lg:max-h-[80vh] lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2"
                showAnimationClassName="animate-slide-in-up lg:animate-fade-in"
                hideAnimationClassName="animate-slide-out-down lg:animate-fade-out"
                hideAnimationDuration={400}
                showAnimationDuration={400}
            >
                Salut <br />
                Salut <br />
                Salut <br />
                Salut <br />
                Salut <br />
                Salut <br />
                Salut <br />
                Salut <br />
                Salut <br />
                Salut <br />
                Salut <br />
                Salut <br />
                Salut <br />
                Salut <br />
                Salut <br />
                Salut <br />
                Salut <br />
                Salut <br />
                Salut <br />
                Salut <br />
                Salut <br />
                Salut <br />
                Salut <br />
                Salut <br />
                Salut <br />
                Salut <br />
                Salut <br />
                Salut <br />
                Salut <br />
                Salut <br />
                Salut <br />
                Salut <br />
                Salut <br />
                Salut <br />
                Salut <br />
                Salut <br />
                Salut <br />
                Salut <br />
                Salut <br />
                Salut <br />
                Salut <br />
                Salut <br />
                Salut <br />
                Salut <br />
                Salut <br />
                Salut <br />
                Salut <br />
                Salut <br />
                Salut <br />
                Salut <br />
                Salut <br />
                Salut <br />
                Salut <br />
                Salut <br />
                Salut <br />
                Salut <br />
                Salut <br />
                Salut <br />
                Salut <br />
                Salut <br />
                Salut <br />
                Salut <br />
                Salut <br />
            </BookingDialogContent>
        </BookingDialog>

    )
}