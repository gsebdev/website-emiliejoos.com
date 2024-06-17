'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ImageInput from "@/components/ui/image-input"
import { ImageType, PageType, PagesConfigInterface } from "@/lib/definitions";
import { fetchPages, selectPageBySlug, setPage } from "@/lib/slices/pagesSlice";
import { store } from "@/store";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import Loader from "@/components/ui/loader";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";
import CustomImageBlot from "@/lib/quill-image-blot";
import Quill from "quill";
import { useGallery } from "@/components/modules/gallery";
import pagesConfigJson from "../../../../../pages.config.json";

const pagesConfig: PagesConfigInterface = pagesConfigJson;


Quill.register('formats/customImage', CustomImageBlot);

const formSchema = z.object({
    content: z
        .string({
            required_error: "Le contenu est requis",
        })
        .min(10, {
            message: "Le contenu doit faire au moins 10 caractères."
        }),
    images: z.array(z.number({
        required_error: "Les images sont requises",
        message: "mauvais format",
    }))
});

export default function Pages() {
    const { slug: pageSlug } = useParams();
    const dispatch = useDispatch<typeof store.dispatch>();
    const page: PageType = useSelector(selectPageBySlug(pageSlug as string));

    const { quill, quillRef } = useQuill({
        theme: 'snow',
        modules: {
            toolbar: [
                [{ header: [2, 3, 4, false] }],
                ["bold", "italic", "underline", "blockquote"],
                [
                    { list: "ordered" },
                    { list: "bullet" },
                    { indent: "-1" },
                    { indent: "+1" },
                ],
                ["link", "image"],
                [{ align: [] }],
                ["clean"],
                [{ 'color': [] }, { 'background': [] }],
            ],
        },
        placeholder: 'Contenu de la page...',
        formats: ['header', 'bold', 'italic', 'underline', 'blockquote', 'link', 'image', 'align', 'list', 'indent', 'color', 'background', 'customImage'],
    });

    const { setGalleryOpen } = useGallery();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            content: '',
            images: [],
        },

    })

    useEffect(() => {
        if (quill) {

            quill.clipboard.dangerouslyPasteHTML(page.content);

            (quill.getModule('toolbar') as any)
                .addHandler(
                    'image',
                    () => setGalleryOpen({
                        selection: [],
                        onValidateSelection: (imageIds) => {
                            const range = quill.getSelection();
                            if (range)
                                quill.insertEmbed(range.index, 'customImage', store.getState().images.items.find((image: ImageType) => image.id === Number(imageIds[0])));
                        }
                    })
                );


            quill.on(
                'text-change',
                () => {
                    form.setValue('content', quill.root.innerHTML);
                })
        }
    }, [quill, page, form, setGalleryOpen]);

    useEffect(() => {
        if (!page) {
            dispatch(fetchPages(pageSlug));
        } else {
            form.setValue('images', page.images);
            form.setValue('content', page.content);
        }
    }, [dispatch, pageSlug, page, form]);

    return (
        <Card>
            {!page && <div className="flex justify-center items-center h-96"><Loader /></div>}
            {
                !!page &&
                <>
                    <CardHeader className="flex-row justify-between flex-wrap">
                        <CardTitle>Page: {page.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <FormField
                                control={form.control}
                                name="images"
                                render={({ field }) => (
                                    <FormItem className="m-2">
                                        <FormLabel>Images</FormLabel>
                                        <FormControl>
                                            <div className="flex flex-wrap gap-4">
                                                {
                                                    [...Array(pagesConfig[page.slug]?.images_number)].map((_, i) => (
                                                        <ImageInput
                                                            key={i}
                                                            value={
                                                                store
                                                                    .getState()
                                                                    .images.items
                                                                    .find((image) => image.id === field.value?.[i])
                                                                || undefined
                                                            }
                                                            onClick={() => setGalleryOpen({
                                                                selection: [page.images?.[i]],
                                                                onValidateSelection: (selected) => {
                                                                    if (!selected?.[0]) return;
                                                                    field.value[i] = Number(selected[0]?.id);
                                                                    form.setValue('images', [...field.value]);
                                                                }
                                                            })
                                                            }
                                                        />
                                                    ))
                                                }
                                            </div>
                                        </FormControl>
                                    </FormItem>)
                                }
                            />
                            <FormField
                                control={form.control}
                                name="content"
                                render={() => (
                                    <FormItem className="m-2">
                                        <FormLabel>Contenu</FormLabel>
                                        <FormControl>
                                            <div
                                                ref={quillRef}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormItem className="m-2">
                                <Button type="submit" className="m-2" onClick={form.handleSubmit(() => dispatch(setPage({
                                    page: {
                                        ...form.getValues(),
                                        id: page.id,
                                        slug: page.slug,
                                        images_number: pagesConfig[page.slug]?.images_number ?? 1,
                                        title: pagesConfig[page.slug]?.title ?? 'Sans titre'
                                    }

                                })))}>Enregistrer</Button>
                            </FormItem>
                        </Form>
                    </CardContent>
                </>
            }

        </Card>
    )
}