import { z } from 'zod'

const envSchema = z.object({
  PORT: z.string().optional(),
  DATABASE_URL: z.string().optional(),
  CLOUDINARY_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_SECRET: z.string().optional(),
  CLOUDINARY_URL: z.string().optional(),
})

export const env = envSchema.parse(process.env)
