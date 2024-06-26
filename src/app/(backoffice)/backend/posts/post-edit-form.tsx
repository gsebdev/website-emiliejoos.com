import { PostType } from "@/app/_types/definitions";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../_lib/store";
import { createPost, patchPosts } from "../../_lib/slices/postsSlice";
import { selectAllImages } from "../../_lib/slices/imagesSlice";
import { useGallery } from "../../_components/gallery";
import { useForm } from "react-hook-form";
import { postFormSchema } from "@/app/_lib/form-shemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCallback, useEffect, useRef } from "react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/app/_components/ui/form";
import { Input } from "@/app/_components/ui/input";
import ImageInput from "@/app/_components/ui/image-input";
import { Button } from "@/app/_components/ui/button";
import Loader from "@/app/_components/ui/loader";

import "quill/dist/quill.snow.css";
import BlocksEditor, { EditorRefObject } from "../../_components/blocks-editor";
import { Textarea } from "@/app/_components/ui/textarea";

interface PostFormProps {
    post?: PostType | null;
    afterSubmit?: () => void;
    isLoading?: boolean;
}


export default function PostEditForm({ post, afterSubmit, isLoading }: PostFormProps) {
    const dispatch = useDispatch<AppDispatch>();

    const images = useSelector(selectAllImages);

    const { setGalleryOpen } = useGallery();

    const blockEditorRef = useRef<EditorRefObject|null>(null);

    const form = useForm<z.infer<typeof postFormSchema>>({
        resolver: zodResolver(postFormSchema),
        defaultValues: {
            title: "",
            excerpt: "",
            content: null,
            cover: null,
        },
    });

    useEffect(() => {
        if (post) {
            form.reset({
                title: post.title,
                excerpt: post.excerpt,
                content: post.content ?? [
                    {
                        type: "text",
                        value: "block de texte"
                    },
                    {
                        type: "image"
                    },
                    {
                        type: "row",
                        children: [
                            {
                                type: 'image'
                            },
                            {
                                type: 'image'
                            },
                            {
                                type: "text",
                                value: "<p>Salut les copains<p>"
                            }
                        ]
                    }
                ],
                cover: post.cover,
                id: post.id,
            });
        }
    }, [post, form]);


    const onSubmit = useCallback(() => {
        const { title, id, excerpt, content, cover } = form.getValues();

        if (!!post) {
            dispatch(patchPosts({
                posts: [{ title, id, excerpt, content, cover }]
            }));
        } else {
            dispatch(createPost({
                post: { title, excerpt, content, cover }
            }));
        }

        if (afterSubmit) afterSubmit();

    }, [post, form, dispatch, afterSubmit]);


    const findImageById = useCallback((id: number) => {
        return images.find(image => image.id === id);
    }, [images]);


    return (
        <Form {...form}>
            <div className="flex flex-col gap-4">
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
                                Entrez le titre de votre publication
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="excerpt"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Résumé</FormLabel>
                            <FormControl>
                                <Textarea {...field} />
                            </FormControl>
                            <FormDescription className="text-xs text-muted-foreground">
                                {'Un résumé est une description courte de votre publication'}
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="cover"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Logo</FormLabel>
                            <FormControl>
                                <ImageInput
                                    className={`${field.value ? 'w-fit' : 'w-48'} h-48`}
                                    onClick={() => setGalleryOpen({
                                        selection: [field.value ?? ""],
                                        onValidateSelection: (selected) => form.setValue("cover", selected?.[0]?.id)
                                    })}
                                    value={findImageById(field.value ?? 0)}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Contenu principal de la publication</FormLabel>
                            <FormMessage />
                            <BlocksEditor data={field.value} ref={blockEditorRef}/*onChange={newValue => { console.log(field.value, newValue);form.setValue('content', newValue);  }}*/ />
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
                        onClick={(e) => {
                            form.setValue('content', blockEditorRef.current?.getRenderedValue())
                            form.handleSubmit(onSubmit)(e)
                        }}>
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