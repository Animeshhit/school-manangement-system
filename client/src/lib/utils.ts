import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}




export function generateRespose(success:boolean,error:string | null,data:any){
  return {
    success,
    error,
    data,
  }
}