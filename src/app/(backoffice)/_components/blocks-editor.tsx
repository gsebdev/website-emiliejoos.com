import { Button } from "@/app/_components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel } from "@/app/_components/ui/dropdown-menu"
import ImageInput from "@/app/_components/ui/image-input"
import { BlockType } from "@/app/_types/definitions"
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu"
import { Plus } from "lucide-react"
import { Dispatch, MouseEventHandler, MutableRefObject, ReactElement, RefObject, SetStateAction, createContext, forwardRef, useCallback, useContext, useEffect, useImperativeHandle, useRef, useState } from "react"
import { useQuill } from "react-quilljs"
import { useGallery } from "./gallery"
import { useSelector } from "react-redux"
import { selectImageById } from "../_lib/slices/imagesSlice"
import { FaRegImage } from "react-icons/fa6";
import { FaAlignJustify } from "react-icons/fa6";
import { RxGroup } from "react-icons/rx";
import clsx from "clsx"
import { cn } from "@/app/_lib/client-utils"
import { MdCenterFocusStrong } from "react-icons/md";

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
            console.log('parse')

            setBlocks(initialBlocks);
        }
    }, [data]);

    useEffect(() => {
        if (isDirty) {
            const renderBlocks = (b: EditorParsedBlock): BlockType => {
                if (b.children && Array.isArray(b.children)) {
                    return {
                        type: b.type,
                        value: undefined,
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
                    children: type === 'row' ? [] : undefined
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

    const deleteBlock = useCallback((blockID: string) => {
        setBlocks(prevBlock => {
            const newBlocks = new Map(prevBlock);
            const blockToDelete = newBlocks.get(blockID);

            if (!blockToDelete) return newBlocks;

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
                    <DropdownMenuItem onClick={() => addBlock('row', args)}><RxGroup className="mr-2" />Row</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}

const BlockEditorContent: React.FC = () => {

    const { blocks, setActiveBlock } = useEditor();
    const editorRef = useRef<HTMLDivElement>(null);

    const handleClickOutside = useCallback((e: Event) => {
        if (editorRef.current && !editorRef.current.contains(e.target as Node|null)) {
            setActiveBlock(null);
        }
    }, [setActiveBlock]);

    useEffect(() => {
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [handleClickOutside]);


    return (
        <div ref={editorRef} className="border-2 border-dashed rounded-md p-4 min-h-72 grid items-center justify-items-center">
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

            const prevBlock = blocks.get(activeBlock ?? '');
            if (prevBlock && prevBlock.parentID && prevBlock.parentID !== parentID) {
                updateBlock(prevBlock.parentID, { hasFocusWithin: false }, true);
            }

            setActiveBlock(blockID ?? null);
            if (parentID) updateBlock(parentID, { hasFocusWithin: true }, true);
        }
    }, [activeBlock, updateBlock, hasFocusWithin, blockID, parentID, setActiveBlock, blocks]);

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
                <div className="absolute z-20 top-2 left-1/2 -translate-x-1/2 -translate-y-full grid gap-2 justify-items-center">
                    <AddBlockContextMenu
                        args={{ position: 'before', reference: blockID, parentID }}
                        className="m-0"
                    >
                        <Button variant={'outline'}><Plus className="mr-2" />Ajouter avant</Button>
                    </AddBlockContextMenu>


                </div>
            }

            {block.type === 'text' && <TextBlock block={block} isActive={isActive} />}
            {block.type === 'image' && <ImageBlock block={block} isActive={isActive} />}
            {block.type === 'row' && <RowBlock block={block} isActive={isActive} />}

            {!!isActive &&
                <div className="absolute z-20 bottom-2 left-1/2 -translate-x-1/2 translate-y-full grid gap-2 justify-items-center">
                    <AddBlockContextMenu
                        args={{ position: 'after', reference: blockID, parentID }}
                        className="m-0"
                    >
                        <Button variant={'outline'}><Plus className="mr-2" />Ajouter après</Button>
                    </AddBlockContextMenu>
                    <button
                        className="px-2 py-1 text-xs bg-red-500 rounded-md text-white w-fit"
                        onClick={() => deleteBlock(blockID)}
                    >
                        Supprimer l&apos;élément
                    </button>

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
                "contents",
                isActive ? "visible" : 'invisible'
            )}>
                <div ref={quillRef} />
            </div>

            <div className={clsx(
                "absolute",
                !isActive ? "visible" : 'invisible'
            )} dangerouslySetInnerHTML={{ __html: String(value ?? '') }} />
        </>);
}

const ImageBlock: React.FC<{ block: EditorParsedBlock, isActive?: boolean }> = ({ block, isActive }) => {

    const { updateBlock } = useEditor();

    const { blockID, value } = block;

    const image = useSelector(selectImageById(Number(value)))

    const { setGalleryOpen } = useGallery();

    return <ImageInput
        className="w-full"
        value={image}
        onClick={() => setGalleryOpen({
            selection: [Number(value)],
            onValidateSelection: (selected) => {
                if (!selected?.[0]?.id) return;
                updateBlock(blockID, { value: selected?.[0].id })
            }
        })
        }
    />
}

const RowBlock: React.FC<{ block: EditorParsedBlock, isActive?: boolean }> = ({ block, isActive }) => {
    const { blocks, setActiveBlock } = useEditor();

    const { blockID, hasFocusWithin } = block;

    return (
        <div className={clsx(
            "min-h-48 p-2 flex flex-wrap justify-center items-center border-2 border-dashed border-grey rounded-md w-full h-fit",
            block.hasFocusWithin ? 'border-cyan-400' : 'border-grey'
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
            {(hasFocusWithin && !isActive) && <Button variant="outline" className="absolute z-10 -bottom-4" onClick={() => setActiveBlock(blockID)}><MdCenterFocusStrong className="mr-2" />Sélectionner la ligne</Button>}
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

