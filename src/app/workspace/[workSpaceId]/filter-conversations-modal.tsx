import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface FilterConversationsModalProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    filterText: string;
    setFilterText: (text: string) => void;
}

export const FilterConversationsModal = ({
    open,
    setOpen,
    filterText,
    setFilterText,
}: FilterConversationsModalProps) => {
    const handleClear = () => {
        setFilterText("");
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Filter Conversations</DialogTitle>
                    <DialogDescription>
                        Search and filter through your conversations and messages
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="relative">
                        <Input
                            placeholder="Filter conversations..."
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                            autoFocus
                            className="pr-10"
                        />
                        {filterText && (
                            <button
                                onClick={handleClear}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X className="size-4" />
                            </button>
                        )}
                    </div>
                    
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-gray-700">Filter Tips:</h3>
                        <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Type a name to find conversations</li>
                            <li>• Search across all channels and DMs</li>
                            <li>• Results update in real-time</li>
                        </ul>
                    </div>

                    <div className="flex gap-2 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => {
                                handleClear();
                                setOpen(false);
                            }}
                            className="w-full"
                        >
                            Clear
                        </Button>
                        <Button
                            onClick={() => setOpen(false)}
                            className="w-full"
                        >
                            Done
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
