import { useDataList } from '../utils/useDataList'
import { useAuth } from '../context/AuthContext'
import { PageHeader } from '../components/PageHeader'
import { DataTable, type Column } from '../components/DataTable'
import { MaskedValue } from '../components/ui'
import { Pagination } from '../components/Pagination'
import { LoadingErrorWrapper } from '../components/LoadingErrorWrapper'
import PageContainer from '../components/layout/PageContainer'

type PayrollEntry = {
	_id: string
	gross: number
	net: number
	periodStart?: string
	periodEnd?: string
	payDate?: string
	employee?: { _id: string; name?: string; email?: string } | null
}

const Payroll = () => {
	const {
		items,
		loading,
		error,
		page,
		pageSize,
		total,
		search,
		setPage,
		setSearch,
		handleDelete,
	} = useDataList<PayrollEntry>({
		endpoint: '/api/payroll',
		pageSize: 8,
		deleteConfirmMessage: 'Delete this payroll entry?',
		deleteSuccessMessage: 'Payroll entry deleted',
	})

	const auth = useAuth()

	const columns: Column<PayrollEntry>[] = [
		{
			key: 'employee',
			header: 'Employee',
			render: (entry) =>
				entry.employee ? (
					entry.employee.name ? (
						entry.employee.name
					) : (
						<MaskedValue value={entry.employee.email} />
					)
				) : (
					'—'
				),
		},
		{
			key: 'gross',
			header: 'Gross',
			visible: auth?.can && auth.can('managePayroll'),
			render: (entry) => (
				<MaskedValue
					value={entry.gross}
					formatter={(v) => Number(v).toFixed(2)}
				/>
			),
		},
		{
			key: 'net',
			header: 'Net',
			visible: auth?.can && auth.can('managePayroll'),
			render: (entry) => (
				<MaskedValue
					value={entry.net}
					formatter={(v) => Number(v).toFixed(2)}
				/>
			),
		},
		{
			key: 'payDate',
			header: 'Period Start',
			render: (entry) =>
				entry.periodStart
					? new Date(entry.periodStart).toLocaleDateString()
					: '-',
		},
	]

	const actions = [
		{
			label: 'Edit',
			to: (entry: PayrollEntry) => `/payroll/${entry._id}`,
		},
		{
			label: 'Delete',
			onClick: (entry: PayrollEntry) => handleDelete(entry._id),
			className: 'text-danger',
			condition: () => !!auth?.can && auth.can('managePayroll'),
		},
	]

	return (
		<PageContainer>
			<div className="card">
				<PageHeader
					title="Payroll"
					addButton={{ to: '/payroll/new', text: 'Add Payroll Entry' }}
					search={{
						value: search,
						onChange: setSearch,
						placeholder: 'Search by employee',
					}}
				/>

				<LoadingErrorWrapper loading={loading} error={error}>
					<DataTable
						data={items}
						columns={columns}
						actions={actions}
						emptyMessage="No payroll entries found"
					/>
					<Pagination
						page={page}
						pageSize={pageSize}
						total={total}
						onPageChange={setPage}
					/>
				</LoadingErrorWrapper>
			</div>
		</PageContainer>
	)
}

export default Payroll
