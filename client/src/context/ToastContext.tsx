/* eslint-disable react-refresh/only-export-components */
import React, {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
} from 'react'

type ToastType = 'info' | 'success' | 'error' | 'warning'
interface Toast {
	id: number
	message: string
	type?: ToastType
	duration?: number
}

const ToastContext = createContext<{
	showToast: (msg: string, type?: ToastType, duration?: number) => void
} | null>(null)

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [toasts, setToasts] = useState<Toast[]>([])
	const idRef = React.useRef(1)

	const showToast = useCallback(
		(message: string, type: ToastType = 'info', duration = 3000) => {
			const id = idRef.current++
			setToasts((t) => [...t, { id, message, type, duration }])
			window.setTimeout(() => {
				setToasts((t) => t.filter((x) => x.id !== id))
			}, duration + 200)
		},
		[]
	)

	const value = useMemo(() => ({ showToast }), [showToast])

	// Listen for global auth unauthorized events and show a toast
	React.useEffect(() => {
		const onUnauthorized = () => {
			showToast('Session expired. Please log in.', 'warning')
		}
		window.addEventListener(
			'auth:unauthorized',
			onUnauthorized as EventListener
		)
		return () => {
			window.removeEventListener(
				'auth:unauthorized',
				onUnauthorized as EventListener
			)
		}
	}, [showToast])

	return (
		<ToastContext.Provider value={value}>
			{children}
			<div
				aria-live="polite"
				className="fixed z-50 top-(--space-4) right-(--space-4) flex flex-col gap-(--space-2)"
			>
				{toasts.map((t) => (
					<div
						key={t.id}
						className={`px-(--space-4) py-(--space-2) rounded shadow text-sm max-w-xs wrap-break-wordbreak-words ${
							t.type === 'success'
								? 'bg-green-100 text-green-900'
								: t.type === 'error'
								? 'bg-red-100 text-red-900'
								: 'bg-slate-100 text-slate-900'
						}`}
					>
						{t.message}
					</div>
				))}
			</div>
		</ToastContext.Provider>
	)
}

export function useToast() {
	const ctx = useContext(ToastContext)
	if (!ctx) throw new Error('useToast must be used within ToastProvider')
	return ctx
}

export default ToastContext
