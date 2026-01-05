import React from 'react'

const DashboardSkeleton: React.FC = () => {
	return (
		<div className="space-y-6">
			<div className="animate-pulse bg-(--cp-surface) rounded-md h-12 w-3/4" />
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div className="animate-pulse bg-(--cp-surface) rounded-md h-48" />
				<div className="animate-pulse bg-(--cp-surface) rounded-md h-48" />
			</div>
		</div>
	)
}

export default DashboardSkeleton
