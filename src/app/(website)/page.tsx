import Image from "next/image";
import Link from "next/link";
import navLinks from '@/app/_config/front.nav.links.config.json'
import { getImagesFromDB, getSettingFromDB } from "../_lib/db";
import { BookingDialog, BookingDialogContent, BookingDialogTrigger } from "./_components/booking-dialog";
import TestimonialsCarousel from "./_components/testimonials-carousel";
import { getBlurDataImage } from "../_lib/utils";

export default async function Home() {
  let testimonialsError = null;
  let testimonials = null;

  try {
    const result = await getSettingFromDB('testimonials');

    if (!result || !result.length) {
      throw new Error();
    }

    if (Array.isArray(result[0].value) && result[0].value.length) {
      testimonials = [];
      for (const { image: imageID } of result[0].value) {
        const imageResult = await getImagesFromDB(imageID);

        if (imageResult && imageResult.length) {
          testimonials.push(imageResult[0]);
        }
      }
    }

  } catch (error) {
    testimonialsError = 'Oups quelques chose a mal tourné, veuillez recharger la page...';
    testimonials = null;
  }

  return (
    <>
      <section data-menu-color="secondary" className="h-screen short:h-fit relative">
        <Image
          src="/bg/home-emilie-joos-1.jpg"
          className="absolute z-[-1] h-full w-full object-cover object-center"
          sizes="(100vw, 100vh)"
          alt="photo d'une femme de dos touchant ses homoplates après une séance d'ostéopathie"
          fill
          placeholder="blur"
          blurDataURL={await getBlurDataImage("/bg/home-emilie-joos-1.jpg")}
        />
        <div className="flex flex-col justify-around items-center h-full text-secondary">
          <div className="mt-24 md:mt-36">
            <h1 className="pb-4 md:pb-12 lg:pb-24 text-secondary xl:text-9xl tracking-wide scale-x-110">Ostéopathie</h1>
            <BookingDialog>
              <BookingDialogTrigger className="btn-secondary mx-auto flex gap-x-2 items-center short:mb-8 short: mt-4">Rendez-vous</BookingDialogTrigger>
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

          <div className="relative w-full h-[33vh]" style={{ maxHeight: "min(33vh, 50vw)" }}>
            <Image
              src="/logo/logo-white.png"
              className="object-contain"
              sizes="(max-width: 768px) 50vw, 500px"
              alt="logo cabinet d'osteopathie Emilie Joos"
              fill
            />
          </div>

        </div>
      </section>
      <section data-menu-color="secondary" className="h-screen short:h-fit relative flex justify-center items-center">

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
              {
                navLinks.map(
                  ({ href, label }, index) => (
                    index <= 2 ? <li key={href}><Link className="btn-primary" href={href}>{label}</Link></li> : null
                  )
                )
              }
            </ul>
            <ul className="contents lg:grid lg:gap-y-8 2xl:gap-y-16 lg:h-full grid-rows-3 justify-items-center lg:justify-items-end">
              {
                navLinks.map(
                  ({ href, label }, index) => (
                    index > 2 ? <li key={href}><Link className="btn-primary" href={href}>{label}</Link></li> : null
                  )
                )
              }
            </ul>
          </nav>

        </div>
      </section>
      <section data-menu-color="primary" className="min-h-[85vh] short:h-fit relative bg-background px-8 py-16 grid grid-cols-1 grid-rows-[auto_1fr] justify-items-center">
        <div>
          <h2 className="mb-8 text-center">Bribes</h2>
          <div className="text-center text-xl p-8 my-8">
            <p>Les &quot;BRIBES&quot; c&apos;est quoi ?</p>
            <p>Ce sont des bouts de phrases que j&apos;ai eu plaisir à entendre après la question classique de fin de séance: Comment ça va ?</p>
            <p>Des morceaux empreints de vérité et de spontanéité, qui décrivent parfaitement vos perceptions corporelles.</p>
          </div>

        </div>

        {
          !!testimonialsError &&
          <p className="text-center text-primary">{testimonialsError}</p>
        }
        {
          !!testimonials ?
            <TestimonialsCarousel testimonials={testimonials} />
            :
            <p className="text-center text-primary">Aucun témoignage n&apos;a été publié</p>
        }
      </section>
      <section data-menu-color="secondary" className="relative short:h-fit h-screen flex items-center justify-center">
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
