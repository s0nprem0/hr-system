import * as React from 'react'

export function Skeleton({ className = '' }: { className?: string }) {
	return (
		<div className={`animate-pulse bg-(--cp-border) rounded ${className}`} />
	)
}

export default Skeleton
