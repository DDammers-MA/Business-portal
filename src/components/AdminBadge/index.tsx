import React from 'react';

interface AdminBadgeProps {
	className?: string;
}

const AdminBadge: React.FC<AdminBadgeProps> = ({ className = '' }) => {
	return (
		<span
			className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 ${className}`}
			title="Administrator"
		>
			Admin
		</span>
	);
};

export default AdminBadge;
