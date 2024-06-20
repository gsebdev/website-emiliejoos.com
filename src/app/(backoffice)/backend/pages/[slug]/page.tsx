'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/app/_components/ui/card"
import ImageInput from "@/app/_components/ui/image-input"
import { PageType, PagesConfigInterface } from "@/app/_types/definitions";
import { fetchPages, selectPageBySlug, setPage } from "@/app/(backoffice)/_lib/slices/pagesSlice";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/app/_components/ui/form";
import { Button } from "@/app/_components/ui/button";
import Loader from "@/app/_components/ui/loader";
import { useQuill } from "react-quilljs";
import pagesConfigJson from "@/app/_config/pages.config.json";
import { AppDispatch} from "@/app/(backoffice)/_lib/store";
import { useGallery } from "@/app/(backoffice)/_components/gallery";
import { selectAllImages } from "@/app/(backoffice)/_lib/slices/imagesSlice";

import "quill/dist/quill.snow.css";
import { pageFormSchema } from "@/app/_lib/form-shemas";

const pagesConfig: PagesConfigInterface = pagesConfigJson;

export default function Pages() {
    const { slug: pageSlug } = useParams();
    const dispatch = useDispatch<AppDispatch>();

    const page: PageType = useSelector(selectPageBySlug(pageSlug as string));
    const images = useSelector(selectAllImages);

    const { quill, quillRef } = useQuill({
        theme: 'snow',
        modules: {
            toolbar: [
                [{ header: [2, 3, 4, false] }],
                ["bold", "italic", "underline"],
                [
                    { list: "bullet" },
                    { indent: "-1" },
                    { indent: "+1" },
                ],
                ["link"],
                [{ align: [] }],
                ["clean"],
            ],
        },
        placeholder: 'Contenu de la page...',
        formats: ['header', 'bold', 'italic', 'underline', 'link', 'align', 'list', 'indent'],
    });

    const { setGalleryOpen } = useGallery();

    const form = useForm<z.infer<typeof pageFormSchema>>({
        resolver: zodResolver(pageFormSchema),
        defaultValues: {
            content: '',
            images: [],
            id: 0
        },

    })

    useEffect(() => {
        if (quill) {

            quill.clipboard.dangerouslyPasteHTML(page.content);

            quill.on(
                'text-change',
                () => {
                    form.setValue('content', quill.root.innerHTML);
                })
        }
    }, [quill, page, form]);

    useEffect(() => {
        if (!page) {
            dispatch(fetchPages(pageSlug));
        } else {
            form.setValue('images', page.images);
            form.setValue('content', page.content);
            form.setValue('id', page.id)
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
                                                                images
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
                                        slug: page.slug
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