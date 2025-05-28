import { useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import styles from './FilterTabs.module.scss';

interface FilterTabsProps {
	baseUrl?: string;
}

const FilterTabs = ({ baseUrl = '/' }: FilterTabsProps) => {
	const searchParams = useSearchParams();
	const pathname = usePathname();
	const currentFilter = searchParams.get('filter');

	const currentPath = pathname.split('?')[0];

	const shouldShowFilters = ['/', '/activities', '/events'].includes(
		currentPath
	);

	if (!shouldShowFilters) {
		return null;
	}

	const currentBaseUrl = currentPath;

	const filters = [
		{ label: 'All', value: null },
		{ label: 'Published', value: 'published' },
		{ label: 'In Review', value: 'inreview' },
		{ label: 'Denied', value: 'denied' },
		{ label: 'Drafts', value: 'draft' },
	];

	return (
		<div className={styles.filterTabs}>
			<div className={styles.filterTabs__container}>
				<div className={styles.filterTabs__wrapper}>
					{filters.map((filter) => {
						const href = filter.value
							? `${currentBaseUrl}?filter=${filter.value}`
							: currentBaseUrl;

						const isActive =
							filter.value === currentFilter ||
							(!filter.value && !currentFilter);

						return (
							<Link
								key={filter.label}
								href={href}
								className={`${styles.filterTab} ${
									isActive ? styles.filterTab__active : ''
								}`}
							>
								{filter.label}
							</Link>
						);
					})}
				</div>
			</div>
		</div>
	);
};

export default FilterTabs;
