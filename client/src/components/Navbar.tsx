import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { redirectToLogin } from '../utils/authRedirect'
import { LogOut, Menu } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { Button } from './ui'

interface NavbarProps {
	onMenuToggle: () => void
}

const Navbar = ({ onMenuToggle }: NavbarProps) => {
	const auth = useAuth()
	const navigate = useNavigate()

	const [menuOpen, setMenuOpen] = useState(false)
	const menuRef = useRef<HTMLDivElement | null>(null)

	const handleLogout = () => {
		setMenuOpen(false)
		auth?.logout()
		redirectToLogin(navigate)
	}

	useEffect(() => {
		function onDocClick(e: MouseEvent) {
			if (!menuRef.current) return
			if (!menuRef.current.contains(e.target as Node)) setMenuOpen(false)
		}

		function onKey(e: KeyboardEvent) {
			if (e.key === 'Escape') setMenuOpen(false)
		}

		document.addEventListener('click', onDocClick)
		document.addEventListener('keydown', onKey)
		return () => {
			document.removeEventListener('click', onDocClick)
			document.removeEventListener('keydown', onKey)
		}
	}, [])

	if (!auth?.user) return null

	return (
		<header
			role="banner"
			className="fixed top-0 left-0 right-0 h-16 app-header z-10 md:left-64"
		>
			<div className="h-full container-main flex items-center justify-between">
				<div className="md:flex-1" />

				<div className="flex items-center gap-(--space-4)">
					<Button
						variant="ghost"
						className="md:hidden p-(--space-2) focus:outline-none focus-visible:ring-2 focus-visible:ring-(--cp-cta)"
						onClick={onMenuToggle}
						aria-label="Toggle menu"
					>
						<Menu className="h-5 w-5" />
					</Button>

					{/* Profile dropdown */}
					<div className="relative" ref={menuRef}>
						<button
							type="button"
							aria-haspopup="menu"
							aria-expanded={menuOpen}
							onClick={() => setMenuOpen((s) => !s)}
							className="inline-flex items-center gap-(--space-2) rounded-md p-(--space-1) hover:bg-(--cp-bg) focus:outline-none focus-visible:ring-2 focus-visible:ring-(--cp-cta)"
							aria-label="Open profile menu"
						>
							<span
								aria-hidden
								className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-(--cp-cta) text-white font-semibold"
							>
								{String(auth.user.name || '')
									.split(' ')
									.map((s) => s[0])
									.join('')
									.slice(0, 2)}
							</span>
							<span className="hidden md:inline ml-(--space-2) font-medium text-sm truncate max-w-36">
								{auth.user.name}
							</span>
						</button>

						{menuOpen && (
							<div
								role="menu"
								aria-label="Profile"
								className="absolute right-0 mt-(--space-2) w-44 rounded-md border-(--cp-border) bg-(--cp-surface) shadow-lg z-50"
							>
								<div className="py-1">
									<Link
										to="/profile"
										className="block px-(--space-4) py-(--space-2) text-sm hover:bg-(--cp-bg)"
										onClick={() => setMenuOpen(false)}
										role="menuitem"
									>
										Profile
									</Link>
									<button
										type="button"
										onClick={handleLogout}
										className="w-full text-left px-(--space-4) py-(--space-2) text-sm hover:bg-(--cp-bg)"
										role="menuitem"
									>
										<span className="inline-flex items-center gap-2">
											<LogOut className="h-4 w-4" />
											Logout
										</span>
									</button>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</header>
	)
}

export default Navbar
