import * as React from 'react'
import { Button } from './Button'
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
	CardFooter,
} from './Card'
import { cn } from '@/lib/utils'

export type ApprovalItem = {
	id: string
	title: string
	subtitle?: string
}

export interface ApprovalListProps {
	items: ApprovalItem[]
	onApprove?: (id: string) => void
	onDeny?: (id: string) => void
	className?: string
}

export default function ApprovalList({
	items,
	onApprove,
	onDeny,
	className,
}: ApprovalListProps) {
	return (
		<Card className={cn(className)}>
			<CardHeader>
				<CardTitle>Approvals</CardTitle>
				<CardDescription>Recent items requiring action</CardDescription>
			</CardHeader>
			<CardContent>
				<ul className="space-y-3">
					{items.length === 0 && <div className="muted">No pending items</div>}
					{items.map((it) => (
						<li key={it.id} className="flex items-center justify-between">
							<div>
								<div className="font-medium">{it.title}</div>
								{it.subtitle && (
									<div className="text-sm muted">{it.subtitle}</div>
								)}
							</div>
							<div className="flex items-center gap-2">
								<Button
									size="sm"
									variant="outline"
									onClick={() => onDeny?.(it.id)}
								>
									Deny
								</Button>
								<Button size="sm" onClick={() => onApprove?.(it.id)}>
									Approve
								</Button>
							</div>
						</li>
					))}
				</ul>
			</CardContent>
			<CardFooter>
				<div className="ml-auto" />
			</CardFooter>
		</Card>
	)
}
