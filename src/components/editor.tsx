import Quill, { QuillOptions } from "quill";
import { Delta, Op } from "quill/core";
import { cn } from "@/lib/utils";
import { useRef, useEffect, MutableRefObject, useLayoutEffect, useState } from "react";
import { PiTextAa } from "react-icons/pi";
import { MdSend } from "react-icons/md";
import { FilePlus, ImageIcon, Smile, XIcon } from "lucide-react";
import { Button } from "./ui/button";
import Image from "next/image";

import { Hint } from "./hint";
import { EmojiPopover } from "./emoji-popover";

import "quill/dist/quill.snow.css";

// import { useLogActivity } from "@/features/activity/api/use-log-activity";
// import { useCurrentUser } from "@/features/auth/api/use-current-user";
// import { useWorkspaceId } from "@/hooks/use-workspace-id";
// import { useCurrentMember } from "@/features/members/api/use-current-member";

type EditorValue = {
    image: File | null;
    body: string;
    files?: File[];
}
 
interface EditorProps {
    onSubmit: (value: EditorValue) => void;
    onCancel?: () => void;
    placeholder?: string;
    defaultValue?: Delta | Op[];
    disabled?: boolean;
    innerRef?: MutableRefObject<Quill | null>;
    variant?: "create" | "update";
};

const Editor = ({ 
    variant = "create",
    onSubmit,
    onCancel,
    placeholder = "Write something...",
    defaultValue = [],
    disabled = false,
    innerRef,
}: EditorProps) => {
    // const workspaceId = useWorkspaceId();
    // const currentMember = useCurrentMember({ workspaceId });
    // const currentUser = useCurrentUser();
    // const  handleLogActivity  = useLogActivity();

    const [text, setText] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [files, setFiles] = useState<File[]>([]);
    const [isToolbarVisible, setIsToolbarVisible] = useState(true);
    
    const submitRef = useRef(onSubmit);
    const placeholderRef = useRef(placeholder);
    const quillRef = useRef<Quill | null>(null);
    const defaultValueRef = useRef(defaultValue);
    const containerRef = useRef<HTMLDivElement>(null);
    const disabledRef = useRef(disabled);
    const imageElementRef = useRef<HTMLInputElement>(null);
    const fileElementRef = useRef<HTMLInputElement>(null);

    useLayoutEffect(() => {
        submitRef.current = onSubmit;
        placeholderRef.current = placeholder;
        defaultValueRef.current = defaultValue;
        disabledRef.current = disabled;
    });

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const editorContainer = container.ownerDocument.createElement("div");
        container.appendChild(editorContainer);

        const options: QuillOptions = {
            theme: "snow",
            placeholder: placeholderRef.current,
            modules: {
                toolbar: [
                    ["bold", "italic", "strike"],
                    ["link", "blockquote", "code-block"],
                    [{ list: "ordered" }, { list: "bullet" }],
                    [{ header: [1, 2, 3, false] }],
                ],
                keyboard: {
                    bindings: {
                        enter: {
                            key: "Enter",
                            handler: () => {
                                const text = quill.getText();
                                const addedImage = imageElementRef.current?.files?.[0] || null;

                                const isEmpty = !addedImage && text.replace(/<(.|\n)*?>/g, "").trim().length === 0;

                                if (isEmpty) {
                                    return;
                                }

                                const body = JSON.stringify(quill.getContents());

                                submitRef.current?.({
                                    body,
                                    image: addedImage,
                                    files: Array.from(fileElementRef.current?.files || []),
                                })

                                return;
                            }
                        },
                        shift_enter: {
                            key: "Enter",
                            shiftKey: true,
                            handler: () => {
                                quill.insertText(quill.getSelection()?.index || 0, "\n");
                            }
                        }
                    }
                },
            },
        };

        const quill = new Quill(editorContainer, options);
        quillRef.current = quill;
        quillRef.current.focus();

        if(innerRef) {
            innerRef.current = quill;
        }

        quill.setContents(defaultValueRef.current);
        setText(quill.getText());

        quill.on(Quill.events.TEXT_CHANGE, () => {
            setText(quill.getText());
        });

        return () => {
            quill.off(Quill.events.TEXT_CHANGE);

            if(container) {
                container.innerHTML = "";
            }
            if(quillRef.current) {
                quillRef.current = null;
            }
            if(innerRef) {
                innerRef.current = null;
            }
        };
    }, [innerRef]);

    const toggleToolbar = () => {
        setIsToolbarVisible((current) => !current);
        const toolbarElement = containerRef.current?.querySelector(".ql-toolbar");
        
        if(toolbarElement) {
            toolbarElement.classList.toggle("hidden");
        }
    };

    const onEmojiSelect = async (emojiValue: string) => {
        const quill = quillRef.current;

        quill?.insertText(quill?.getSelection()?.index || 0, emojiValue);
        
        // await handleLogActivity({
        //     workspaceId,
        //     initiatorMemberId: currentMember.data?._id,
        //     actionType: "reaction",
        //     actionDetails: emojiValue,
        //     initiatorName: currentUser.data?.name || "Unknown User",
        // })
    };

    const isEmpty = !image && text.replace(/<(.|\n)*?>/g, "").trim().length === 0;

    return (
        <div className="flex flex-col">
            <input
                type="file"
                accept="image/*"
                ref={imageElementRef}
                onChange={(e) => setImage(e.target.files![0])}
                className="hidden"
            />
            <input
                type="file"
                multiple
                ref={fileElementRef}
                onChange={(e) => setFiles(Array.from(e.target.files || []))}
                className="hidden"
            />
            <div className={cn(
                "flex flex-col border border-slate-200 rounded-md overflow-hidden focus-within:border-slate-300 focus-within:shadow-sm transition bg-white",
                disabled && "opacity-50"
            )}>
                <div 
                className="h-full ql-custom"
                    ref={containerRef} 
                />
                {!!image && (
                    <div className="p-2">
                        <div className="relative size-[62px] flex items-center justify-center group/image">
                            <Hint label="Remove image">
                                <button
                                    onClick={() => {
                                        setImage(null);
                                        imageElementRef.current!.value = "";
                                    }}
                                    className="hidden group-hover/image:flex rounded-full bg-black/70 hover:bg-black absolute -top-2.5 -right-2.5 text-white size-6 z-[4] border-2 border-white items-center justify-center"
                                >
                                    <XIcon className="size-3.5" />
                                </button>
                            </Hint>
                            <Image 
                                src={URL.createObjectURL(image)}
                                alt="Uploaded image"
                                fill
                                className="rounded-xl overflow-hidden border object-cover"
                            />
                        </div>
                    </div>
                )}
                {files.length > 0 && (
                    <div className="p-2 space-y-2">
                        {files.map((file, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 p-2 rounded">
                                <span className="text-sm text-slate-700 dark:text-slate-300 truncate">{file.name}</span>
                                <Hint label="Remove file">
                                    <button
                                        onClick={() => {
                                            const newFiles = files.filter((_, i) => i !== idx);
                                            setFiles(newFiles);
                                            if (fileElementRef.current) {
                                                const dt = new DataTransfer();
                                                newFiles.forEach(f => dt.items.add(f));
                                                fileElementRef.current.files = dt.files;
                                            }
                                        }}
                                        className="text-red-500 hover:text-red-600"
                                    >
                                        <XIcon className="size-4" />
                                    </button>
                                </Hint>
                            </div>
                        ))}
                    </div>
                )}
                <div className="flex px-2 pb-2 z-[5]">
                    <Hint label={isToolbarVisible ? "Hide formatting" : "Show formatting"}>
                        <Button
                            disabled={disabled}
                            size={"iconSm"}
                            variant={"ghost"}
                            onClick={toggleToolbar}
                        >
                            <PiTextAa className="size-4"/>
                        </Button>
                    </Hint>
                    <EmojiPopover
                        onEmojiSelect={onEmojiSelect}
                    >
                        <Button
                            disabled={disabled}
                            size={"iconSm"}
                            variant={"ghost"}
                        >
                            <Smile className="size-4"/>
                        </Button>
                    </EmojiPopover>
                    {variant === "create" && (
                        <>
                        <Hint label="Image">
                            <Button
                                disabled={disabled}
                                size={"iconSm"}
                                variant={"ghost"}
                                onClick={() => imageElementRef.current?.click()}
                            >
                                <ImageIcon className="size-4"/>
                            </Button>
                        </Hint>
                        <Hint label="File">
                            <Button
                                disabled={disabled}
                                size={"iconSm"}
                                variant={"ghost"}
                                onClick={() => fileElementRef.current?.click()}
                            >
                                <FilePlus className="size-4"/>
                            </Button>
                        </Hint>
                        </>
                    )}
                    {variant === "update" && (
                        <div className="ml-auto flex items-center gap-x-20">
                            <Button
                                variant={"outline"}
                                size={"sm"}
                                onClick={onCancel}
                                disabled={disabled}
                            >
                                Cancel
                            </Button>
                            <Button
                                disabled={disabled || isEmpty}
                                size={"sm"}
                                onClick={() => {
                                    onSubmit({
                                        body: JSON.stringify(quillRef.current?.getContents()),
                                        image,
                                        files,
                                    })
                                }}
                                className="bg-[#007a5a] hover:[#007a5a]/80 text-white"
                            >
                                Save
                            </Button>
                        </div>
                    )}
                    {variant === "create" && (
                        <Button
                            className={cn(
                                "ml-auto",
                                isEmpty
                                ? "bg-white hover:bg-white text-muted-foreground"
                                : "bg-[#007a5a] hover:[#007a5a]/80 text-white"
                            )}
                            disabled={disabled || isEmpty}
                            size={"iconSm"}
                            onClick={() => {
                                onSubmit({
                                    body: JSON.stringify(quillRef.current?.getContents()),
                                    image,
                                    files,
                                })
                            }}
                        >
                            <MdSend className="size-4" />
                        </Button>
                    )}
                </div>
            </div>
            {variant === "create" && (
                <div className={cn(
                        "p-2 text-[10px] text-muted-foreground flex justify-end opacity-0 transition",
                        !isEmpty && "opacity-100"
                        )}>
                    <p>
                        <strong>Shift + Return</strong> to add a new line
                    </p>
                </div>
            )}
        </div>
    );
};

export default Editor;