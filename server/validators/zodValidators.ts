import { z } from 'zod'

export const CreateEmployeeSchema = z.object({
	name: z.string().min(3),
	email: z.string().email(),
	password: z.string().min(8).optional().nullable(),
	role: z.enum(['admin', 'hr', 'employee']).optional(),
	profile: z
		.object({
			department: z.string().optional(),
			designation: z.string().optional(),
			jobTitle: z.string().optional(),
			salary: z
				.union([z.number(), z.string().regex(/^[0-9]+(\.?[0-9]+)?$/)])
				.optional()
				.transform((v) => (typeof v === 'string' ? Number(v) : v)),
		})
		.optional(),
})

export const ImportCommitSchema = z.object({
	csv: z.string().min(1),
	mapping: z.record(z.string()).optional(),
})

export const PublishDraftSchema = z.object({
	firstName: z.string().min(1),
	lastName: z.string().min(1),
	email: z.string().email(),
	jobTitle: z.string().optional(),
	designation: z.string().optional(),
	department: z.string().optional(),
	salary: z
		.union([z.number(), z.string().regex(/^[0-9]+(\.?[0-9]+)?$/)])
		.optional()
		.transform((v) => (typeof v === 'string' ? Number(v) : v)),
})

// Helper to convert ZodError into simple field/error pairs
export function formatZodErrors(err: unknown) {
	// err is ZodError
	try {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const zerr = err as any
		if (!zerr || !zerr.errors) return []
		return zerr.errors.map((e: any) => ({
			field: e.path.join('.') || '_',
			message: e.message,
		}))
	} catch (e) {
		return []
	}
}

export default {
	CreateEmployeeSchema,
	ImportCommitSchema,
	PublishDraftSchema,
	formatZodErrors,
}
