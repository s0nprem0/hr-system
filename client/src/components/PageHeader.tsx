import { Link } from 'react-router-dom'
import { type ReactNode } from 'react'
import { Button, Input } from './ui'
import { Plus, Search } from 'lucide-react'

export interface PageHeaderProps {
	title: string
	addButton?: {
		to: string
		text: string
	} | null
	search?: {
		value: string
		onChange: (value: string) => void
		placeholder?: string
	} | null
	children?: ReactNode
}

export function PageHeader({
	title,
	addButton,
	search,
	children,
}: PageHeaderProps) {
	return (
		<div className="mb-6">
			<div className="flex flex-col gap-4">
				<div>
					<h1 className="text-3xl font-bold">{title}</h1>
				</div>
				<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
					{search && (
						<div className="relative flex-1 sm:flex-initial">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-(--cp-muted)" />
							<Input
								value={search.value}
								onChange={(e) => search.onChange(e.target.value)}
								placeholder={search.placeholder || 'Search...'}
								className="pl-10 w-full sm:w-64"
							/>
						</div>
					)}
					{addButton && (
						<Link to={addButton.to}>
							<Button
								variant="default"
								className="w-full sm:w-auto flex items-center gap-2 justify-center"
							>
								<Plus className="h-4 w-4" />
								{addButton.text}
							</Button>
						</Link>
					)}
					{children}
				</div>
			</div>
		</div>
	)
}
