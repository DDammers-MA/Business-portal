// LayoutWrapper.tsx
'use client';

import { Suspense, useState } from 'react';
import Sidebar from '@/components/sidebar/sidebar';
import styles from './layout.module.scss';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import Footer from '@/components/footer/footer';

const LayoutContent = ({ children }: { children: React.ReactNode }) => {
	const [isOpen, setIsOpen] = useState(false);
	const { isAdmin } = useAuth();

	return (
		<>
			<Sidebar isOpen={isOpen} setIsOpen={setIsOpen} isAdmin={isAdmin} />
			<div
				className={`${styles.pageWrapper} ${
					isOpen ? styles.pageWrapperShifted : ''
				}`}
			>
				{' '}
				<Suspense
					fallback={<div className={styles.loadingFallback}>Loading...</div>}
				>
					<main className={styles.main}>{children}</main>
				</Suspense>
				<Footer />
			</div>
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
