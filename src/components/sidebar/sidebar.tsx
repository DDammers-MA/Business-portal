'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '../../../utils/firebase.browser';
import { useAuth } from '@/context/AuthContext';
import styles from './sidebar.module.scss';

type SidebarProps = {
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
	isAdmin: boolean;
};

const Sidebar = ({ isOpen, setIsOpen, isAdmin }: SidebarProps) => {
	const { user } = useAuth();
	const router = useRouter();
	const [isProfileOpen, setIsProfileOpen] = useState(false);
	const isLoggedIn = user !== null;

	const handleLogout = async () => {
		try {
			await signOut(auth);
			await auth.signOut();
			await fetch('/api/auth/logout', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
			});
			setIsProfileOpen(false);
			router.push('/login');
		} catch (error) {
			console.error('Error logging out:', error);
		}
	};

	return (
		<>
			<header
				className={`${styles.header} ${
					isOpen ? styles['header--shifted'] : ''
				}`}
			>
				<div className={styles.header__container}>
				<nav className={styles.header__nav}>
	<div className={styles.header__left}>
		{isAdmin && (
			<button
				className={`${styles.toggleButton} ${
					isOpen ? styles['toggleButton--hidden'] : ''
				}`}
				onClick={() => setIsOpen(!isOpen)}
			>
				{isOpen ? <i className="fa-solid fa-x"></i> : <i className="fa-solid fa-bars"></i>}
			</button>
		)}
	</div>

	<div className={styles.header__center}>
		{isLoggedIn && (
			<ul className={`${styles.header__navList} ${styles['header__navList--first']}`}>
				<HeaderItem href="/" label="Activities" />
				<HeaderItem href="/?filter=published" label="Published" />
				<HeaderItem href="/?filter=unpublished" label="Unpublished" />
				<HeaderItem href="/?filter=drafts" label="Drafts" />
			</ul>
		)}
	</div>

	<div className={styles.header__right}>
		{isLoggedIn && (
			<ul className={styles.header__navList}>
				<li className={`${styles.header__navItem} ${styles.profileDropdownContainer}`}>
					<button
						className={styles.profileButton}
						onClick={() => setIsProfileOpen(!isProfileOpen)}
					>
						<i className="fas fa-user-circle"></i>
					</button>
					{isProfileOpen && (
						<div className={styles.profileDropdown}>
							<Link href="/profile" onClick={() => setIsProfileOpen(false)}>
								Profile
							</Link>
							<button onClick={handleLogout}>Logout</button>
						</div>
					)}
				</li>
			</ul>
		)}
	</div>
</nav>

				</div>
			</header>

			{isAdmin && (
				<div
					className={`${styles.sidebar} ${
						isOpen ? styles['sidebar--open'] : ''
					}`}
				>
					<div className={styles.sidebar__container}>
						<button
							className={styles.toggleButton}
							onClick={() => setIsOpen(!isOpen)}
						>
							{isOpen ? (
								<i className="fa-solid fa-x"></i>
							) : (
								<i className="fa-solid fa-bars"></i>
							)}
						</button>
					</div>
					<nav className={styles.sidebar__nav}>
						<ul className={styles.sidebar__navList}>
							<h2 className={styles.sidebar__title}>Admin</h2>

							<SidebarItem href="/users" label="Users" />
							<SidebarItem
								href="/activities/approve"
								label="Unapproved activities"
							/>
							<SidebarItem href="/statistics" label="Statistics" />
						</ul>

						<ul
							className={`${styles.sidebar__navList} ${styles['sidebar__navList--second']}`}
						>
							<h2 className={styles.sidebar__title}>Navigation</h2>

							<SidebarItem href="/" label="Home" />
							<SidebarItem href="/" label="Activities" />
							<SidebarItem href="/" label="Published" />
							<SidebarItem href="/" label="Unpublished" />
							<SidebarItem href="/" label="Drafts" />
						</ul>
					</nav>
				</div>
			)}
		</>
	);
};

const SidebarItem = ({ href, label }: { href: string; label: string }) => {
	return (
		<li className={styles.sidebar__navItem}>
			<Link href={href} className={styles.sidebar__navLink}>
				{label}
			</Link>
		</li>
	);
};

const HeaderItem = ({ href, label }: { href: string; label: string }) => {
	return (
		<li className={styles.header__navItem}>
			<Link href={href} className={styles.header__navLink}>
				{label}
			</Link>
		</li>
	);
};

export default Sidebar;
