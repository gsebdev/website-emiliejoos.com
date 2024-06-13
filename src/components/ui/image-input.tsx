import { ImageUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { ImageType } from "@/lib/definitions"

interface BaseProps {
    onClick?: () => void;
    className?: string;
    fileTypes?: string[];
    maxSize?: number;
    multipleSelect?: boolean;
    hasURLInput?: boolean;
}

// Define Props type with conditional onChange and value
interface URLInputProps extends BaseProps {
    hasURLInput: true;
    onChange?: (value: File[] | string) => void;
    value?: ImageType | string;
}

interface FileInputProps extends BaseProps {
    hasURLInput?: false;
    onChange?: (value: File[]) => void;
    value?: ImageType;
}

export default function ImageInput({ onChange, onClick, className, fileTypes, maxSize, value, multipleSelect, hasURLInput }: URLInputProps | FileInputProps) {

    const [error, setError] = useState<string | null>(null)
    const [stateValue, setStateValue] = useState<string | undefined | ImageType>(undefined)
    const [urlInputValue, setUrlInputValue] = useState<string>("");

    const urlCheck = useMemo(() => /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6}(\/[^\s]*)?$/, []);

    useEffect(() => {
        if (value) {
            let valid = false

            // check if valid url
            if (typeof value === 'string' && urlCheck.test(value)) {
                valid = true
                setUrlInputValue(value);
            }

            //check if valid image object
            if (typeof value === 'object' && !!value.src && !!value.height && !!value.width && typeof value.alt === 'string') {
                valid = true
                setUrlInputValue('');
            }

            if (valid) {
                setStateValue(() => value)
            }
        }
    }, [value, urlCheck])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files)
            files.forEach(file => {
                if (!(file instanceof File)) {
                    setError("Seuls les fichiers images sont acceptées")
                    return;
                }
                if (maxSize && file.size > maxSize) {
                    setError(`Taille max ${maxSize / 1024 / 1024}Mo`)
                    return;
                }
                if (!file.type.startsWith('image')) {
                    setError('Seuls les images sont acceptées')
                    return;
                }
                if (fileTypes && !fileTypes.includes(file.name.split('.').pop() ?? '')) {
                    setError(`Seuls les formats : ${fileTypes.join(', ')} sont acceptés`);
                    return;
                }
            })
            onChange?.(files)
        }
    }

    const handleChangeURL = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUrlInputValue(e.target.value)
        if (!urlCheck.test(e.target.value)) {
            setError("URL invalide")
        } else {
            setError(null);
            setStateValue(e.target.value);
            hasURLInput && onChange?.(e.target.value);
        }
    }

    return (
        <div>
            <div
                onClick={onClick}
                className={cn(
                    `cursor-pointer relative h-64 ${stateValue ? "w-fit" : "w-64"} border-2 border-dashed rounded-md flex flex-col justify-between items-center p-2 `,
                    className
                )}
            >
                {
                    !!stateValue ?
                        <>
                            {
                                typeof stateValue === 'string' &&
                                <img
                                    src={stateValue as string | undefined}
                                    className="w-full h-full object-cover rounded-md"
                                    alt=""
                                />
                            }
                            {
                                typeof stateValue === 'object' &&
                                <Image
                                    src={(stateValue as ImageType).src}
                                    className="w-full h-full object-cover rounded-md"
                                    alt={"selected image: " + (stateValue as ImageType).alt}
                                    height={(stateValue as ImageType).height}
                                    width={(stateValue as ImageType).width}
                                    placeholder="blur"
                                    sizes="(max-width: 576px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                    blurDataURL={process.env.IMAGE_BLUR_DATA}
                                />
                            }
                        </>
                        :
                        <>
                            <ImageUp className="w-24 h-24 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                            <h3 className="text-xs">{'Sélectionnez une image'}</h3>
                            {
                                !onClick && maxSize &&
                                <p className="text-xs">Taille maximum {maxSize / 1024 / 1024}Mo</p>}
                            {
                                !onClick &&
                                <input
                                    type="file"
                                    multiple={multipleSelect}
                                    className="absolute w-full h-full left-0 top-0 cursor-pointer opacity-0"
                                    accept="image/*"
                                    onChange={handleChange}
                                />
                            }
                        </>
                }
            </div>
            { hasURLInput &&
                <div className="my-2">
                    <input
                        type="text"
                        className="w-48 border border-gray-300 rounded-md p-2 text-xs"
                        placeholder="Ou entrez le lien de l'image"
                        onChange={handleChangeURL}
                        value={urlInputValue}
                    />
                </div>
            }
            {error && <div className="text-xs text-red-500">{error}</div>}
        </div>
    )
}