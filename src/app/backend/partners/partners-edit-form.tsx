import { useGallery } from "@/components/modules/gallery";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import ImageInput from "@/components/ui/image-input";

import { Input } from "@/components/ui/input"
import Loader from "@/components/ui/loader";
import { Textarea } from "@/components/ui/textarea";
import { Partner } from "@/lib/definitions";
import { selectAllPartners, setPartner } from "@/lib/slices/partnersSlice";
import { store } from "@/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { z } from "zod";

interface PartnerFormProps {
    partner?: Partner | null;
    afterSubmit?: () => void;
    isLoading?: boolean;
}
const FormSchema = z.object({
    id: z.number().min(0),
    title: z.string().min(2, {
        message: "Le nom d'utilisateur doit faire au moins 2 caractères.",
    }),
    url: z.string().min(7, {
        message: "L'url' doit faire au moins 7 caractères.",
    }),
    logo: z.object({
        id: z.number().positive().optional(),
        url: z.string().url().optional(),
    }, {
        message: "Le logo n'est pas valide",
    }),
    description: z.string().min(2, {
        message: "la decription doit faire au moins 2 caractères.",
    }),
    display_order: z.number()
})




export default function EditForm({ partner, afterSubmit, isLoading }: PartnerFormProps) {
    const dispatch = useDispatch<typeof store.dispatch>();

    const newOrder = useSelector(selectAllPartners).length + 1;

    const { setGalleryOpen } = useGallery();

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            id: 0,
            title: "",
            url: "",
            logo: {},
            description: "",
            display_order: newOrder,
        },
    });

    useEffect(() => {
        if (partner) {
            form.reset({
                ...partner,
                display_order: partner.display_order,
                id: partner.id,
            });
        }
    }, [partner, form]);


    const onSubmit =  () => {
        const { title, url, logo, description, id, display_order } = form.getValues();
        console.log(title, url, logo, description, id, display_order)
        dispatch(setPartner({
            partner: {
                title,
                url,
                logo,
                description,
                id: id,
                display_order: display_order
            }
        }));
        if (afterSubmit) afterSubmit();
    }



    return (
        <Form {...form}>
            <div className="flex flex-col gap-4">
                <FormField
                    control={form.control}
                    name="id"
                    render={({ field }) => (
                        <FormItem className="hidden">
                            <FormControl>
                                <Input {...field} type="hidden" />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="display_order"
                    render={({ field }) => (
                        <FormItem className="hidden">
                            <FormControl>
                                <Input  {...field} type="hidden" />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Titre</FormLabel>
                            <FormControl>
                                <Input placeholder="Titre" {...field} />
                            </FormControl>
                            <FormDescription className="text-xs text-muted-foreground">
                                Entrez le titre de votre partenaire
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Url</FormLabel>
                            <FormControl>
                                <Input placeholder="lien vers le site" {...field} />
                            </FormControl>
                            <FormDescription className="text-xs text-muted-foreground">
                                {'Entrez l\'url de votre partenaire'}
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="logo"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Logo</FormLabel>
                            <FormControl>
                                <ImageInput
                                    className={`${field.value ? 'w-fit' : 'w-48'} h-48`}
                                    onClick={() => setGalleryOpen({
                                        selection: Object.hasOwn(field.value, "id") && typeof field.value.id === "number" ? [field.value.id] : [],
                                        onValidateSelection: (selected) => {
                                            form.setValue("logo", {
                                                id: selected?.[0]?.id
                                            });
                                        },
                                    })}
                                    value={
                                        Object.hasOwn(field.value, "id") && typeof field.value.id === "number" ?
                                            store.getState().images.items.find((image) => image.id === field.value.id) :
                                            field.value.url ?? ""
                                    }
                                    onChange={(url) => {
                                        if(typeof url === "string") {
                                            form.setValue("logo", { url });
                                        }
                                    }}
                                    
                                    hasURLInput
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Description" {...field} />
                            </FormControl>
                            <FormDescription className="text-xs text-muted-foreground">
                                {'Entrez la description de votre partenaire'}
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormItem className="flex justify-end gap-4 items-center space-y-0 mt-4">
                    <Button
                        variant={"outline"}
                        onClick={afterSubmit}
                    >
                        Annuler
                    </Button>
                    <Button
                        type="submit"
                        onClick={form.handleSubmit(onSubmit)}>
                        {isLoading ?
                            <>Enregistrement... <Loader className="h-full" /></> :
                            "Enregistrer"
                        }
                    </Button>
                </FormItem>
            </div>

        </Form>
    )
}