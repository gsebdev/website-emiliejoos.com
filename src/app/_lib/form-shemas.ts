// these can be used in both client and server side

import DOMPurify from "isomorphic-dompurify";
import { z } from "zod";


// login form
export const loginFormSchema = z.object({
    username: z.string().regex(/^[a-zA-Z0-9_-]+$/, { message: 'username can only contain letters and numbers' }),
    password: z.string()
        .min(4, { message: 'Le mot de passe doit faire au moins 6 caractères' })
        .max(30, { message: 'Le mot de passe doit faire au maximum 30 caractères' })
})

// partner form

export const partnerFormSchema = z.object({

    id: z.number().min(0, { message: 'L\'ID du partenaire doit être positif' }).max(999999, { message: 'L\'ID du partenaire doit être inférieur ou égal à 999999' }).optional(),

    title: z.string()
        .min(2, {
            message: "Le nom d'utilisateur doit faire au moins 2 caractères.",
        })
        .regex(/^[a-zA-Z0-9_.,:;!?/&()|#"'$€*%§µ²+À-ÿ\s]+$/, {
            message: 'le titre ne peut contenir que des lettres et des chiffres et les charactères spéciaux : _.,:;!?/&()|#"$€*%§µ²+'
        })
        .transform((value) => DOMPurify.sanitize(value)),

    url: z.string().url({
        message: 'l\'url doit être valide',
    }),

    logo: z.object({

        id: z.number({ message: 'L\'ID du logo doit être un nombre' })
            .positive({ message: 'L\'ID du logo doit être positif' })
            .optional(),

        url: z.string()
            .url({ message: 'l\'url du logo doit être valide' })
            .optional(),
    }, {
        message: "Logo non valide",
    }),

    description: z.string({ message: "la description n'est pas au bon format." })
        .regex(/^[a-zA-Z0-9_.,:;!?/&()|#"'$€*%§µ²+À-ÿ\s]+$/, {
            message: 'la description ne peut contenir que des lettres et des chiffres et les charactères spéciaux : _.,:;!?/&()|#"$€*%§µ²+'
        })
        .transform((value) => DOMPurify.sanitize(value)),

    display_order: z.number().min(0).max(999999)
});


// page form 

export const pageFormSchema = z.object({
    content: z.string().transform((value) => DOMPurify.sanitize(value)),
    images: z.array(
      z.number({
        message: "ID de l'image doit être in nombre",
      })),
    id: z.number({
      required_error: "ID de la page est requis",
      message: "l'ID doit être un nombre",
    })
  });