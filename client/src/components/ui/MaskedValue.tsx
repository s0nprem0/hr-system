import { useState } from 'react'
import api from '../../utils/api'
import { Button } from '.'

interface MaskedValueProps {
	value: string | number | null | undefined
	mask?: string
	formatter?: (v: string | number) => string
	className?: string
	// optional audit wiring: when the value is revealed, POST to /api/audits/event
	auditCollection?: string
	auditDocumentId?: string | number | null
	auditMessage?: string
}

export default function MaskedValue({
	value,
	mask = '••••',
	formatter,
	className = '',
	auditCollection,
	auditDocumentId,
	auditMessage,
}: MaskedValueProps) {
	const [show, setShow] = useState(false)
	const [sentAudit, setSentAudit] = useState(false)

	if (value === null || value === undefined)
		return <span className={className}>—</span>

	const display =
		typeof value === 'number'
			? formatter
				? formatter(value)
				: value.toFixed(2)
			: String(value)

	return (
		<span className={`inline-flex items-center gap-2 ${className}`}>
			<span className="font-mono">{show ? display : mask}</span>
			<Button
				variant="ghost"
				type="button"
				aria-label={show ? 'Hide value' : 'Show value'}
				onClick={async () => {
					const next = !show
					setShow(next)
					if (next && !sentAudit && auditCollection) {
						setSentAudit(true)
						try {
							await api.post('/api/audits/event', {
								collectionName: auditCollection,
								documentId: auditDocumentId ?? undefined,
								message: auditMessage ?? `Viewed ${auditCollection} value`,
							})
						} catch {
							// ignore errors for now — non-fatal
						}
					}
				}}
				className="text-xs muted hover:underline"
			>
				{show ? 'Hide' : 'Show'}
			</Button>
		</span>
	)
}
