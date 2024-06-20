import { useGallery } from "@/app/(backoffice)/_components/gallery";
import { Button } from "@/app/_components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/app/_components/ui/form"
import ImageInput from "@/app/_components/ui/image-input";

import { Input } from "@/app/_components/ui/input"
import Loader from "@/app/_components/ui/loader";
import { Textarea } from "@/app/_components/ui/textarea";
import { PartnerType } from "@/app/_types/definitions";
import { selectAllPartners, setPartner } from "@/app/(backoffice)/_lib/slices/partnersSlice";
import { AppDispatch } from "@/app/(backoffice)/_lib/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { z } from "zod";
import { partnerFormSchema } from "@/app/_lib/form-shemas";
import { selectAllImages } from "../../_lib/slices/imagesSlice";

interface PartnerFormProps {
    partner?: PartnerType | null;
    afterSubmit?: () => void;
    isLoading?: boolean;
}


export default function EditForm({ partner, afterSubmit, isLoading }: PartnerFormProps) {
    const dispatch = useDispatch<AppDispatch>();

    const partners = useSelector(selectAllPartners);
    const images = useSelector(selectAllImages);
    const newOrder = partners.length + 1;

    const { setGalleryOpen } = useGallery();

    const form = useForm<z.infer<typeof partnerFormSchema>>({
        resolver: zodResolver(partnerFormSchema),
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


    const onSubmit = () => {
        const { title, url, logo, description, id, display_order } = form.getValues();

        dispatch(setPartner({
            partner: {
                title,
                url,
                logo,
                description,
                id: id ?? 0,
                display_order: display_order
            }
        }));
        if (afterSubmit) afterSubmit();
    }


    const findImageById = useCallback((id: number) => {
        return images.find(image => image.id === id);
    }, [images]);


    return (
        <Form {...form}>
            <div className="flex flex-col gap-4">
                <FormField
                    control={form.control}
                    name="id"
                    render={({ field }) => (
                        <FormItem className="hidden">
                            <FormControl>
                                <Input {...field} value={form.getValues().id} type="hidden" />
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
                                            findImageById(field.value.id) :
                                            field.value.url ?? ""
                                    }
                                    onChange={(url) => {
                                        if (typeof url === "string") {
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