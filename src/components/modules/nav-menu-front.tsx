'use client'
import clsx from "clsx";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SiFacebook, SiInstagram, SiLinkedin } from "react-icons/si";
import { FaCalendarCheck } from "react-icons/fa6";
import Image from "next/image";
import { BookingDialog, BookingDialogContent, BookingDialogTrigger } from "./booking-dialog";

export default function NavMenuFront() {

    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

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
        } else {
            resetScrollBarWidth();
        }
        return () => resetScrollBarWidth();
    }, [isMenuOpen]);

    return (
        <BookingDialog>
            <nav
                id="main-menu"
                className={`flex flex-col justify-between pb-16 px-4 pt-0 overflow-y-auto overflow-x-hidden menu-nav fixed top-0 left-0 bg-background text-center h-screen w-full z-40 origin-right ${isMenuOpen ? "translate-y-0" : "translate-y-full"}`}
            >
                <div>
                    <div className="relative h-auto sticky top-0 pt-4 pb-4 bg-background z-10">
                        <Link href={'/'} className="block relative h-16 w-1/2 text-left">
                            <Image
                                src={"/logo/logo-full-h-black.webp"}
                                fill
                                alt="logo Emilie Joos Ostéopathe Briançon"
                                sizes="(max-width: 768px) 300px, 500px"
                                className="object-contain object-left"
                            />
                        </Link>

                    </div>
                    <div className="py-4">
                        <ul className="grid gap-y-4 justify-items-center">

                            <li><Link className="btn-primary--menu" href={"/osteopathie"}>Ostéopathie</Link></li>
                            <li><Link className="btn-primary--menu" href="/osteopathie-aquatique">Aquatique</Link></li>
                            <li><Link className="btn-primary--menu" href="/hypnose">Hypnose</Link></li>
                            <li><Link className="btn-primary--menu" href="/news">News</Link></li>
                            <li><Link className="btn-primary--menu" href="/le-cabinet">À propos</Link></li>
                            <li>
                                <BookingDialogTrigger className="btn-secondary--menu flex gap-x-2 items-center mt-4" >
                                <FaCalendarCheck />Rendez-vous
                                </BookingDialogTrigger>
                            </li>

                        </ul>
                    </div>
                </div>

                <div className="flex flex-col gap-6 lg:flex-row lg:justify-between items-center">

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
                id="menu-toggler"
                tabIndex={0}
                aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
                aria-expanded={isMenuOpen}
                aria-controls="main-menu"
                className={clsx(
                    "menu-toggler fixed right-0 px-4 md:px-8 top-8 text-xl md:text-2xl font-heading uppercase z-40 transition-colors",
                    isMenuOpen ? "is-open text-primary duration-300 ease-in-slow-out-fast" : "text-secondary"
                )}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
                {isMenuOpen ? 'Fermer' : 'Menu'}
            </button>
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
                Salut <br/>
                Salut <br/>
                Salut <br/>
                Salut <br/>
                Salut <br/>
                Salut <br/>
                Salut <br/>
                Salut <br/>
                Salut <br/>
                Salut <br/>
                Salut <br/>
                Salut <br/>
                Salut <br/>
                Salut <br/>
                Salut <br/>
                Salut <br/>
                Salut <br/>
                Salut <br/>
                Salut <br/>
                Salut <br/>
                Salut <br/>
                Salut <br/>
                Salut <br/>
                Salut <br/>
                Salut <br/>
                Salut <br/>
                Salut <br/>
                Salut <br/>
                Salut <br/>
                Salut <br/>
                Salut <br/>
                Salut <br/>
                Salut <br/>
                Salut <br/>
                Salut <br/>
                Salut <br/>
                Salut <br/>
                Salut <br/>
                Salut <br/>
                Salut <br/>
                Salut <br/>
                Salut <br/>
                Salut <br/>
                Salut <br/>
                Salut <br/>
                Salut <br/>
                Salut <br/>
                Salut <br/>
                Salut <br/>
                Salut <br/>
                Salut <br/>
                Salut <br/>
                Salut <br/>
                Salut <br/>
                Salut <br/>
                Salut <br/>
                Salut <br/>
                Salut <br/>
                Salut <br/>
                Salut <br/>
                Salut <br/>
                Salut <br/>
                Salut <br/>
            </BookingDialogContent>
        </BookingDialog>

    )
}