import { defineCollection, z } from 'astro:content';

const cats = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    age: z.string(),
    breed: z.string().optional(),
    sex: z.enum(['Male', 'Female']).optional(),
    description: z.string(),
    photo: z.string(),
    status: z.enum(['Available', 'Pending', 'Adopted']).default('Available'),
    bondedWith: z.string().optional(),
    featured: z.boolean().default(false),
  }),
});

const news = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string().optional(),
    image: z.string().optional(),
  }),
});

export const collections = { cats, news };
