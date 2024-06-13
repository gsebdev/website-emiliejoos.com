import { BookingDialog, BookingDialogContent, BookingDialogTrigger } from "@/components/modules/booking-dialog";
import { getBlurDataImage } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { FaCalendarCheck } from "react-icons/fa6";

export default async function Home() {

  return (
    <>
      <section className="h-screen relative">
        <Image
          src="/bg/home-emilie-joos-1.jpg"
          className="absolute z-[-1] h-full w-full object-cover object-top"
          sizes="(100vw, 100vh)"
          alt="photo d'une femme de dos touchant ses homoplates après une séance d'ostéopathie"
          fill
          placeholder="blur"
          blurDataURL={await getBlurDataImage("/bg/home-emilie-joos-1.jpg")}
        />
        <div className="flex flex-col justify-around items-center h-full text-secondary">
          <div className="mt-24 md:mt-36">
            <h1 className="pb-4 md:pb-12 lg:pb-24">Ostéopathe</h1>
            <BookingDialog>
              <BookingDialogTrigger className="btn-secondary mx-auto flex gap-x-2 items-center"><FaCalendarCheck />Rendez-vous</BookingDialogTrigger>
              <BookingDialogContent 
              title="Prendre rendez-vous"
              overlay
              overlayClassName="bg-black bg-opacity-60"
              className="lg:max-w-5xl lg:h-fit lg:max-h-[80vh] lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 text-primary"
              showAnimationClassName="animate-slide-in-up lg:animate-fade-in"
              hideAnimationClassName="animate-slide-out-down lg:animate-fade-out"
              hideAnimationDuration={400}
              showAnimationDuration={400}
              >
                Salut
              </BookingDialogContent>
            </BookingDialog>
          </div>

          <div className="h-full" style={{ maxHeight: "min(33vh, 50vw)" }}>
            <Image
              src="/logo/logo-white.png"
              className="aspect-square h-full max-h-[500px] object-contain"
              sizes="(max-width: 768px) 50vw, 500px"
              alt="logo cabinet d'osteopathie Emilie Joos"
              height={500}
              width={500}
            />
          </div>

        </div>
      </section>
      <section className="h-screen relative flex justify-center items-center">

        <Image
          src="/bg/home-emilie-joos-2.jpg"
          className="absolute z-[-1] h-full w-full object-cover"
          sizes="(100vw, 100vh)"
          alt="photo d'une femme exerçant une pression sur le bas de son dos pendant une séance d'ostéopathie"
          placeholder="blur"
          fill
          blurDataURL={await getBlurDataImage("/bg/home-emilie-joos-2.jpg")}
        />

        <div className="w-full max-h-full flex flex-col gap-y-8 justify-center lg:grid lg:grid-cols-2 p-12 items-center lg:pt-48 2xl:p-48">
          <nav className="contents">
            <ul className="contents lg:grid lg:gap-y-8 2xl:gap-y-16 lg:h-full justify-items-center lg:justify-items-start grid-rows-3">
              <li><Link className="btn-primary" href={"/osteopathie"}>Ostéopathie</Link></li>
              <li><Link className="btn-primary" href="/osteopathie-aquatique">Aquatique</Link></li>
              <li><Link className="btn-primary" href="/hypnose">Hypnose</Link></li>
            </ul>
            <ul className="contents lg:grid lg:gap-y-8 2xl:gap-y-16 lg:h-full grid-rows-3 justify-items-center lg:justify-items-end">
              <li><Link className="btn-primary" href="/news">News</Link></li>
              <li><Link className="btn-primary" href="/le-cabinet">À propos</Link></li>
            </ul>
          </nav>

        </div>
      </section>
      <section className="h-screen relative bg-background">
        <h2>Témoignages</h2>

      </section>
      <section className="relative h-screen flex items-center justify-center">
        <Image
          src="/bg/home-emilie-joos-3.jpg"
          className="absolute z-[-1] h-full w-full object-cover object-top"
          sizes="(100vw, 100vh)"
          alt="photo d'une femme de dos touchant ses homoplates après une séance d'ostéopathie"
          placeholder="blur"
          fill
          blurDataURL={await getBlurDataImage("/bg/home-emilie-joos-3.jpg")}
        />
        <div className="text-center">
          <Image
            src="/logo/logo-white.png"
            className="aspect-square h-full max-h-[250px] object-contain"
            sizes="(max-width: 768px) 50vw, 500px"
            alt="logo cabinet d'osteopathie Emilie Joos"
            height={500}
            width={500}
          />
          <h2 className="text-secondary text-6xl">Contact</h2>
          <Link className="font-heading text-3xl text-secondary my-8 inline-block" href={'tel:+33623679842'}>+33 (0)6 23 67 98 42</Link>
        </div>
      </section>
    </>
  );
}
