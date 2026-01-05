import { Link } from 'react-router-dom'
import { type ReactNode } from 'react'
import { Button, Card } from './ui'
import type { JSONValue } from '../types/json'

function getCellValue<T extends object>(
	item: T,
	key: keyof T
): JSONValue | undefined {
	return (item as unknown as Record<string, JSONValue>)[String(key)]
}

export interface Column<T extends object = object> {
	key: keyof T & string
	header: string
	render?: (item: T) => ReactNode
	className?: string
	/**
	 * Whether the column should be shown. Defaults to true.
	 */
	visible?: boolean
}

export interface Action<T extends object = object> {
	label: string
	onClick?: (item: T) => void
	to?: string | ((item: T) => string)
	className?: string
	condition?: (item: T) => boolean
}

export interface DataTableProps<T extends object> {
	data: T[]
	columns: Column<T>[]
	actions?: Action<T>[]
	keyField?: keyof T & string
	emptyMessage?: string
}

export function DataTable<T extends object>({
	data,
	columns,
	actions = [],
	keyField = '_id' as keyof T & string,
	emptyMessage = 'No data available',
}: DataTableProps<T>) {
	if (data.length === 0) {
		return (
			<Card className="text-center py-8 text-(--cp-muted)">{emptyMessage}</Card>
		)
	}

	const hiddenCols = columns.filter((c) => c.visible === false)

	return (
		<div className="overflow-x-auto">
			{hiddenCols.length > 0 && (
				<div className="mb-2 text-sm text-gray-600 flex items-center gap-2">
					<span>Some columns are hidden due to permissions.</span>
					<span
						className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700 cursor-help"
						title={hiddenCols.map((c) => c.header).join(', ')}
					>
						View hidden: {hiddenCols.length}
					</span>
				</div>
			)}
			<table
				className="w-full min-w-full table-auto"
				role="table"
				aria-label="Data table"
			>
				<thead className="bg-(--cp-surface) sticky top-0 z-10">
					<tr>
						{columns
							.filter((c) => c.visible !== false)
							.map((col) => (
								<th
									key={String(col.key)}
									scope="col"
									className={`text-left p-3 text-sm font-medium ${
										col.className || ''
									}`}
								>
									{col.header}
								</th>
							))}
						{actions.length > 0 && (
							<th className="text-left p-3 text-sm font-medium">Actions</th>
						)}
					</tr>
				</thead>

				<tbody>
					{data.map((item) => {
						const rowKey = String(getCellValue(item, keyField) ?? '')

						return (
							<tr
								key={rowKey}
								className="border-t hover:bg-[color-mix(in srgb, var(--cp-surface) 92%, var(--cp-bg) 8%)]"
							>
								{columns
									.filter((c) => c.visible !== false)
									.map((col) => (
										<td
											key={String(col.key)}
											className={`p-3 text-sm ${col.className || ''}`}
										>
											{col.render
												? col.render(item)
												: String(getCellValue(item, col.key) ?? '—')}
										</td>
									))}

								{actions.length > 0 && (
									<td className="p-3">
										<div className="inline-flex gap-2">
											{actions
												.filter(
													(action) =>
														!action.condition || action.condition(item)
												)
												.map((action, index) => {
													if (action.to) {
														const href =
															typeof action.to === 'function'
																? action.to(item)
																: action.to

														return (
															<Link
																key={index}
																to={href}
																className={action.className}
															>
																<Button className="px-2 py-1 text-sm">
																	{action.label}
																</Button>
															</Link>
														)
													}

													return (
														<Button
															key={index}
															className={`px-2 py-1 text-sm ${
																action.className || ''
															}`}
															onClick={
																action.onClick
																	? () => action.onClick!(item)
																	: undefined
															}
														>
															{action.label}
														</Button>
													)
												})}
										</div>
									</td>
								)}
							</tr>
						)
					})}
				</tbody>
			</table>
		</div>
	)
}
