// these can be used in both client and server side

import DOMPurify from "isomorphic-dompurify";
import { z } from "zod";
import { BlockType } from "../_types/definitions";

// block type schema

const textBlockSchema = z.object({
    type: z.literal('text'),
    value: z.string().transform((value) => DOMPurify.sanitize(value)).optional(),
});

const imageBlockSchema = z.object({
    type: z.literal('image'),
    value: z.number().positive().optional(),
});

const rowBlockSchema = z.object({
    type: z.literal('row'),
    children: z.lazy(() => z.array(blockSchema))
});

const blockSchema: z.ZodType<BlockType> = z.discriminatedUnion('type', [
    textBlockSchema,
    imageBlockSchema,
    rowBlockSchema,
]);


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

// post form

export const postFormSchema = z.object({

    id: z.number().min(0, { message: 'L\'ID du partenaire doit être positif' }).max(999999, { message: 'L\'ID du partenaire doit être inférieur ou égal à 999999' }).optional(),

    title: z.string().min(1, { message: 'Le titre est obligatoire' }).regex(/^[a-zA-Z0-9_.,:;!?\/&()|#"'$€*%§µ²+À-ÿ\s]+$/, {
        message: 'Carctères interdits dans le titre'
    }).transform((value) => DOMPurify.sanitize(value)).optional(),

    slug: z.string()
        .min(2)
        .regex(/[\w-]+$/, {
            message: 'le doit être au bon format'
        }).optional(),

    content: z.array(blockSchema).nullable().optional(),

    created_at: z.date({ message: 'La date de création doit être une date' }).optional(),

    updated_at: z.date({ message: 'La date de modification doit être une date' }).optional(),

    cover: z.number({ message: 'L\'ID du logo doit être un nombre' })
        .min(0, { message: 'L\'ID du logo n\'est pas valide' })
        .nullable()
        .optional(),

    excerpt: z.string().regex(/^[a-zA-Z0-9_.,:;!?\/&()|#"'$€*%§µ²+À-ÿ\s]+$|^$/, {
        message: 'Caractères interdits dans le résumé'
    }).transform((value) => DOMPurify.sanitize(value)).optional(),

    display_order: z.number().min(0).max(999999).optional()
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



