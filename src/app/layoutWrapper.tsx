// LayoutWrapper.tsx
'use client';

import { useState } from 'react';
import Sidebar from '@/components/sidebar/sidebar';
import styles from './layout.module.scss';
import { AuthProvider, useAuth } from '@/context/AuthContext';

// Inner component to access auth context
const LayoutContent = ({ children }: { children: React.ReactNode }) => {
	const [isOpen, setIsOpen] = useState(false);
	const { isAdmin } = useAuth();

	return (
		<>
			<Sidebar isOpen={isOpen} setIsOpen={setIsOpen} isAdmin={isAdmin} />
			<main className={styles.main}>{children}</main>
		</>
	);
};

// Main wrapper that provides the context
const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
	return (
		<AuthProvider>
			<LayoutContent>{children}</LayoutContent>
		</AuthProvider>
	);
};

export default LayoutWrapper;
