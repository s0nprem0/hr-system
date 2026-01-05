import { useEffect, useMemo, useState } from 'react'

type EmployeeDraft = {
	firstName?: string
	lastName?: string
	email?: string
	jobTitle?: string
	department?: string
	salary?: string
}

const DRAFT_KEY = 'employeeFormDraft'

export default function EmployeeFormStepper() {
	const [step, setStep] = useState(0)
	const steps = useMemo(
		() => ['Basic', 'Work', 'Compensation', 'Documents'],
		[]
	)

	const [draft, setDraft] = useState<EmployeeDraft>(() => {
		try {
			const raw = localStorage.getItem(DRAFT_KEY)
			return raw ? (JSON.parse(raw) as EmployeeDraft) : {}
		} catch (e) {
			return {}
		}
	})

	// Autosave draft to localStorage
	useEffect(() => {
		const id = setTimeout(() => {
			try {
				localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
			} catch {}
		}, 500)
		return () => clearTimeout(id)
	}, [draft])

	const update = (patch: Partial<EmployeeDraft>) =>
		setDraft((d) => ({ ...d, ...patch }))

	const next = () => setStep((s) => Math.min(s + 1, steps.length - 1))
	const back = () => setStep((s) => Math.max(s - 1, 0))

	const clearDraft = () => {
		setDraft({})
		try {
			localStorage.removeItem(DRAFT_KEY)
		} catch {}
	}

	const submit = () => {
		// Placeholder: integrate real submit to API
		// Keep UI responsive — show toast or navigate on success in real app
		// eslint-disable-next-line no-console
		console.log('Submitting employee', draft)
		clearDraft()
		alert('Submit placeholder: employee data logged to console')
	}

	return (
		<div className="p-6 bg-white rounded shadow">
			<h2 className="text-xl font-semibold mb-4">Add / Edit Employee</h2>

			<div className="mb-4">
				<nav className="flex gap-2">
					{steps.map((s, i) => (
						<button
							key={s}
							onClick={() => setStep(i)}
							className={`px-3 py-1 rounded ${
								i === step ? 'bg-blue-600 text-white' : 'bg-gray-100'
							}`}
						>
							{s}
						</button>
					))}
				</nav>
			</div>

			<div className="min-h-50">
				{step === 0 && (
					<div className="space-y-3">
						<label className="block">
							<div className="text-sm">First name</div>
							<input
								value={draft.firstName ?? ''}
								onChange={(e) => update({ firstName: e.target.value })}
								className="mt-1 w-full border rounded p-2"
							/>
						</label>

						<label className="block">
							<div className="text-sm">Last name</div>
							<input
								value={draft.lastName ?? ''}
								onChange={(e) => update({ lastName: e.target.value })}
								className="mt-1 w-full border rounded p-2"
							/>
						</label>

						<label className="block">
							<div className="text-sm">Email</div>
							<input
								type="email"
								value={draft.email ?? ''}
								onChange={(e) => update({ email: e.target.value })}
								className="mt-1 w-full border rounded p-2"
							/>
						</label>
					</div>
				)}

				{step === 1 && (
					<div className="space-y-3">
						<label className="block">
							<div className="text-sm">Job title</div>
							<input
								value={draft.jobTitle ?? ''}
								onChange={(e) => update({ jobTitle: e.target.value })}
								className="mt-1 w-full border rounded p-2"
							/>
						</label>

						<label className="block">
							<div className="text-sm">Department</div>
							<input
								value={draft.department ?? ''}
								onChange={(e) => update({ department: e.target.value })}
								className="mt-1 w-full border rounded p-2"
							/>
						</label>
					</div>
				)}

				{step === 2 && (
					<div className="space-y-3">
						<label className="block">
							<div className="text-sm">Salary</div>
							<input
								value={draft.salary ?? ''}
								onChange={(e) => update({ salary: e.target.value })}
								className="mt-1 w-full border rounded p-2"
								placeholder="0.00"
							/>
						</label>
						<div className="text-sm text-gray-600">
							Changes to compensation will require approval.
						</div>
					</div>
				)}

				{step === 3 && (
					<div className="space-y-3">
						<div className="text-sm">Documents</div>
						<div className="border-dashed border-2 border-gray-200 p-6 rounded text-center">
							Upload files (placeholder)
						</div>
					</div>
				)}
			</div>

			<div className="mt-6 flex items-center gap-3">
				<button onClick={back} className="px-3 py-2 bg-gray-100 rounded">
					Back
				</button>
				{step < steps.length - 1 ? (
					<button
						onClick={next}
						className="px-3 py-2 bg-blue-600 text-white rounded"
					>
						Next
					</button>
				) : (
					<button
						onClick={submit}
						className="px-3 py-2 bg-green-600 text-white rounded"
					>
						Submit
					</button>
				)}

				<button
					onClick={() => {
						localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
						alert('Draft saved')
					}}
					className="ml-auto px-3 py-2 bg-yellow-100 rounded"
				>
					Save draft
				</button>
				<button onClick={clearDraft} className="px-3 py-2 bg-red-100 rounded">
					Clear draft
				</button>
			</div>
		</div>
	)
}
