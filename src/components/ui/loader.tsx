import { cn } from "@/lib/utils";
import { LoaderCircle } from "lucide-react";

const Loader = ({ className }: { className?: string }) => {
    return (
        <div className={cn("flex items-center justify-center min-h-4", className)}>
            <LoaderCircle className={"aspect-square h-full animate-spin"} />
        </div>
    );
};

export default Loader;