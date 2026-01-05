import { useDataList } from '../utils/useDataList'
import { useAuth } from '../context/AuthContext'
import { PageHeader } from '../components/PageHeader'
import { DataTable, type Column } from '../components/DataTable'
import { Pagination } from '../components/Pagination'
import { LoadingErrorWrapper } from '../components/LoadingErrorWrapper'
import PageContainer from '../components/layout/PageContainer'

interface Department {
	_id: string
	name: string
	description?: string
	createdAt?: string
}

const Departments = () => {
	const auth = useAuth()

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
	} = useDataList<Department>({
		endpoint: '/api/departments',
		pageSize: 15,
		deleteConfirmMessage:
			'Delete this department? This will not remove employees.',
		deleteSuccessMessage: 'Department deleted',
	})

	const columns: Column<Department>[] = [
		{
			key: 'name',
			header: 'Name',
		},
		{
			key: 'description',
			header: 'Description',
			render: (dept) => dept.description ?? '-',
		},
		{
			key: 'createdAt',
			header: 'Created',
			render: (dept) =>
				dept.createdAt ? new Date(dept.createdAt).toLocaleDateString() : '-',
		},
	]

	const actions = [
		{
			label: 'Edit',
			to: (dept: Department) => `/departments/${dept._id}`,
			className: 'muted',
		},
		{
			label: 'Delete',
			onClick: (dept: Department) => handleDelete(dept._id),
			className: 'text-danger',
			condition: () => !!auth?.can && auth.can('manageDepartments'),
		},
	]

	return (
		<PageContainer>
			<div className="card">
				<PageHeader
					title="Departments"
					addButton={
						auth?.can && auth.can('manageDepartments')
							? { to: '/departments/new', text: 'Add Department' }
							: undefined
					}
					search={{ value: search, onChange: setSearch }}
				/>

				<LoadingErrorWrapper loading={loading} error={error}>
					<DataTable
						data={items}
						columns={columns}
						actions={actions}
						emptyMessage="No departments found"
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

export default Departments
