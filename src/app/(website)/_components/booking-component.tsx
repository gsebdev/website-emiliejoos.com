
'use client'

import { cn } from "@/app/_lib/client-utils";
import { X } from "lucide-react"
import React, { useContext, useState, createContext} from "react"
import { AnimatePresence, delay, motion } from "framer-motion";



interface BookingDialogProps {
  children: React.ReactNode
}

interface BookingDialogContextInterface {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

interface BookingDialogTriggerProps {
  className?: string
  children: React.ReactNode,
  'aria-label'?: string,
  isActive?: boolean,
  hoverTextClassName?: string,
  initialTextElementClassName?: string,
}

interface BookingDialogContentProps {
  children?: React.ReactNode,
  title?: string,
  overlay?: boolean,
}

const BookingDialogContext = createContext<BookingDialogContextInterface>({
  open: false,
  setOpen: () => { },
})

const BookingDialog = ({ children }: BookingDialogProps) => {
  const [open, setOpen] = useState(false)
  return (
    <BookingDialogContext.Provider value={{ open, setOpen }}>
      {children}
    </BookingDialogContext.Provider>
  )
}

const BookingDialogTrigger: React.FC<BookingDialogTriggerProps> = ({ className, children, isActive, hoverTextClassName, initialTextElementClassName, ...props }) => {

  const { open, setOpen } = useContext<BookingDialogContextInterface>(BookingDialogContext);

  const drawBorder = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: 1, delay: 0.5, ease: 'easeOut' },
      }
    }
  };

  const animateInitialElement = {
    normal: { clipPath: "polygon(0% 0, 125% 0, 100% 100%, -25% 100%)", transition: { duration: 0.3, ease: "easeInOut" } },
    hover: { clipPath: "polygon(125% 0, 125% 0, 100% 100%, 100% 100%)", transition: { duration: 0.3, ease: "easeInOut" } }
  }

  const animateHoverElement = {
    hover: { clipPath: "polygon(0 0, 125% 0, 100% 100%, -25% 100%)", transition: { duration: 0.3, ease: "easeInOut" } },
    normal: { clipPath: "polygon(0 0, 0 0, -25% 100%, -25% 100%)", transition: { duration: 0.3, ease: "easeInOut" } }
  }

  return (

    <motion.button
      className={
        cn(
          "relative",
          className
        )
      }
      onClick={() => setOpen(true)}
      aria-label={props?.['aria-label'] || "Ouvrir la boite de dialogue pour prendre rendez-vous"}
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-controls="booking-dialog"
      whileHover="hover"
      whileFocus="hover"
      whileTap="hover"
      initial="normal"
    >
      {/*initial element*/}
      <motion.span
        variants={animateInitialElement}
        className={initialTextElementClassName}
      >{children}
      </motion.span>
      
      {/*Border element*/}
      <motion.svg
        viewBox="0 0 200 200"
        preserveAspectRatio={"none"}
        initial="hidden"
        whileInView="visible"
        className="absolute top-0 left-0 w-full h-full"
      >
        <motion.rect
          width={200}
          height={200}
          x={0}
          y={0}
          fill="none"
          stroke="currentColor"
          vectorEffect={"non-scaling-stroke"}
          strokeWidth={8}
          variants={drawBorder}
        />

      </motion.svg>
      
      {/*Hover element*/}
      <motion.span
        variants={animateHoverElement}
        className={cn(
          initialTextElementClassName,
          hoverTextClassName,
          "absolute top-0 left-0 h-full w-full grid place-content-center",
        )}
      >
        {children}
      </motion.span>
    </motion.button>

  )
}

const BookingDialogContent: React.FC<BookingDialogContentProps> = ({
  title,
  overlay
}) => {

  const { open, setOpen } = useContext<BookingDialogContextInterface>(BookingDialogContext);

  return (
    <AnimatePresence>

      {
        !!overlay && !!open &&
        <motion.div
          key={'overlay'}
          initial={{
            opacity: 0
          }}
          animate={{
            opacity: 1
          }}
          exit={{
            opacity: 0,
            transition: {
              duration: 0.3,
              delay: 0.1
            }
          }}
          transition={{ duration: 0.3 }}
          onClick={() => setOpen(false)}
          className={cn("fixed w-full h-full left-0 top-0 bg-black z-40 bg-opacity-60")}
        />

      }
      {!!open &&
        <motion.div
          key='dialog'
          initial={{
            opacity: 0,
            transform: "translate(-50%, calc(-50% - 50px))"
          }}
          animate={{
            opacity: 1,
            transform: "translate(-50%, -50%)"
          }}
          exit={{
            opacity: 0,
            transform: "translate(-50%, calc(-50% - 50px))",
            transition: { duration: 0.3 }
          }}
          transition={{
            duration: 0.5,
            delay: 0.3
          }}
          id="booking-dialog"
          className={cn("fixed w-screen h-screen top-0 left-0 bg-background z-50 p-4 grid grid-rows-[auto_1fr] lg:max-w-5xl lg:h-fit lg:max-h-[80vh] lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 text-primary")}
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


          <motion.div
            initial={{
              opacity: 0
            }}
            animate={
              { opacity: 1 }
            }
            transition={{
              duration: 0.5,
              delay: 1.5
            }}
            exit={{
              opacity: 0,
            }}
            className="overflow-y-auto h-full"
          >
            <iframe className="w-full min-h-[50vh]" src="https://emiliejoos.com/rdv" />
          </motion.div>

        </motion.div>
      }
    </AnimatePresence >


  )
}


export const BookingComponent: React.FC<{ variant?: "primary"|"secondary", className?: string }> = ({ variant, className }) => {
  return (
    <BookingDialog>
      <BookingDialogTrigger
        hoverTextClassName={cn(
          (variant === "primary" || !variant) && "bg-primary text-secondary mix-blend-multiply",
          variant === "secondary" && "bg-secondary text-primary mix-blend-screen"
        )}
        initialTextElementClassName={cn(
          "font-body text-xl font-bold py-4 md:text-2xl px-12 flex gap-x-2 items-center",
          (variant === "primary" || !variant) && "booking-btn text-primary",
          variant === "secondary" && "booking-btn text-secondary"
        )}
        className={className}
      >
        Rendez-vous
      </BookingDialogTrigger>
      <BookingDialogContent
        title="Prendre rendez-vous"
        overlay
      />
    </BookingDialog>
  )
}   