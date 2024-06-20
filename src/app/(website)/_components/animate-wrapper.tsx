import clsx from "clsx"
import { Children, cloneElement, useCallback, useEffect, useRef, useState } from "react";

interface AnimateWrapperProps {
    children: React.ReactNode
    onMountDuration?: number
    onUnmountDuration?: number
    onMountAnimationName?: string
    onUnmoutAnimationName?: string
    show?: boolean
}
export default function AnimateWrapper({ children, onMountDuration, onUnmountDuration, onMountAnimationName, onUnmoutAnimationName, show }: AnimateWrapperProps) {

    const [isMounted, setIsMounted] = useState(false);
    const [isAnimating, setIsAnimating] = useState<"mount" | "unmount" | null>(null);

    const animationTimeout = useRef<ReturnType<typeof setTimeout>>(null);

    const mount = useCallback(() => {
        setIsMounted(true);
        setIsAnimating("mount");
        clearTimeout(animationTimeout.current || undefined);
        setTimeout(() => {
            setIsAnimating(null);
        }, onMountDuration || 0);
    }, [onMountDuration]);

    const unmount = useCallback(() => {
        setIsAnimating("unmount");
        clearTimeout(animationTimeout.current || undefined);
        setTimeout(() => {
            setIsMounted(false);
            setIsAnimating(null);
        }, onUnmountDuration || 0);
    }, [onUnmountDuration]);

    useEffect(() => {
        if (show) {
            mount();
        } else {
            unmount();
        }
    }, [show, mount, unmount]);

    if (!isMounted) return null;

    const ChildrenComponent = ({ className }: { className?: string }) => {

        return (
            <>
                {
                    Children.map(children, (child) => {
                        if (child?.hasOwnProperty("props")) {
                            return cloneElement((child as any), {
                                className: clsx((child as any).props.className, className),
                            });
                        }
                        return child
                    })
                }
            </>
        );
    }

    const animClassName = `${isAnimating === "mount" ? onMountAnimationName : isAnimating === "unmount" ? onUnmoutAnimationName : undefined}`

    return <ChildrenComponent className={animClassName} />
}