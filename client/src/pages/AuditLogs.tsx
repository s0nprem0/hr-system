import { useEffect, useMemo, useState } from 'react'
import PageContainer from '../components/layout/PageContainer'
import { DataTable, type Column } from '../components/DataTable'
import api from '../utils/api'
import type { ApiResponse, AuditLogDTO } from '@hr/shared'
import handleApiError from '../utils/handleApiError'
import type { JSONValue } from '../types/json'
import { PageHeader } from '../components/PageHeader'
import { LoadingErrorWrapper } from '../components/LoadingErrorWrapper'
import { Input, Select, Button, Dialog } from '../components/ui'
import DiffViewer from '../components/DiffViewer'
import { Pagination } from '../components/Pagination'

interface AuditLogRow {
	_id: string
	collectionName: string
	documentId: string | null
	action: string
	user?: { _id?: string; name?: string; email?: string } | string | null
	message?: string | null
	before?: JSONValue
	after?: JSONValue
	createdAt: string
}

const AuditLogs = () => {
	const [items, setItems] = useState<AuditLogRow[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [page, setPage] = useState(1)
	const [pageSize, setPageSize] = useState(10)
	const [total, setTotal] = useState(0)

	const [search, setSearch] = useState('')
	const [filterAction, setFilterAction] = useState('')
	const [filterUser, setFilterUser] = useState('')
	const [filterCollection, setFilterCollection] = useState('')
	const [dateFrom, setDateFrom] = useState<string | null>(null)
	const [dateTo, setDateTo] = useState<string | null>(null)

	const [selected, setSelected] = useState<AuditLogRow | null>(null)
	const [open, setOpen] = useState(false)

	const fetchList = async () => {
		setLoading(true)
		setError(null)
		try {
			const params: Record<string, string | number | undefined> = {
				page,
				limit: pageSize,
			}
			// map client filter names to server expected query names
			const collectionName = filterCollection || search
			if (collectionName) params.collectionName = collectionName
			if (filterAction) params.action = filterAction
			if (filterUser) params.user = filterUser
			if (dateFrom) params.from = dateFrom
			if (dateTo) params.to = dateTo

			const res = await api.get('/api/audits', { params })
			const r = res.data as ApiResponse<{ items: AuditLogDTO[]; total: number }>
			if (r?.success) {
				const data = r.data
				setItems((data?.items || []) as AuditLogRow[])
				setTotal(data?.total || 0)
			} else {
				type ApiErr = { success: false; error: { message?: string } }
				const errMsg =
					r && !(r as { success: boolean }).success
						? (r as ApiErr).error?.message ?? 'Failed to load audits'
						: 'Failed to load audits'
				throw new Error(errMsg)
			}
		} catch (err: unknown) {
			const apiErr =
				err && typeof err === 'object'
					? (handleApiError(err) as { message: string })
					: undefined
			setError(apiErr?.message ?? 'Failed to load audit logs')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		void fetchList()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		page,
		pageSize,
		search,
		filterAction,
		filterUser,
		filterCollection,
		dateFrom,
		dateTo,
	])

	const columns: Column<AuditLogRow>[] = useMemo(
		() => [
			{ key: 'collectionName', header: 'Collection' },
			{
				key: 'documentId',
				header: 'Document ID',
				render: (r) => r.documentId ?? '—',
			},
			{ key: 'action', header: 'Action' },
			{
				key: 'user',
				header: 'User',
				render: (r) =>
					typeof r.user === 'string'
						? r.user ?? '—'
						: r.user
						? `${r.user.name ?? '—'} (${r.user.email ?? '—'})`
						: '—',
			},
			{ key: 'message', header: 'Message', render: (r) => r.message ?? '—' },
			{
				key: 'createdAt',
				header: 'When',
				render: (r) => new Date(r.createdAt).toLocaleString(),
			},
			{
				key: 'before',
				header: 'Before',
				render: (r) =>
					r.before
						? JSON.stringify(r.before).slice(0, 80) +
						  (JSON.stringify(r.before).length > 80 ? '…' : '')
						: '—',
			},
			{
				key: 'after',
				header: 'After',
				render: (r) =>
					r.after
						? JSON.stringify(r.after).slice(0, 80) +
						  (JSON.stringify(r.after).length > 80 ? '…' : '')
						: '—',
			},
		],
		[]
	)

	const actions = [
		{
			label: 'View',
			onClick: (row: AuditLogRow) => {
				setSelected(row)
				setOpen(true)
			},
		},
	]

	return (
		<PageContainer>
			<div className="card">
				<PageHeader
					title="Audit Logs"
					search={{
						value: filterCollection || search,
						onChange: (v) => {
							setFilterCollection(v)
							setSearch(v)
						},
						placeholder: 'Filter by collection or text',
					}}
				>
					<div className="flex flex-wrap items-center gap-2">
						<Select
							value={filterAction}
							onChange={(e) => setFilterAction(e.target.value)}
							className="w-44"
						>
							<option value="">All actions</option>
							<option value="create">create</option>
							<option value="update">update</option>
							<option value="delete">delete</option>
							<option value="access">access</option>
						</Select>
						<Input
							placeholder="User"
							value={filterUser}
							onChange={(e) => setFilterUser(e.target.value)}
							className="w-40"
						/>
						<Input
							type="date"
							value={dateFrom ?? ''}
							onChange={(e) => setDateFrom(e.target.value || null)}
							className="w-36"
						/>
						<Input
							type="date"
							value={dateTo ?? ''}
							onChange={(e) => setDateTo(e.target.value || null)}
							className="w-36"
						/>
						<div className="flex gap-1">
							<Button
								size="sm"
								variant="ghost"
								onClick={() => {
									const to = new Date()
									const from = new Date()
									from.setDate(from.getDate() - 1)
									setDateFrom(from.toISOString().slice(0, 10))
									setDateTo(to.toISOString().slice(0, 10))
								}}
							>
								24h
							</Button>
							<Button
								size="sm"
								variant="ghost"
								onClick={() => {
									const to = new Date()
									const from = new Date()
									from.setDate(from.getDate() - 7)
									setDateFrom(from.toISOString().slice(0, 10))
									setDateTo(to.toISOString().slice(0, 10))
								}}
							>
								7d
							</Button>
							<Button
								size="sm"
								variant="ghost"
								onClick={() => {
									const to = new Date()
									const from = new Date()
									from.setDate(from.getDate() - 30)
									setDateFrom(from.toISOString().slice(0, 10))
									setDateTo(to.toISOString().slice(0, 10))
								}}
							>
								30d
							</Button>
						</div>
						<Button
							onClick={() => {
								setPage(1)
								void fetchList()
							}}
						>
							Apply
						</Button>
						<Button
							variant="ghost"
							onClick={async () => {
								// export current filters as JSON
								try {
									setLoading(true)
									const params: Record<string, string | number | undefined> = {
										page: 1,
										limit: 1000,
									}
									const collectionName = filterCollection || search
									if (collectionName) params.collectionName = collectionName
									if (filterAction) params.action = filterAction
									if (filterUser) params.user = filterUser
									if (dateFrom) params.from = dateFrom
									if (dateTo) params.to = dateTo
									const res = await api.get('/api/audits', { params })
									const r = res.data as ApiResponse<{
										items: AuditLogDTO[]
										total: number
									}>
									if (r?.success) {
										const payload = JSON.stringify(r.data?.items || [], null, 2)
										const blob = new Blob([payload], {
											type: 'application/json',
										})
										const url = URL.createObjectURL(blob)
										const a = document.createElement('a')
										a.href = url
										a.download = `audit-logs-${Date.now()}.json`
										a.click()
										URL.revokeObjectURL(url)
									}
								} catch {
									// ignore
								} finally {
									setLoading(false)
								}
							}}
						>
							Export
						</Button>
						<div className="flex items-center gap-2">
							<label className="text-sm muted">Page size</label>
							<select
								value={pageSize}
								onChange={(e) => {
									setPageSize(Number(e.target.value))
									setPage(1)
								}}
								className="rounded border px-2 py-1"
							>
								<option value={10}>10</option>
								<option value={25}>25</option>
								<option value={50}>50</option>
							</select>
						</div>
						<Button
							variant="ghost"
							onClick={() => {
								setFilterAction('')
								setFilterUser('')
								setFilterCollection('')
								setDateFrom(null)
								setDateTo(null)
								setSearch('')
								setPage(1)
								void fetchList()
							}}
						>
							Clear
						</Button>
					</div>
				</PageHeader>

				<LoadingErrorWrapper loading={loading} error={error}>
					<div className="mb-2 text-sm muted">
						{total > 0
							? `Showing ${Math.min(
									(page - 1) * pageSize + 1,
									total
							  )}–${Math.min(page * pageSize, total)} of ${total}`
							: 'No results'}
					</div>
					<DataTable
						data={items}
						columns={columns}
						actions={actions}
						emptyMessage="No audit logs"
					/>

					<Pagination
						page={page}
						pageSize={pageSize}
						total={total}
						onPageChange={(p) => setPage(p)}
					/>
				</LoadingErrorWrapper>

				<Dialog
					isOpen={open}
					onClose={() => setOpen(false)}
					title={
						selected
							? `${selected.collectionName} — ${selected.action}`
							: 'Audit detail'
					}
				>
					{selected ? (
						<div className="space-y-4 max-h-[70vh] overflow-auto">
							<div className="muted text-sm">ID: {selected._id}</div>
							<div className="text-sm">
								<strong>User:</strong>{' '}
								{typeof selected.user === 'string'
									? selected.user ?? '—'
									: selected.user
									? `${selected.user.name ?? '—'} (${
											selected.user.email ?? '—'
									  })`
									: '—'}
							</div>
							<div className="text-sm">
								<strong>Message:</strong> {selected.message ?? '—'}
							</div>
							<div className="text-sm">
								<strong>When:</strong>{' '}
								{new Date(selected.createdAt).toLocaleString()}
							</div>
							<div>
								<h4 className="font-semibold">Structured diff</h4>
								<DiffViewer
									before={selected.before as unknown as Record<string, unknown>}
									after={selected.after as unknown as Record<string, unknown>}
									collectionName={selected.collectionName}
									documentId={selected.documentId}
								/>
							</div>
						</div>
					) : null}
				</Dialog>
			</div>
		</PageContainer>
	)
}

export default AuditLogs
