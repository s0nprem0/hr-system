import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import type { AxiosResponse } from 'axios'
import { useToast } from '../context/ToastContext'
import DialogWrapper from '../components/ui/DialogWrapper'

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

	// validation state
	const [formErrors, setFormErrors] = useState<Record<string, string>>({})
	const firstNameRef = useRef<HTMLInputElement | null>(null)

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

	const validateStep = (s: number) => {
		const errs: Record<string, string> = {}
		if (s === 0) {
			if (!draft.firstName || !draft.firstName.trim())
				errs.firstName = 'First name is required'
			if (!draft.lastName || !draft.lastName.trim())
				errs.lastName = 'Last name is required'
			const emailRegex = /^\S+@\S+\.\S+$/
			if (!draft.email || !emailRegex.test(draft.email))
				errs.email = 'Valid email is required'
		}
		if (s === 2 && draft.salary) {
			if (isNaN(Number(draft.salary))) errs.salary = 'Salary must be a number'
		}
		setFormErrors(errs)
		return Object.keys(errs).length === 0
	}

	const next = () => setStep((s) => Math.min(s + 1, steps.length - 1))

	const handleNext = () => {
		if (validateStep(step)) next()
	}

	const back = () => setStep((s) => Math.max(s - 1, 0))

	const clearDraft = () => {
		setDraft({})
		try {
			localStorage.removeItem(DRAFT_KEY)
		} catch (err) {
			console.warn('Failed to clear draft', err)
		}

		// also clear server-side draft if possible
		api.post('/api/employees/draft', {}).catch(() => undefined)
	}

	const [confirmOpen, setConfirmOpen] = useState(false)
	const [generatedPassword, setGeneratedPassword] = useState('')

	const submit = () => {
		// client-side validation
		if (!validateStep(0)) {
			// focus first invalid field
			if (formErrors.firstName) firstNameRef.current?.focus()
			return
		}

		const pwd = generatePassword(12)
		setGeneratedPassword(pwd)
		setConfirmOpen(true)
	}

	const submitConfirmed = () => {
		setSaving(true)
		const name = `${draft.firstName} ${draft.lastName}`.trim()
		const payload = {
			name,
			email: draft.email,
			password: generatedPassword,
			role: 'employee',
			profile: { department: draft.department },
			active: true,
		}

		api
			.post('/api/employees', payload)
			.then(async (res) => {
				if (!res?.data?.success) {
					toast.showToast(
						res?.data?.error?.message || 'Failed to create employee',
						'error'
					)
					return
				}
				const created = res.data.data
				// clear drafts locally and server-side
				await api.post('/api/employees/draft', {}).catch(() => undefined)
				localStorage.removeItem(DRAFT_KEY)
				toast.showToast('Employee created', 'success')
				setConfirmOpen(false)
				navigate(`/employees/${created?._id || ''}`)
			})
			.catch((err) => {
				const msg =
					err?.response?.data?.error?.message || err?.message || 'Create failed'
				toast.showToast(String(msg), 'error')
			})
			.finally(() => setSaving(false))
	}

	// helpers
	const navigate = useNavigate()
	const toast = useToast()
	const [saving, setSaving] = useState(false)

	const hasDraft = Object.keys(draft || {}).length > 0

	const resumeDraft = () => {
		// bring user to the first step and focus the first field
		setStep(0)
		setTimeout(() => firstNameRef.current?.focus(), 50)
		toast.showToast('Draft restored', 'info')
	}

	const discardDraft = () => {
		if (!confirm('Discard the current draft? This cannot be undone.')) return
		clearDraft()
		toast.showToast('Draft discarded', 'success')
	}

	function generatePassword(len = 12) {
		const chars =
			'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-='
		let out = ''
		for (let i = 0; i < len; i++)
			out += chars.charAt(Math.floor(Math.random() * chars.length))
		return out
	}

	const copyPassword = async () => {
		try {
			if (!generatedPassword) return
			await navigator.clipboard.writeText(generatedPassword)
			toast.showToast('Password copied to clipboard', 'success')
		} catch {
			toast.showToast('Failed to copy password', 'error')
		}
	}

	return (
		<>
			<div className="p-(--space-5) bg-white rounded shadow">
				<h2 className="text-xl font-semibold mb-4">Add / Edit Employee</h2>

				{hasDraft && (
					<div className="mb-(--space-4) p-(--space-3) bg-yellow-50 border-l-4 border-yellow-300 flex items-center justify-between">
						<div className="text-sm">A draft is available for this form.</div>
						<div className="flex gap-2">
							<button
								onClick={resumeDraft}
								className="px-(--space-2) py-(--space-1) bg-white rounded border text-sm"
							>
								Resume
							</button>
							<button
								onClick={discardDraft}
								className="px-(--space-2) py-(--space-1) bg-white rounded border text-sm"
							>
								Discard
							</button>
						</div>
					</div>
				)}

				<nav className="mb-(--space-4) flex gap-(--space-2)">
					{steps.map((s, i) => (
						<button
							key={s}
							onClick={() => setStep(i)}
							className={`px-(--space-3) py-(--space-1) rounded ${
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
								ref={firstNameRef}
								aria-label="First name"
								aria-invalid={!!formErrors.firstName}
								value={draft.firstName ?? ''}
								onChange={(e) => update({ firstName: e.target.value })}
								className="w-full border rounded p-(--space-2)"
							/>
							<input
								placeholder="Last name"
								aria-label="Last name"
								aria-invalid={!!formErrors.lastName}
								value={draft.lastName ?? ''}
								onChange={(e) => update({ lastName: e.target.value })}
								className="w-full border rounded p-(--space-2)"
							/>
							<input
								type="email"
								placeholder="Email"
								aria-label="Email"
								aria-invalid={!!formErrors.email}
								value={draft.email ?? ''}
								onChange={(e) => update({ email: e.target.value })}
								className="w-full border rounded p-(--space-2)"
							/>
						</div>
					)}

					{step === 1 && (
						<div className="space-y-3">
							<input
								placeholder="Job title"
								aria-label="Job title"
								value={draft.jobTitle ?? ''}
								onChange={(e) => update({ jobTitle: e.target.value })}
								className="w-full border rounded p-2"
							/>
							<input
								placeholder="Department"
								aria-label="Department"
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
								aria-label="Salary"
								aria-invalid={!!formErrors.salary}
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
						<div className="border-2 border-dashed border-gray-200 p-(--space-5) rounded text-center">
							Upload files (placeholder)
						</div>
					)}
				</div>

				<div className="mt-(--space-6) flex gap-(--space-3) items-center">
					<button
						onClick={back}
						className="px-(--space-3) py-(--space-2) bg-gray-100 rounded"
					>
						Back
					</button>

					{step < steps.length - 1 ? (
						<button
							onClick={handleNext}
							disabled={saving}
							className={`px-(--space-3) py-(--space-2) bg-blue-600 text-white rounded ${
								saving ? 'opacity-50 cursor-not-allowed' : ''
							}`}
						>
							Next
						</button>
					) : (
						<button
							onClick={submit}
							disabled={saving}
							className={`px-(--space-3) py-(--space-2) bg-green-600 text-white rounded ${
								saving ? 'opacity-50 cursor-not-allowed' : ''
							}`}
						>
							{saving ? 'Saving…' : 'Submit'}
						</button>
					)}

					<button
						onClick={() =>
							localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
						}
						disabled={saving}
						className={`ml-auto px-(--space-3) py-(--space-2) bg-yellow-100 rounded ${
							saving ? 'opacity-50 cursor-not-allowed' : ''
						}`}
					>
						Save draft
					</button>

					<button
						onClick={clearDraft}
						disabled={saving}
						className={`px-(--space-3) py-(--space-2) bg-red-100 rounded ${
							saving ? 'opacity-50 cursor-not-allowed' : ''
						}`}
					>
						Clear draft
					</button>
				</div>
			</div>

			{/* Confirmation modal for generated password */}
			<DialogWrapper
				isOpen={confirmOpen}
				onClose={() => setConfirmOpen(false)}
				title="Confirm create employee"
			>
				<div className="space-y-4">
					<p className="text-sm">
						You're about to create a new employee with the following temporary
						password. Share it securely with the user.
					</p>
					<div className="mt-(--space-2) p-(--space-3) bg-gray-50 rounded border flex items-center justify-between">
						<code className="font-mono">{generatedPassword}</code>
						<button
							className="ml-(--space-4) px-(--space-2) py-(--space-1) bg-white rounded border text-sm"
							onClick={copyPassword}
						>
							Copy
						</button>
					</div>

					<div className="flex justify-end gap-2">
						<button
							className="btn"
							onClick={() => setConfirmOpen(false)}
							disabled={saving}
						>
							Cancel
						</button>
						<button
							className="btn btn-primary"
							onClick={submitConfirmed}
							disabled={saving}
						>
							{saving ? 'Saving…' : 'Confirm'}
						</button>
					</div>
				</div>
			</DialogWrapper>
		</>
	)
}
