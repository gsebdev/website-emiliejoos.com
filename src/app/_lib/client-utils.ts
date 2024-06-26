// these functions are client side utilities

import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const sortByDisplayOrder = (a: {display_order?: number}, b: {display_order?: number}) => Number(a.display_order) - Number(b.display_order);