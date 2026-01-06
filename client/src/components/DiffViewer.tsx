import React, { useMemo } from 'react'
import MaskedValue from './ui/MaskedValue'

interface DiffViewerProps {
	before?: Record<string, unknown> | null
	after?: Record<string, unknown> | null
	collectionName?: string
	documentId?: string | number | null
}

const MAX_KEYS = 100

function isPrimitive(v: unknown): boolean {
	return (
		v === null ||
		v === undefined ||
		['string', 'number', 'boolean'].includes(typeof v)
	)
}

function deepEqual(a: unknown, b: unknown): boolean {
	if (Object.is(a, b)) return true
	if (typeof a !== typeof b) return false
	if (a == null || b == null) return a === b

	if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime()

	if (Array.isArray(a) && Array.isArray(b)) {
		if (a.length !== b.length) return false
		for (let i = 0; i < a.length; i++) {
			if (!deepEqual(a[i], b[i])) return false
		}
		return true
	}

	if (Array.isArray(a) !== Array.isArray(b)) return false

	if (typeof a === 'object') {
		const ak = Object.keys(a as Record<string, unknown>)
		const bk = Object.keys(b as Record<string, unknown>)
		if (ak.length !== bk.length) return false
		ak.sort()
		bk.sort()
		for (let i = 0; i < ak.length; i++) {
			if (ak[i] !== bk[i]) return false
			if (
				!deepEqual(
					(a as Record<string, unknown>)[ak[i]],
					(b as Record<string, unknown>)[bk[i]]
				)
			)
				return false
		}
		return true
	}

	return false
}

export default function DiffViewer({
	before,
	after,
	collectionName,
	documentId,
}: DiffViewerProps) {
	const keys = useMemo(() => {
		const b = before && typeof before === 'object' ? Object.keys(before) : []
		const a = after && typeof after === 'object' ? Object.keys(after) : []
		const set = new Set<string>([...b, ...a])
		return Array.from(set)
			.sort((x, y) => x.localeCompare(y))
			.slice(0, MAX_KEYS)
	}, [before, after])

	if (
		(!before || Object.keys(before).length === 0) &&
		(!after || Object.keys(after).length === 0)
	) {
		return <div className="text-sm muted">No structured fields</div>
	}

	const FieldDiff = ({
		name,
		bv,
		av,
	}: {
		name: string
		bv: unknown
		av: unknown
	}) => {
		const changed = !deepEqual(bv, av)
		return (
			<div
				key={name}
				className={`p-2 rounded border ${
					changed
						? 'bg-[color-mix(in srgb, var(--cp-surface) 96%, var(--cp-bg) 4%)]'
						: ''
				}`}
			>
				<div className="flex items-start justify-between">
					<div className="font-medium">{name}</div>
					<div className="text-xs muted">
						{changed ? 'changed' : 'unchanged'}
					</div>
				</div>
				<div className="mt-2 grid md:grid-cols-2 grid-cols-1 gap-4 text-sm">
					<div>
						<div className="text-xs muted">Before</div>
						<div className="mt-1">
							{isPrimitive(bv) ? (
								typeof bv === 'string' ? (
									<MaskedValue
										value={bv}
										auditCollection={collectionName}
										auditDocumentId={documentId}
										className="font-mono"
									/>
								) : (
									<code className="font-mono">{String(bv)}</code>
								)
							) : (
								<pre className="max-h-48 overflow-auto rounded p-2 text-xs bg-[color-mix(in srgb, var(--cp-surface) 96%, var(--cp-bg) 4%)]">
									{bv ? JSON.stringify(bv, null, 2) : '—'}
								</pre>
							)}
						</div>
					</div>
					<div>
						<div className="text-xs muted">After</div>
						<div className="mt-1">
							{isPrimitive(av) ? (
								typeof av === 'string' ? (
									<MaskedValue
										value={av}
										auditCollection={collectionName}
										auditDocumentId={documentId}
										className="font-mono"
									/>
								) : (
									<code className="font-mono">{String(av)}</code>
								)
							) : (
								<pre className="max-h-48 overflow-auto rounded p-2 text-xs bg-[color-mix(in srgb, var(--cp-surface) 96%, var(--cp-bg) 4%)]">
									{av ? JSON.stringify(av, null, 2) : '—'}
								</pre>
							)}
						</div>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="space-y-3">
			{keys.map((k) => (
				<FieldDiff
					key={k}
					name={k}
					bv={before ? (before as Record<string, unknown>)[k] : undefined}
					av={after ? (after as Record<string, unknown>)[k] : undefined}
				/>
			))}
			{keys.length >= MAX_KEYS && (
				<div className="text-xs muted">Showing first {MAX_KEYS} fields</div>
			)}
		</div>
	)
}
