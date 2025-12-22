import { useState } from 'react'
import api from '../utils/api'
import handleApiError from '../utils/handleApiError'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button, Input, CenteredCard } from '../components/ui'
import FormField from '../components/ui/FormField'
import { Eye, EyeOff } from 'lucide-react'
import type { AuthLoginResponse, ApiResponse } from '@hr/shared'
import { safeSetItem } from '../utils/storage'
import { getAndClearPostLoginRedirect } from '../utils/authRedirect'
import PageContainer from '../components/layout/PageContainer'

const Login = () => {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)
	const [showPassword, setShowPassword] = useState(false)
	const navigate = useNavigate()
	const auth = useAuth()

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)
		try {
			setLoading(true)
			const res = await api.post('/api/auth/login', { email, password })
			const r = res.data as ApiResponse<AuthLoginResponse>
			if (r?.success) {
				const payload = r.data
				if (payload) {
					safeSetItem('token', payload.token)
					safeSetItem('refreshToken', payload.refreshToken)
					auth?.login(payload.user, payload.token)
				}
				// Redirect to the originally requested path, or fallback to dashboard
				let dest = getAndClearPostLoginRedirect() || '/dashboard'
				// If the saved redirect points back to the login page, ignore it.
				if (dest === '/login' || dest.startsWith('/login?')) {
					dest = '/dashboard'
				}
				navigate(dest)
			} else {
				setError(
					(r as { success: false; error?: { message?: string } }).error
						?.message || 'Login failed'
				)
			}
		} catch (err: unknown) {
			const apiErr = handleApiError(err)
			setError(apiErr.message)
		} finally {
			setLoading(false)
		}
	}

	return (
		<PageContainer className="min-h-screen flex items-center justify-center">
			<CenteredCard>
				<h2 className="text-2xl font-semibold mb-4">Login</h2>
				{error && (
					<div
						role="alert"
						className="mb-2 rounded-md bg-(--cp-danger)/10 p-2 text-sm text-(--cp-danger)"
					>
						{error}
					</div>
				)}
				<form onSubmit={handleSubmit} className="space-y-4">
					<FormField label="Email">
						<Input
							id="email"
							name="email"
							autoFocus
							placeholder="you@example.com"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
					</FormField>

					<FormField label="Password">
						<div className="relative">
							<Input
								id="password"
								name="password"
								type={showPassword ? 'text' : 'password'}
								placeholder="••••••"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="pr-10"
							/>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								className="absolute right-1 top-1/2 -translate-y-1/2"
								aria-label={showPassword ? 'Hide password' : 'Show password'}
								aria-pressed={showPassword}
								onClick={() => setShowPassword((s) => !s)}
							>
								{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
							</Button>
						</div>
					</FormField>

					<div className="flex justify-end">
						<Button type="submit" variant="default" disabled={loading}>
							Login
						</Button>
					</div>
				</form>
			</CenteredCard>
		</PageContainer>
	)
}

export default Login
