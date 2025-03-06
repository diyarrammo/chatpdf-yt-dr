import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function convertToAscii(inputString: string) {
  // remove non ascii characters and normalize path
  const asciiString = inputString
    .replace(/[^\x00-\x7F]+/g, "") // remove non-ascii
    .replace(/[^a-zA-Z0-9]/g, "-") // replace other chars with hyphens
    .replace(/-+/g, "-") // replace multiple hyphens with single
    .toLowerCase(); // convert to lowercase
  return asciiString;
}
