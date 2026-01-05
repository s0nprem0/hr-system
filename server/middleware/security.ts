import type { Request, Response, NextFunction } from 'express'
import { sendError } from '../utils/apiResponse'

/**
 * Enforces a maximum content length for requests.
 * @param maxBytes - Maximum allowed size in bytes (default 10KB for strict APIs)
 */
export const enforceContentLength = (maxBytes = 10240) => {
	return (req: Request, res: Response, next: NextFunction) => {
		// Skip for GET/HEAD
		if (req.method === 'GET' || req.method === 'HEAD') return next()

		const cl = req.headers['content-length']
		if (!cl) {
			// Strictly require Content-Length for POST/PUT to prevent indeterminate payload attacks
			return sendError(res, 'Content-Length header is required', 411)
		}

		const length = parseInt(cl, 10)
		if (isNaN(length) || length > maxBytes) {
			return sendError(res, `Payload too large (max ${maxBytes} bytes)`, 413)
		}

		next()
	}
}

/**
 * Basic strict mode helper to strip unknown fields from req.body
 * Note: Use express-validator's matchedData() for best results in controllers.
 */
export const sanitizeBody = (allowedFields: string[]) => {
	return (req: Request, res: Response, next: NextFunction) => {
		if (req.body && typeof req.body === 'object') {
			const sanitized: Record<string, unknown> = {}
			allowedFields.forEach((field) => {
				if (field in req.body) {
					sanitized[field] = req.body[field]
				}
			})
			req.body = sanitized
		}
		next()
	}
}
