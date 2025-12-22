import { useState } from 'react'

interface MaskedValueProps {
	value: string | number | null | undefined
	mask?: string
	formatter?: (v: string | number) => string
	className?: string
}

export default function MaskedValue({
	value,
	mask = '••••',
	formatter,
	className = '',
}: MaskedValueProps) {
	const [show, setShow] = useState(false)

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
			<button
				type="button"
				aria-label={show ? 'Hide value' : 'Show value'}
				onClick={() => setShow(!show)}
				className="text-xs muted hover:underline"
			>
				{show ? 'Hide' : 'Show'}
			</button>
		</span>
	)
}
