import { z } from 'zod'

export const SignUpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters'),
  full_name: z.string().min(1, 'Full name is required'),
  age_confirmed: z.literal(true, {
    errorMap: () => ({ message: 'You must confirm you are 21 or older' }),
  }),
})

export type SignUpInput = z.infer<typeof SignUpSchema>

export const SignInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export type SignInInput = z.infer<typeof SignInSchema>

export const ResetPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>

export const UpdatePasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters'),
})

export type UpdatePasswordInput = z.infer<typeof UpdatePasswordSchema>

export const UpdateProfileSchema = z.object({
  full_name: z.string().min(1, 'Full name is required').optional(),
  display_name: z.string().optional(),
  avatar_url: z
    .string()
    .optional()
    .transform((val) => (val === '' ? undefined : val))
    .pipe(z.string().url('Must be a valid URL').optional()),
})

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>
