import { useEffect, useState } from 'react'
import api from '../utils/api'
import type { AxiosResponse } from 'axios'

type EmployeeDraft = {
	firstName?: string
	lastName?: string
	email?: string
	jobTitle?: string
	department?: string
	salary?: string
}

const DRAFT_KEY = 'employeeFormDraft'
const steps = ['Basic', 'Work', 'Compensation', 'Documents'] as const

export default function EmployeeFormStepper() {
	const [step, setStep] = useState(0)
	const [draft, setDraft] = useState<EmployeeDraft>(() => {
		try {
			const raw = localStorage.getItem(DRAFT_KEY)
			return raw ? (JSON.parse(raw) as EmployeeDraft) : {}
		} catch {
			return {}
		}
	})

	// load server-side draft on mount (if any) and merge/override local draft
	useEffect(() => {
		let mounted = true
		api
			.get('/api/employees/draft')
			.then((res: AxiosResponse) => {
				if (!mounted) return
				if (res?.data?.success) {
					setDraft(res.data.data || {})
				}
			})
			.catch(() => undefined)
		return () => {
			mounted = false
		}
	}, [])
	useEffect(() => {
		const id = setTimeout(() => {
			try {
				localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
			} catch (err) {
				console.warn('Failed to save draft', err)
			}

			// also persist draft to server (fire-and-forget)
			api.post('/api/employees/draft', draft).catch(() => undefined)
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
		} catch (err) {
			console.warn('Failed to clear draft', err)
		}
	}

	const submit = () => {
		console.log('Submitting employee', draft)
		clearDraft()
		// swap this for a toast in real life
	}

	return (
		<div className="p-6 bg-white rounded shadow">
			<h2 className="text-xl font-semibold mb-4">Add / Edit Employee</h2>

			<nav className="mb-4 flex gap-2">
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

			<div className="min-h-50">
				{step === 0 && (
					<div className="space-y-3">
						<input
							placeholder="First name"
							value={draft.firstName ?? ''}
							onChange={(e) => update({ firstName: e.target.value })}
							className="w-full border rounded p-2"
						/>
						<input
							placeholder="Last name"
							value={draft.lastName ?? ''}
							onChange={(e) => update({ lastName: e.target.value })}
							className="w-full border rounded p-2"
						/>
						<input
							type="email"
							placeholder="Email"
							value={draft.email ?? ''}
							onChange={(e) => update({ email: e.target.value })}
							className="w-full border rounded p-2"
						/>
					</div>
				)}

				{step === 1 && (
					<div className="space-y-3">
						<input
							placeholder="Job title"
							value={draft.jobTitle ?? ''}
							onChange={(e) => update({ jobTitle: e.target.value })}
							className="w-full border rounded p-2"
						/>
						<input
							placeholder="Department"
							value={draft.department ?? ''}
							onChange={(e) => update({ department: e.target.value })}
							className="w-full border rounded p-2"
						/>
					</div>
				)}

				{step === 2 && (
					<div className="space-y-3">
						<input
							placeholder="0.00"
							value={draft.salary ?? ''}
							onChange={(e) => update({ salary: e.target.value })}
							className="w-full border rounded p-2"
						/>
						<p className="text-sm text-gray-600">
							Comp changes require approval.
						</p>
					</div>
				)}

				{step === 3 && (
					<div className="border-2 border-dashed border-gray-200 p-6 rounded text-center">
						Upload files (placeholder)
					</div>
				)}
			</div>

			<div className="mt-6 flex gap-3 items-center">
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
					onClick={() => localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))}
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
