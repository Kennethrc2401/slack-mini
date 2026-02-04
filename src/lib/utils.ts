import { clsx, type ClassValue } from "clsx"

// Simple implementation to avoid missing tailwind-merge dependency
function twMerge(...inputs: any[]) {
  return inputs.flat().join(" ")
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
