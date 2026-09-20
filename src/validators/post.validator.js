import {z} from 'zod';

export const postQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(10).default(10),

  search: z.string().optional(),

    published: z
               .enum(['true', 'false'])
               .optional(),
    
     sort: z
    .enum(['createdAt', 'updatedAt', 'title'])
    .default('createdAt'),

      order: z
    .enum(['asc', 'desc'])
    .default('desc')
});
