import * as React from 'react'
import { Card } from './Card'
import { cn } from '@/lib/utils'

export interface MetricCardProps {
	title: string
	value: React.ReactNode
	delta?: string | number
	className?: string
}

export default function MetricCard({
	title,
	value,
	delta,
	className,
}: MetricCardProps) {
	return (
		<Card className={cn('p-4', className)}>
			<div className="flex items-center justify-between">
				<div>
					<div className="text-sm text-muted-foreground">{title}</div>
					<div className="text-2xl font-semibold mt-1">{value}</div>
				</div>
				{delta !== undefined && (
					<div className="text-sm text-muted-foreground ml-4">{delta}</div>
				)}
			</div>
		</Card>
	)
}
