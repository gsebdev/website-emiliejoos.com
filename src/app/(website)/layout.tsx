import NavMenuFront from '@/components/modules/nav-menu-front';
import './website.css';
import { Anton, Source_Sans_3 } from 'next/font/google';
import Link from 'next/link';
import { SiLinkedin, SiInstagram, SiFacebook } from "react-icons/si";



const anton = Anton({
    subsets: ["latin"],
    weight: "400",
    preload: true,
    variable: "--font-anton",
    fallback: ["sans-serif"],
    display: "swap",
});

const sourceSansPro = Source_Sans_3({
    subsets: ["latin"],
    weight: ["400", "700"],
    preload: true,
    variable: "--font-source",
    fallback: ["sans-serif"],
    display: "swap",
})
export const navLinks = [
    {
        href: "/osteopathie",
        label: "Ostéopathie"
    },
    {
        href: "/hypnose",
        label: "Hypnose"
    },
    {
        href: "/osteopathie-aquatique",
        label: "Aquatique"
    },
    {
        href: "/news",
        label: "News"
    },
    {
        href: "/a-propos",
        label: "À propos"
    }
];


export default function Layout({ children }: { children: React.ReactNode }) {

    return (
        <div className={`${anton.variable} ${sourceSansPro.variable} grid grid-rows-[1fr_auto] min-h-screen`}>
            <header className='contents'>
                <NavMenuFront />
            </header>
            <main>
                {children}
            </main>
            <footer data-menu-color="primary" className='bg-background'>
                <div className='flex flex-col lg:flex-row lg:justify-between gap-y-8 p-16'>
                    <div>
                        <nav>
                            <ul className='flex flex-col lg:flex-row items-center justify-center gap-x-4 gap-y-2 uppercase text-xl tracking-wide font-heading'>
                                <li><Link href="/partenaires">Partenaires</Link></li>
                                <li><Link href="/temoignages">Témoignages</Link></li>
                            </ul>
                        </nav>
                    </div>
                    <div>
                        <nav>
                            <ul className='flex justify-center gap-x-6 text-2xl'>
                                <li><Link title="Facebook de Emilie Joos Ostéopathe" aria-label="Facebook de Emilie Joos Ostéopathe" href={"https://www.facebook.com/emiliejoos"}><SiFacebook /></Link></li>
                                <li><Link title="Instagram de Emilie Joos Ostéopathe" aria-label="Instagram de Emilie Joos Ostéopathe" href={"https://www.instagram.com/emiliejoos/"}><SiInstagram /></Link></li>
                                <li><Link title="LinkedIn de Emilie Joos Ostéopathe" aria-label="LinkedIn de Emilie Joos Ostéopathe" href={"https://www.linkedin.com/in/emiliejoos/"}><SiLinkedin /></Link></li>
                            </ul>
                        </nav>
                    </div>
                    <div className='flex justify-center font-bold mt-8 lg:mt-0'>
                        <p>© {new Date(Date.now()).getFullYear()} Emilie Joos</p>
                    </div>
                </div>
                <div className='pb-16 px-16'>
                    <ul className='flex flex-col lg:flex-row items-center justify-center gap-x-6 gap-y-2 text-xs'>
                        <li><Link href={"/mentions-legales"}>Mentions Légales</Link></li>
                        <li><Link href={"/politique-confidentialite"}>Politique de Confidentialité</Link></li>
                        <li className='mt-4 lg:mt-0'>Made with ❤ by <Link href={"https://github.com/gsebdev"}>Sébastien GAULT</Link></li>
                    </ul>
                </div>
            </footer>
        </div>
    );
}