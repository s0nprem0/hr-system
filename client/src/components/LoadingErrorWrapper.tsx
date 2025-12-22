import { type ReactNode } from 'react'

interface LoadingErrorWrapperProps {
	loading: boolean
	error: string | null
	children: ReactNode
	loadingMessage?: string
}

export function LoadingErrorWrapper({
	loading,
	error,
	children,
	loadingMessage = 'Loading...',
}: LoadingErrorWrapperProps) {
	if (loading) {
		return (
			<div role="status" className="muted py-4">
				{loadingMessage}
			</div>
		)
	}

	if (error) {
		return (
			<div role="alert" className="text-(--cp-danger) py-4">
				{error}
			</div>
		)
	}

	return <>{children}</>
}
