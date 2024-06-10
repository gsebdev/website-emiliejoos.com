import { ImageUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import Image from "next/image"
import { ImageType } from "@/lib/definitions"

type Props = {
    onChange?: (file: File[]) => void
    onClick?: () => void
    className?: string,
    fileTypes?: string[],
    maxSize?: number,
    value?: ImageType | string,
    multipleSelect?: boolean
}
export default function ImageInput({ onChange = () => { }, onClick, className, fileTypes, maxSize, value, multipleSelect }: Props) {
    const [error, setError] = useState<string | null>(null)
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files)
            files.forEach(file => {
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
            onChange(files)
        }
    }
    return (
        <div>
            <div
                onClick={onClick}
                className={cn(
                    `cursor-pointer relative h-64 ${value ? "fit-content" : "w-64"} border-2 border-dashed rounded-md flex flex-col justify-between items-center p-2 `,
                    className
                )}
            >
                {
                    value ?
                        <>{
                            (typeof value === 'string' && value.startsWith('http')) ?
                                <Image
                                    src={value}
                                    fill
                                    className="rounded-md"
                                    alt=""
                                /> :
                                <Image
                                    src={(value as ImageType).src}
                                    className="w-full h-full object-cover rounded-md"
                                    alt={"selected image: " + (value as ImageType).alt}
                                    height={(value as ImageType).height}
                                    width={(value as ImageType).width}
                                    placeholder="blur"
                                    sizes="(max-width: 576px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                    blurDataURL={process.env.IMAGE_BLUR_DATA}
                                />
                        }</>
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
            {error && <div className="text-xstext-red-500">{error}</div>}
        </div>
    )
}