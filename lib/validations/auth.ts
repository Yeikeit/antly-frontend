import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email({ error: 'Email inválido' }),
  password: z.string().min(1, { error: 'La contraseña es requerida' }),
});

export const registerSchema = z.object({
  email: z.email({ error: 'Email inválido' }),
  password: z.string().min(8, { error: 'Mínimo 8 caracteres' }),
  firstName: z.string().min(1, { error: 'El nombre es requerido' }),
  lastName: z.string().min(1, { error: 'El apellido es requerido' }),
});

export type LoginFields = z.infer<typeof loginSchema>;
export type RegisterFields = z.infer<typeof registerSchema>;
