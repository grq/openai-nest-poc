import { z } from 'zod'

const FieldTypeSchema = z.enum([
  'text',
  'textarea',
  'email',
  'phone',
  'datetime',
  'image',
  'check', // logical
  'url',
  'formula',
  'linkedField',
  'lookup',
  'number'
])

const FieldSchema = z.object({
  name: z.string(),
  desc: z.string(),
  type: FieldTypeSchema,
  config: z.optional(z.unknown()),
  relationToId: z.optional(z.number()), // Только для linkedField
  relationToName: z.optional(z.string()) // Только для linkedField
}).refine((data) => {
  if (data.type === 'linkedField') {
    return data.relationToId !== undefined || data.relationToName !== undefined
  }
  return true
}, {
  message: 'Either relationToId or relationToName must be provided when type is "linkedField"',
  path: ['relationToId'] // Можно указать relationToName или оставить пустым
})

const FLActionSchema = z.union([
  z.object({
    t: z.literal('create_table'),
    p: z.object({
      name: z.string(),
      desc: z.string(),
      fields: z.array(FieldSchema).nonempty()
    })
  }),
  z.object({
    t: z.literal('create_field'),
    p: z.object({
      tableId: z.number(),
      tableName: z.string(),
      name: z.string(),
      desc: z.string(),
      type: FieldTypeSchema
    })
  }),
  z.object({
    t: z.literal('rename_field'),
    p: z.object({
      id: z.number(),
      name: z.string()
    })
  }),
  z.object({
    t: z.literal('change_field_type'),
    p: z.object({
      id: z.number(),
      type: FieldTypeSchema
    })
  }),
  z.object({
    t: z.literal('delete_field'),
    p: z.object({
      id: z.number()
    })
  })
])

// Главная схема JSON-ответа
const FlResponseSchema = z.object({
  message: z.string(),
  system: z.object({}).default({}),
  json: z.object({
    actions: z.array(FLActionSchema).default([])
  })
})

// Функция валидации
export const validateFlResponse = (data: unknown) => {
  const result = FlResponseSchema.safeParse(data)
  if (!result.success) {
    console.error('Validation failed:', result.error.errors)
    return result.error.errors.map(e => ({
      message: e.message,
      path: e.path.join(':'),
      unionErrors: e['unionErrors'] ? e['unionErrors'].flatMap(ue => (ue.errors)) : undefined
    }))
  }
  FlResponseSchema.strict(data)
  return true
}