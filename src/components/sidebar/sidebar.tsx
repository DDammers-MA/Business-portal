'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '../../../utils/firebase.browser';
import { useAuth } from '@/context/AuthContext';
import styles from './sidebar.module.scss';

import { usePathname, useSearchParams } from 'next/navigation';


type SidebarProps = {
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
	isAdmin: boolean;
	onClick?: () => void;
    href: string;
  label: string;

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
									{isOpen ? (
										<i className="fa-solid fa-x"></i>
									) : (
										<i className="fa-solid fa-bars"></i>
									)}
								</button>
							)}
						</div>

						<div className={styles.header__center}>
							{isLoggedIn && (
								<ul
									className={`${styles.header__navList} ${styles['header__navList--first']}`}
								>
									<HeaderItem href="/" label="Activities" />
									<HeaderItem href="/?filter=published" label="Published" />
									<HeaderItem href="/?filter=inreview" label="In review" />
									<HeaderItem href="/?filter=draft" label="Drafts" />
								</ul>
							)}
						</div>

						<div className={styles.header__right}>
							{isLoggedIn && (
								<ul className={styles.header__navList}>
								<li className={`${styles.profileDropdownContainer}`}>
										<button
											className={styles.profileButton}
											onClick={() => setIsProfileOpen(!isProfileOpen)}
										>
											<i className="fas fa-user-circle"></i>
										</button>
								
										{isProfileOpen && (
											<div className={styles.profileDropdown}>
												<Link
													href="/profile"
													onClick={() => setIsProfileOpen(false)}
												>
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

							<SidebarItem onClick={() => setIsOpen(false)} href="/users" label="Users" />
							<SidebarItem
								onClick={() => setIsOpen(false)}
								href="/activities/approve"
								label="Unapproved activities"
							/>
							<SidebarItem onClick={() => setIsOpen(false)} href="/statistics" label="Statistics" />
						</ul>

						<ul
							className={`${styles.sidebar__navList} ${styles['sidebar__navList--second']}`}
						>
							<h2 className={styles.sidebar__title}>Navigation</h2>


							<SidebarItem onClick={() => setIsOpen(false)} href="/" label="Activities" />
							<SidebarItem onClick={() => setIsOpen(false)} href="/" label="Published" />
							<SidebarItem onClick={() => setIsOpen(false)} href="/" label="Unpublished" />
							<SidebarItem onClick={() => setIsOpen(false)} href="/" label="Drafts" />
						</ul>
					</nav>
				</div>
			)}
		</>
	);
};

const SidebarItem = ({ href, label, onClick }: any) => {
  const pathname = usePathname();
  const isActive = pathname === '/activities';

  return (
    <li className={styles.sidebar__navItem} onClick={onClick}>
      <Link
        href={href}
        className={isActive ? styles.sidebar__activeLink : styles.sidebar__navLink}
      >
        {label}
      </Link>
    </li>
  );
}

const HeaderItem = ({ href, label }: { href: string; label: string }) => {
	const pathname = usePathname();

	const searchParams = useSearchParams();

	// Extract filter from the link and from the current URL
	const url = new URL(href, 'http://localhost'); // Use base to parse query string
	const targetFilter = url.searchParams.get('filter');
	const currentFilter = searchParams.get('filter');

	// Make it active if pathname matches and filter matches
	const isActive =
		pathname === url.pathname && targetFilter === currentFilter;

	return (
		<li className={styles.header__navItem}>
			<Link
				href={href}
				className={
					isActive
						? styles.sidebar__activeLink
						: styles.sidebar__navLink
				}
			>

				{label}
			</Link>
		</li>
	);
};
export default Sidebar;
