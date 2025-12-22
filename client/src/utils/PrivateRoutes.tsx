import { useAuth } from '../context/AuthContext'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import type { Role } from '../context/AuthPermissions'
import { setPostLoginRedirect } from './authRedirect'
import type { ReactNode } from 'react'
import { useEffect } from 'react'

interface PrivateRoutesProps {
	children: ReactNode
	requiredRole?: Role[] // requiredRole is an array of `Role`
}

const PrivateRoutes = ({ children, requiredRole }: PrivateRoutesProps) => {
	const auth = useAuth()
	const navigate = useNavigate()
	const location = useLocation()

	// Hooks must be called unconditionally — run effect early but guard inside.
	useEffect(() => {
		if (!auth?.loading && !auth?.user) {
			// store where to return after login, then navigate
			setPostLoginRedirect(location.pathname + (location.search || ''))
			navigate('/login')
		}
	}, [auth?.loading, auth?.user, navigate, location])

	if (auth?.loading) {
		return <div>Loading...</div>
	}

	if (!auth?.user) {
		return null
	}

	if (
		requiredRole &&
		(!auth || !auth.hasAnyRole || !auth.hasAnyRole(requiredRole))
	) {
		return <Navigate to="/unauthorized" />
	}

	return <>{children}</>
}

export default PrivateRoutes
