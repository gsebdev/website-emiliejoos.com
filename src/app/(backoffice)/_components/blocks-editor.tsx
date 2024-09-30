import { Button } from "@/app/_components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel } from "@/app/_components/ui/dropdown-menu"
import ImageInput from "@/app/_components/ui/image-input"
import { BlockType, BlockValueByType } from "@/app/_types/definitions"
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu"
import { Plus } from "lucide-react"
import { Dispatch, MouseEventHandler, ReactElement, SetStateAction, createContext, forwardRef, useCallback, useContext, useEffect, useImperativeHandle, useRef, useState } from "react"
import { useQuill } from "react-quilljs"
import { useGallery } from "./gallery"
import { useSelector } from "react-redux"
import { selectImageById } from "../_lib/slices/imagesSlice"
import { FaRegImage } from "react-icons/fa6";
import { FaAlignJustify } from "react-icons/fa6";
import { RxGroup } from "react-icons/rx";
import clsx from "clsx"
import { cn } from "@/app/_lib/client-utils"
import { MdAlignHorizontalLeft, MdAlignHorizontalRight, MdAlignHorizontalCenter, MdCenterFocusStrong, MdOutlinePhotoSizeSelectSmall, MdOutlinePhotoSizeSelectLarge, MdOpenInFull, MdOutlinePhotoSizeSelectActual } from "react-icons/md";
import { Slider } from "@/app/_components/ui/slider"
import { BsArrowsExpand, BsArrowsExpandVertical } from "react-icons/bs";



interface BlocksEditorProps {
    data?: BlockType[] | null,
    onChange?: (data: BlockType[]) => void,
}

interface EditorProviderProps {
    children: React.ReactNode,
    data?: BlockType[] | null,
    onChange?: (data: BlockType[]) => void
}

type EditorParsedBlock = Omit<BlockType, 'children'> & {
    blockID: string,
    parentID?: string,
    children?: string[],
    hasFocusWithin?: boolean
}

export type EditorRefObject = {
    getRenderedValue: () => BlockType[]
}

const genBlockID = () => '_' + Math.random().toString(36).substr(2, 9);

const initialContext: {
    blocks: Map<string, EditorParsedBlock>,
    setBlocks: Dispatch<SetStateAction<Map<string, EditorParsedBlock>>>,
    addBlock: (type: BlockType['type'], args?: { parentID?: string, position?: 'after' | 'before', reference?: string }) => void,
    updateBlock: (blockID: string, value: Partial<EditorParsedBlock>, shouldNotDirty?: boolean) => void,
    deleteBlock: (blockID: string) => void,
    isDirty: boolean,
    setIsDirty: Dispatch<SetStateAction<boolean>>
    activeBlock: string | null,
    setActiveBlock: Dispatch<SetStateAction<string | null>>
} = {
    isDirty: false,
    setIsDirty: () => { },
    blocks: new Map(),
    setBlocks: () => { },
    addBlock: () => { },
    updateBlock: () => { },
    deleteBlock: () => { },
    activeBlock: null,
    setActiveBlock: () => { }
};

const blockEditorContext = createContext(initialContext);

const BlocksEditorContextProvider = forwardRef<EditorRefObject, EditorProviderProps>(({ children, data, onChange }, ref) => {

    const [blocks, setBlocks] = useState<Map<string, EditorParsedBlock>>(new Map());
    const [renderedBlocks, setRenderedBlocks] = useState<BlockType[] | null | undefined>(data);
    const [isDirty, setIsDirty] = useState<boolean>(false);
    const [activeBlock, setActiveBlock] = useState<string | null>(null);

    useImperativeHandle(ref, () => ({
        getRenderedValue: () => renderedBlocks ?? []
    }))

    const updateBlock = useCallback((blockID: string, value: Partial<EditorParsedBlock>, shouldNotDirty?: boolean) => {
        setBlocks(prevBlocks => {
            const newBlocks = new Map(prevBlocks);
            const blockToUpdate = newBlocks.get(blockID);
            if (blockToUpdate) {
                newBlocks.set(blockID, { ...blockToUpdate, ...value });
                return newBlocks;
            }
            return newBlocks;
        });
        if (!shouldNotDirty) setIsDirty(true);
    }, []);

    useEffect(() => {
        const blocksThatShouldHaveFocusWithin: string[] = [];

        if (activeBlock) {
            // find all blocks that should have focus within
            const activeBlockParent = blocks.get(activeBlock)?.parentID;
            let nParentBlock: EditorParsedBlock | undefined = activeBlockParent ? blocks.get(activeBlockParent) : undefined;
            while (nParentBlock) {
                blocksThatShouldHaveFocusWithin.push(nParentBlock.blockID);
                nParentBlock = nParentBlock.parentID ? blocks.get(nParentBlock.parentID) : undefined;
            }
        }

        // update necessary blocks to have focus within
        blocks.forEach((block) => {
            if (blocksThatShouldHaveFocusWithin.includes(block.blockID)) {
                if (!block.hasFocusWithin) updateBlock(block.blockID, { hasFocusWithin: true }, true)
            } else {
                if (block.hasFocusWithin) updateBlock(block.blockID, { hasFocusWithin: false }, true)
            }
        });
    }, [activeBlock, updateBlock, blocks])

    useEffect(() => {
        setRenderedBlocks(data);
        // parse blocks and set initital state
        if (data) {
            const initialBlocks = new Map<string, EditorParsedBlock>();

            const parseBlocks = (b: BlockType, parentID?: string) => {
                const blockID = genBlockID();

                if (b.children && Array.isArray(b.children)) {
                    const parsed: EditorParsedBlock = { ...b, blockID, parentID, children: [] };
                    parsed.children = b.children.map(child => parseBlocks(child, blockID));
                    initialBlocks.set(blockID, parsed);
                } else {
                    initialBlocks.set(blockID, {
                        ...b,
                        blockID,
                        parentID,
                        children: undefined
                    });
                }
                return blockID;
            }

            data.forEach(b => parseBlocks(b));

            setBlocks(initialBlocks);
        }
    }, [data]);

    useEffect(() => {
        if (isDirty) {
            const renderBlocks = (b: EditorParsedBlock): BlockType => {
                if (b.children && Array.isArray(b.children)) {
                    return {
                        type: b.type,
                        value: b.value,
                        children: b.children.map(child => {
                            const childBlock = blocks.get(child);
                            if (childBlock) {
                                return renderBlocks(childBlock);
                            }
                            return {
                                type: 'text',
                                value: '[ERROR] Block not found'
                            };
                        })
                    }
                }
                return {
                    type: b.type,
                    value: b.value,
                    children: b.children
                };
            }
            const rendered = Array.from(blocks.values()).filter(block => !block.parentID).map(editorBlock => renderBlocks(editorBlock));
            setRenderedBlocks(rendered);
            onChange && onChange(rendered);
            setIsDirty(false);
        }
    }, [isDirty, blocks, onChange]);

    const addBlock = useCallback((type: BlockType['type'], args?: { parentID?: string, position?: 'after' | 'before', reference?: string }) => {
        const blockID = genBlockID();
        const { parentID, position, reference } = args ?? {};

        setBlocks(prevBlocks => {
            const newBlocksArray = Array.from(prevBlocks);

            let insertIndex = newBlocksArray.length;
            if (reference) {
                insertIndex = newBlocksArray.findIndex(([id, _]) => id === reference);
                if (position === 'after') insertIndex += 1;
            }

            newBlocksArray.splice(insertIndex, 0, [
                blockID, {
                    type,
                    value: type === 'text' ? '<p>Bloc de texte<p>' : undefined,
                    blockID,
                    parentID,
                    children: type === 'group' ? [] : undefined
                }]);

            // When parentID is provided, we insert the new block as a child of that parent
            if (parentID) {
                const parentBlock = newBlocksArray.find(([id, _]) => id === parentID)?.[1];
                if (parentBlock && Array.isArray(parentBlock.children)) {

                    if (!parentBlock.children.includes(blockID)) {
                        let childrenInsertIndex = parentBlock.children.length;
                        if (reference) {
                            childrenInsertIndex = parentBlock.children.findIndex(id => id === reference);
                            if (position === 'after') childrenInsertIndex += 1;
                        }
                        parentBlock.children.splice(childrenInsertIndex, 0, blockID);
                    }
                }
            }

            return new Map(newBlocksArray);
        });
        setActiveBlock(blockID);
        setIsDirty(true);
    }, []);

    const deleteBlock = useCallback((blockID: string) => {
        let newSelectedBlock: string | null = null;

        setBlocks(prevBlock => {
            const newBlocks = new Map(prevBlock);
            const blockToDelete = newBlocks.get(blockID);

            if (!blockToDelete) return newBlocks;

            if(blockToDelete?.parentID) newSelectedBlock = blockToDelete.parentID;

            const IDsToDelete: string[] = []

            const getChildrenIDsRecursive = (bID: string) => {
                const b = newBlocks.get(bID);
                if (b && b.children && Array.isArray(b.children)) {
                    for (const childID of b.children) {
                        getChildrenIDsRecursive(childID);
                    }
                }
                IDsToDelete.push(bID);
            }

            const deleteInParentChildren = () => {
                if (blockToDelete && blockToDelete.parentID) {
                    const parentBlock = newBlocks.get(blockToDelete.parentID);
                    if (parentBlock && parentBlock.children) {
                        parentBlock.children = parentBlock.children.filter(childID => childID !== blockID);
                    }
                }
            }

            const deleteBlockWithchildren = () => {
                getChildrenIDsRecursive(blockID);
                deleteInParentChildren();
                IDsToDelete.forEach(ID => newBlocks.delete(ID))
            }

            deleteBlockWithchildren();

            return newBlocks;
        });
        setActiveBlock(newSelectedBlock);
        setIsDirty(true);
    }, []);

    return (
        <blockEditorContext.Provider value={{ blocks, setBlocks, isDirty, setIsDirty, addBlock, updateBlock, deleteBlock, activeBlock, setActiveBlock }}>
            {children}
        </blockEditorContext.Provider>
    )
});

BlocksEditorContextProvider.displayName = 'BlocksEditorContextProvider';

const useEditor = () => useContext(blockEditorContext);

const AddBlockContextMenu: React.FC<{ className?: string, args?: { parentID?: string, position?: 'after' | 'before', reference?: string }, children: ReactElement }> = ({ className, children, args }) => {
    const { addBlock } = useEditor();

    return (
        <div className={cn(
            "m-8",
            className
        )}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    {children}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Choisir un type</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => addBlock('text', args)}><FaAlignJustify className="mr-2" />Texte</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addBlock('image', args)}><FaRegImage className="mr-2" />Image</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addBlock('group', args)}><RxGroup className="mr-2" />Groupe</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addBlock('space', args)}><RxGroup className="mr-2" />Espace</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}

const BlockEditorContent: React.FC = () => {

    const { blocks, setActiveBlock } = useEditor();
    const editorRef = useRef<HTMLDivElement>(null);

    const handleClickOutside = useCallback((e: MouseEvent) => {
        if (editorRef.current) {
            const rect = editorRef.current.getBoundingClientRect();
            const x = e.clientX;
            const y = e.clientY;
            const margin = 100;

            if (
                !(
                    x >= rect.left - margin &&
                    x <= rect.right + margin &&
                    y >= rect.top - margin &&
                    y <= rect.bottom + margin
                )
            ) {
                setActiveBlock(null);
            }
        }
    }, [setActiveBlock]);

    useEffect(() => {
        document.body.addEventListener('click', handleClickOutside);
        return () => {
            document.body.removeEventListener('click', handleClickOutside);
        };
    }, [handleClickOutside]);


    return (
        <div ref={editorRef} className={clsx(
            "border-2 border-dashed rounded-md p-4 grid items-center justify-items-center bg-background",
            blocks.size === 0 && "min-h-72"
        )}>
            {!!blocks &&
                Array.from(blocks.values()).filter(block => !block.parentID).map(block => (
                    <Block key={block.blockID} block={block} />
                ))
            }
            {blocks.size === 0 &&
                <AddBlockContextMenu>
                    <Button variant="outline"><Plus className="mr-2" />Ajouter du contenu</Button>
                </AddBlockContextMenu>
            }
        </div>
    )
}



const Block: React.FC<{ block: EditorParsedBlock | undefined, className?: string }> = ({ block, className }) => {
    const { blocks, activeBlock, setActiveBlock, updateBlock, deleteBlock } = useEditor();

    const { blockID, hasFocusWithin, parentID } = block ?? {};
    const isActive = activeBlock === blockID;

    const handleClickCapture: MouseEventHandler<HTMLDivElement> = useCallback((e) => {
        if (activeBlock !== blockID && !hasFocusWithin) {
            e.preventDefault();
            e.stopPropagation();

            setActiveBlock(blockID ?? null);
        }
    }, [activeBlock, hasFocusWithin, blockID, setActiveBlock]);

    if (!block) return null;

    return (
        <div
            className={cn(clsx(
                'relative border-2 rounded-md transition-colors p-1 m-1 w-full grid h-full',
                !hasFocusWithin && !activeBlock && (!parentID || blocks.get(parentID)?.hasFocusWithin) ? 'hover:border-cyan-200' : '',
                activeBlock === blockID ? 'border-cyan-600' : 'border-transparent',
                (!hasFocusWithin && !isActive && activeBlock) && 'opacity-30'

            ), className)}
            onClickCapture={handleClickCapture}
        >
            {!!isActive &&
                <div className="absolute z-20 top-2 left-1/2 -translate-x-1/2 -translate-y-24 md:-translate-y-16 grid gap-2 justify-items-center">
                    <AddBlockContextMenu
                        args={{ position: 'before', reference: blockID, parentID }}
                        className="m-0"
                    >
                        <Button variant={'outline'}><Plus className="md:mr-2" /><span className="hidden md:block">Ajouter avant</span></Button>
                    </AddBlockContextMenu>


                </div>
            }

            {block.type === 'text' && <TextBlock block={block} isActive={isActive} />}
            {block.type === 'image' && <ImageBlock block={block} isActive={isActive} />}
            {block.type === 'group' && <RowBlock block={block} isActive={isActive} />}
            {block.type === 'space' && <SpaceBlock block={block} isActive={isActive} />}

            {!!isActive &&
                <div className="absolute z-20 bottom-2 left-1/2 -translate-x-1/2 translate-y-24 grid gap-2 justify-items-center">
                    <button
                        className="px-4 md:px-2 py-2 md:py-1 text-xs bg-red-500 rounded-md text-white"
                        onClick={() => deleteBlock(blockID)}
                    >
                        Supprimer<span className="hidden md:inline"> l&apos;élément</span>
                    </button>
                    <AddBlockContextMenu
                        args={{ position: 'after', reference: blockID, parentID }}
                        className="m-0"
                    >
                        <Button variant={'outline'}><Plus className="md:mr-2" /><span className="hidden md:block">Ajouter après</span></Button>
                    </AddBlockContextMenu>


                </div>
            }
        </div>
    )
}

const TextBlock: React.FC<{ block: EditorParsedBlock, isActive?: boolean }> = ({ block, isActive }) => {

    const { updateBlock } = useEditor();

    const { blockID, value } = block;

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
        formats: ['header', 'bold', 'italic', 'underline', 'link', 'align', 'list', 'indent'],
    });

    useEffect(() => {
        if (quill) {
            if (value !== quill.root.innerHTML && typeof value === 'string') quill.clipboard.dangerouslyPasteHTML(value);
            quill.on(
                'text-change',
                () => { updateBlock(blockID, { value: quill.root.innerHTML }) }
            )

        }
    }, [quill, value, updateBlock, blockID]);


    return (
        <>
            <div className={clsx(
                "grid min-h-48",
                isActive ? "visible" : 'invisible'
            )}>
                <div ref={quillRef} />
            </div>
            <div className={clsx(
                "absolute w-full h-full border border-dotted",
                !isActive ? "ql-snow visible" : "invisible"
            )}>
                <div className={"ql-editor"} dangerouslySetInnerHTML={{ __html: String(value ?? '') }} />
            </div>

        </>);
}

const ImageBlock: React.FC<{ block: EditorParsedBlock, isActive?: boolean }> = ({ block, isActive }) => {

    const { updateBlock } = useEditor();

    const { blockID, value } = block as Omit<EditorParsedBlock, 'value'> & { value: BlockValueByType<{ type: 'image' }> };

    const { imageId, aspect, size, align } = value ?? {};

    const image = useSelector(selectImageById(Number(imageId)))

    const { setGalleryOpen } = useGallery();

    const updateImageBlock = (newValue: Partial<BlockValueByType<{ type: 'image' }>>) => {
        updateBlock(blockID, {
            value: {
                ...value,
                ...newValue
            }
        })
    };

    const sizes = ['small', 'medium', 'large', 'full'];
    const sizesIcons = [
        <MdOutlinePhotoSizeSelectSmall key={"sizeSmall"} />,
        <MdOutlinePhotoSizeSelectLarge key={"sizeLarge"}/>,
        <MdOutlinePhotoSizeSelectActual key={"sizeActual"}/>,
        <MdOpenInFull key={"sizeFull"}/>
    ];

    const aspects = ['fill', '4/3', '3/2', '16/9', '1/1'];
    const aspectsLabels = [<MdOpenInFull key={"aspectFull"}/>, '4:3', '3:2', '16:9', '1/1'];

    const aligns = ['left', 'center', 'right'];
    const alignsIcons = [
        <MdAlignHorizontalLeft key={"alignLeft"}/>,
        <MdAlignHorizontalCenter key={"alignCenter"}/>,
        <MdAlignHorizontalRight key={"alignRight"}/>
    ];


    return (
        <div className="relative">
            <div className={cn(
                "absolute grid gap-y-2 z-10 top-1/2 -translate-y-1/2 -translate-x-1/2 md:translate-x-0",
                !isActive ? "hidden" : ''
            )}>
                {sizes.map((value, index) => (
                    <Button
                        key={value}
                        variant={size === value ? undefined : "outline"}
                        onClick={() => updateImageBlock({ size: size === value ? undefined : value })}
                    >
                        {sizesIcons[index]}
                    </Button>
                ))}
            </div>
            <div className={cn(
                "absolute top-1/2 right-0 translate-x-1/2 md:translate-x-0 -translate-y-1/2 z-10 grid gap-y-2",
                !isActive ? "hidden" : ''
            )}>
                {
                    aspects.map((value, index) => (
                        <Button
                            key={value}
                            variant={aspect === value ? undefined : "outline"}
                            onClick={() => updateImageBlock({ aspect: aspect === value ? undefined : value })}
                        >
                            {aspectsLabels[index]}
                        </Button>
                    ))
                }
            </div>
            <div className={cn(
                "absolute left-1/2 -translate-x-1/2 -translate-y-full md:translate-y-0 z-10 flex gap-x-2",
                !isActive ? "hidden" : ''
            )}>
                {
                    aligns.map((value, index) => (
                        <Button
                            key={value}
                            variant={align === value ? undefined : "outline"}
                            onClick={() => updateImageBlock({ align: align === value ? undefined : value })}
                        >
                            {alignsIcons[index]}
                        </Button>
                    ))
                }
            </div>
            <ImageInput
                className={cn(
                    "max-w-full w-full h-full",
                    !aspect && !imageId ? "min-h-72" : '',
                    aspect === "fill" ? 'absolute' : '',
                    aspect === '4/3' ? 'aspect-[4/3]' : '',
                    aspect === '3/2' ? 'aspect-[3/2]' : '',
                    aspect === '16/9' ? 'aspect-video' : '',
                    aspect === '1/1' ? 'aspect-square' : '',
                    size === 'large' ? 'max-w-5xl' : '',
                    size === 'medium' ? 'max-w-lg' : '',
                    size === 'small' ? 'max-w-xs' : '',
                    align === 'left' ? 'justify-self-start' : '',
                    align === 'center' ? 'justify-self-center' : '',
                    align === 'right' ? 'justify-self-end' : ''

                )
                }
                value={image}
                onClick={() => setGalleryOpen({
                    selection: [Number(imageId)],
                    onValidateSelection: (selected) => {
                        if (!selected?.[0]?.id) return;
                        updateBlock(blockID, {
                            value: {
                                ...value,
                                imageId: selected?.[0].id
                            }
                        })
                    }
                })
                }
            />
        </div>

    )

}

const RowBlock: React.FC<{ block: EditorParsedBlock, isActive?: boolean }> = ({ block, isActive }) => {
    const { blocks, setActiveBlock, updateBlock } = useEditor();

    const { blockID, hasFocusWithin, value } = block as Omit<EditorParsedBlock, 'value'> & { value: BlockValueByType<{ type: 'group' }> };

    return (
        <div className={clsx(
            "min-h-48 p-2 grid grid-flow-row justify-center items-center border-2 border-dashed border-grey rounded-md w-full h-full",
            block.hasFocusWithin ? 'border-cyan-400' : 'border-grey',
            value === "vertical" ? '' : 'md:grid-flow-col md:auto-cols-1fr',
        )}>
            {!!block?.children &&
                block.children.map(childID => (
                    <Block className="grow basis-1/5 shrink" key={childID} block={blocks.get(childID)} />
                ))
            }
            {!!(isActive && !block.children?.length) &&
                <AddBlockContextMenu
                    args={{ parentID: blockID }}
                    className="m-0 absolute z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                >
                    <Button variant="outline"><Plus className="mr-2" />Ajouter dedans</Button>
                </AddBlockContextMenu>
            }
            {!!isActive &&
                <div className="absolute grid gap-2 top-0 left-0 z-20">
                    <Button variant={value !== "vertical" ? undefined : "outline"} onClick={() => updateBlock(blockID, { value: "horizontal" })}><BsArrowsExpandVertical /></Button>
                    <Button variant={value === "vertical" ? undefined : "outline"} onClick={() => updateBlock(blockID, { value: "vertical" })}><BsArrowsExpand /></Button>
                </div>
            }
            {(hasFocusWithin && !isActive) && <Button variant="outline" className="absolute z-10 -bottom-4" onClick={() => setActiveBlock(blockID)}><MdCenterFocusStrong className="mr-2" />Sélectionner le groupe</Button>}
        </div>
    )
}

const SpaceBlock: React.FC<{ block: EditorParsedBlock, isActive?: boolean }> = ({ block, isActive }) => {

    const { updateBlock } = useEditor();

    const { blockID, value } = block as Omit<EditorParsedBlock, 'value'> & { value: BlockValueByType<{ type: 'space' }> };

    return (
        <div
            className="relative flex justify-center items-center h-full w-full"
            style={{
                minHeight: `${value ?? 8}px`,
                minWidth: `${value?? 8}px`,
            }}>

            <div className={cn(
                "absolute top-0 left-0 w-full",
                !!isActive ? 'visible' : 'hidden'
            )}>
                <Slider defaultValue={[value ?? 8]} max={320} min={4} step={4} onValueChange={([val]) => updateBlock(blockID, { value: val })}/>
            </div>

            <p>Espacement de {value ?? 8} pixels</p>
        </div>
    )
}

export default forwardRef<EditorRefObject, BlocksEditorProps>(function BlocksEditor({ data, onChange }, ref) {
    return (
        <BlocksEditorContextProvider data={data} onChange={onChange} ref={ref}>
            <BlockEditorContent />
        </BlocksEditorContextProvider>
    )
});

