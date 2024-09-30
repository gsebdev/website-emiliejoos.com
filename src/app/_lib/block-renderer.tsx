import Image from "next/image";
import { BlockType, ImageType } from "../_types/definitions";
import { getImagesFromDB } from "./db";

export const RenderBlocks: React.FC<{ content: BlockType[] }> = ({ content }) => {


    const Render: React.FC<{ block: BlockType, noMargin?: boolean }> = async ({ block, noMargin }) => {
        // space Block
        if (block.type === 'space' && typeof block.value === 'number') return <div
            className={`h-full w-full`}
            style={{
                minHeight: `${block.value ?? 8}px`,
                minWidth: `${block.value ?? 8}px`,
            }}
        />
        // Text Block
        if (block.type === 'text' && typeof block.value === 'string') return <div dangerouslySetInnerHTML={{ __html: block.value }} className={`text-xl ${noMargin ? '' : 'py-2'}`} />

        // Image Block
        if (block.type === 'image' && typeof block.value === 'object') {
            const { imageId, align, aspect, size } = block.value;
            const [image]: [ImageType] = await getImagesFromDB(imageId);
            return (
                <div className={`relative overflow-hidden w-full h-full grid${noMargin ? '' : ' py-2'} ${aspect === '16/9' ? 'aspect-video' : aspect === '4/3' ? 'aspect-[4/3]' : aspect === '3/2' ? 'aspect-[3/2]' : aspect === 'square' ? 'aspect-square' : ''} ${size === 'small' ? 'max-w-xs' : size === 'medium' ? 'max-w-screen-lg' : size === 'large' ? 'max-w-5xl' : 'max-w-full'}`}>
                    <Image
                        src={image.src}
                        alt={image.alt ?? ''}
                        fill={!!aspect}
                        height={!aspect ? image.height : undefined}
                        width={!aspect ? image.width : undefined}
                        placeholder="blur"
                        blurDataURL={image.blur_data_image ?? ''}
                        className={`
                            object-cover w-full h-full ${align === 'left' ? 'justify-self-start' : align === 'right' ? 'justify-self-end' : 'justify-self-center'}`}
                    />
                </div>);
        }
        // Row Block
        if (block.type === 'group') return <div className={`grid grid grid-flow-row ${block.value !== 'vertical' && 'md:grid-flow-col md:auto-cols-1fr'} ${noMargin ? '' : 'py-2 '}gap-4`}>{block.children?.map((child, index) => {
            return <Render block={child} noMargin key={index} />
        })}</div>

        return null;
    }


    return (
        <>
            {
                content.map((block: BlockType, index: number) => {
                    return <Render block={block} key={index} />
                })}
        </>
    )
};