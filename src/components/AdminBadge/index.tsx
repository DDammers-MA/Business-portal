import React from 'react';

interface AdminBadgeProps {
	className?: string;
}

const AdminBadge: React.FC<AdminBadgeProps> = ({ className = '' }) => {
	return (
		<span
			className={`inline-flex items-center ml-2 text-xs font-medium text-purple-800 ${className}`}
			title="Administrator"
		>
			<i className="fa-solid fa-crown text-purple-600 mr-1"></i>
		</span>
	);
};

export default AdminBadge;
