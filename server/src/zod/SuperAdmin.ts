import {z} from 'zod';



export const setupSchema = z.object({
  email: z
    .string({
      error: "Email is required"
    })
    .trim()
    .toLowerCase()
    .pipe(z.email("Invalid email address")),

  password: z
    .string({
      error: "Password is required"
    })
    .min(8, "Password must be at least 8 characters")
    .max(64, "Password must not exceed 64 characters")
});