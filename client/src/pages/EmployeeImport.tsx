import React, { useState } from 'react'
import {
	Upload,
	FileText,
	AlertCircle,
	CheckCircle,
	Loader2,
	Save,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

// --- Types ---

interface PreviewRow {
	mapped: Record<string, unknown>
	errors: string[]
}

interface PreviewData {
	header: string[]
	preview: PreviewRow[]
}

interface ImportResult {
	imported: number
	failed: number
	total: number
}

interface ApiErrorResponse {
	response?: {
		data?: {
			message?: string
			error?: {
				message?: string
			}
		}
	}
	message?: string
}

// --- Constants ---

const ALLOWED_FIELDS = [
	'ignore',
	'firstName',
	'lastName',
	'email',
	'jobTitle',
	'department',
	'salary',
	'role',
]

// --- Helpers ---

// Robustly split a CSV line by comma, ignoring commas inside quotes
const parseCSVHeader = (line: string): string[] => {
	const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || []
	return matches.map((m) => m.replace(/^"|"$/g, '').trim())
}

// Type-safe error message extractor
const getErrorMessage = (err: unknown): string => {
	if (typeof err === 'string') return err

	const errorObj = err as ApiErrorResponse
	return (
		errorObj.response?.data?.message ||
		errorObj.response?.data?.error?.message ||
		errorObj.message ||
		'Import failed'
	)
}

export default function EmployeeImport() {
	const navigate = useNavigate()
	const [csvText, setCsvText] = useState('')
	const [headers, setHeaders] = useState<string[]>([])
	const [mapping, setMapping] = useState<Record<string, string>>({})
	const [preview, setPreview] = useState<PreviewData | null>(null)
	const [importResult, setImportResult] = useState<ImportResult | null>(null)

	const [loading, setLoading] = useState(false)
	const [isCommitting, setIsCommitting] = useState(false)
	const [fileName, setFileName] = useState('')
	const [error, setError] = useState<string | null>(null)

	const onFile = (f?: File) => {
		if (!f) return

		// Reset state on new file
		setPreview(null)
		setImportResult(null)
		setError(null)
		setFileName(f.name)
		setHeaders([])

		const r = new FileReader()

		r.onload = (e) => {
			const txt = String(e.target?.result || '')
			setCsvText(txt)

			// Extract first line for headers
			const firstLineEnd = txt.indexOf('\n')
			const firstLine = firstLineEnd > -1 ? txt.slice(0, firstLineEnd) : txt

			if (firstLine.trim()) {
				const cols = parseCSVHeader(firstLine)
				setHeaders(cols)

				// Auto-initialize mapping
				const initial: Record<string, string> = {}
				cols.forEach((c) => {
					const lowerC = c.toLowerCase()
					const match = ALLOWED_FIELDS.find((f) => f.toLowerCase() === lowerC)
					initial[c] = match || 'ignore'
				})
				setMapping(initial)
			}
		}

		r.onerror = () => setError('Failed to read file')
		r.readAsText(f)
	}

	const handleMapChange = (col: string, val: string) => {
		setMapping((prev) => ({ ...prev, [col]: val }))
	}

	const runDry = async () => {
		setLoading(true)
		setError(null)
		setPreview(null)
		setImportResult(null)

		try {
			const resp = await api.post('/api/employees/import', {
				csv: csvText,
				mapping,
			})
			setPreview(resp.data.data)
		} catch (err: unknown) {
			const msg = getErrorMessage(err)
			setError(msg)
		} finally {
			setLoading(false)
		}
	}

	const runCommit = async () => {
		if (!window.confirm('Are you sure you want to import the valid rows?'))
			return

		setIsCommitting(true)
		setError(null)

		try {
			const resp = await api.post('/api/employees/import/commit', {
				csv: csvText,
				mapping,
			})
			setImportResult(resp.data.data)
			setPreview(null)
		} catch (err: unknown) {
			setError(getErrorMessage(err))
		} finally {
			setIsCommitting(false)
		}
	}

	// Success View
	if (importResult) {
		return (
			<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-2xl mx-auto text-center mt-10">
				<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
					<CheckCircle className="h-6 w-6 text-green-600" />
				</div>
				<h3 className="text-lg font-medium text-gray-900">Import Complete</h3>
				<p className="mt-2 text-sm text-gray-500">
					Successfully imported{' '}
					<span className="font-bold text-gray-900">
						{importResult.imported}
					</span>{' '}
					employees.
					{importResult.failed > 0 && (
						<span className="text-red-600 ml-1">
							({importResult.failed} failed)
						</span>
					)}
				</p>
				<div className="mt-6 flex justify-center gap-3">
					<button
						onClick={() => {
							setImportResult(null)
							setCsvText('')
							setHeaders([])
							setFileName('')
							setPreview(null)
						}}
						className="text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-md text-sm font-medium transition-colors"
					>
						Import Another
					</button>
					<button
						onClick={() => navigate('/employees')}
						className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
					>
						View Employees
					</button>
				</div>
			</div>
		)
	}

	const validCount =
		preview?.preview.filter((r) => r.errors.length === 0).length || 0

	return (
		<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-4xl mx-auto">
			<div className="flex items-center gap-3 mb-6">
				<div className="p-2 bg-blue-50 rounded-lg">
					<Upload className="h-6 w-6 text-blue-600" />
				</div>
				<div>
					<h2 className="text-xl font-semibold text-gray-900">
						Import Employees
					</h2>
					<p className="text-sm text-gray-500">
						Upload a CSV to preview and validate data
					</p>
				</div>
			</div>

			{/* Error Alert */}
			{error && (
				<div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md flex items-center gap-2 text-sm border border-red-100">
					<AlertCircle className="h-4 w-4" />
					{error}
				</div>
			)}

			{/* File Input */}
			<div className="mb-6">
				<label className="block text-sm font-medium text-gray-700 mb-2">
					Select CSV File
				</label>
				<div className="flex items-center gap-4">
					<label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
						<FileText className="h-4 w-4 mr-2" />
						Choose File
						<input
							type="file"
							className="hidden"
							accept=".csv,text/csv"
							onChange={(e) => onFile(e.target.files?.[0])}
						/>
					</label>
					{fileName && (
						<span className="text-sm text-gray-600">{fileName}</span>
					)}
				</div>
			</div>

			{/* Field Mapping */}
			{headers.length > 0 && (
				<div className="mb-8 border-t border-gray-100 pt-6">
					<h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
						Map Columns
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{headers.map((h) => (
							<div
								key={h}
								className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200"
							>
								<span
									className="text-sm font-medium text-gray-700 truncate w-1/2"
									title={h}
								>
									{h}
								</span>
								<div className="flex items-center gap-2 text-gray-400">
									<span className="text-xs">➔</span>
									<select
										aria-label={`Map column ${h}`}
										value={mapping[h] || 'ignore'}
										onChange={(e) => handleMapChange(h, e.target.value)}
										className="block w-40 pl-3 pr-10 py-1.5 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
									>
										{ALLOWED_FIELDS.map((f) => (
											<option key={f} value={f}>
												{f}
											</option>
										))}
									</select>
								</div>
							</div>
						))}
					</div>

					<div className="mt-6 flex gap-3">
						<button
							className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
							onClick={runDry}
							disabled={loading || isCommitting || !csvText}
						>
							{loading && (
								<Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
							)}
							Validate & Preview
						</button>

						{preview && validCount > 0 && (
							<button
								className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
								onClick={runCommit}
								disabled={isCommitting}
							>
								{isCommitting ? (
									<Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
								) : (
									<Save className="-ml-1 mr-2 h-4 w-4" />
								)}
								Import {validCount} Users
							</button>
						)}
					</div>
				</div>
			)}

			{/* Preview Table */}
			{preview && (
				<div className="border-t border-gray-100 pt-6">
					<h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex justify-between items-center">
						<span>Data Preview</span>
						<span className="text-xs font-normal text-gray-500 normal-case">
							{preview.preview.length} rows found
						</span>
					</h3>

					<div className="overflow-hidden border border-gray-200 rounded-lg">
						<div className="overflow-x-auto max-h-[500px]">
							<table className="min-w-full divide-y divide-gray-200">
								<thead className="bg-gray-50 sticky top-0">
									<tr>
										<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
											#
										</th>
										<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
											Status
										</th>
										<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Mapped Data
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{preview.preview.map((row, i) => {
										const hasErrors = row.errors && row.errors.length > 0
										return (
											<tr
												key={i}
												className={hasErrors ? 'bg-red-50' : 'hover:bg-gray-50'}
											>
												<td className="px-4 py-3 text-sm text-gray-500 align-top">
													{i + 1}
												</td>
												<td className="px-4 py-3 text-sm align-top">
													{hasErrors ? (
														<div className="space-y-1">
															{row.errors.map((e, idx) => (
																<div
																	key={idx}
																	className="flex items-start gap-1.5 text-red-700"
																>
																	<AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
																	<span>{e}</span>
																</div>
															))}
														</div>
													) : (
														<div className="flex items-center gap-1.5 text-green-700">
															<CheckCircle className="h-4 w-4" />
															<span>Valid</span>
														</div>
													)}
												</td>
												<td className="px-4 py-3 text-sm text-gray-700 align-top font-mono">
													<ul className="space-y-1">
														{Object.entries(row.mapped).map(([key, value]) => (
															<li key={key} className="flex gap-2">
																<span className="font-semibold text-gray-500">
																	{key}:
																</span>
																<span>{String(value)}</span>
															</li>
														))}
													</ul>
												</td>
											</tr>
										)
									})}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
