'use client';

import styles from '../page.module.scss';
import Activiteiten from '@/components/Activiteiten/activiteiten';
import { useSearchParams } from 'next/navigation';
import AddNewButton from '@/components/AddNewButton/AddNewButton';

export default function ActivitiesPage() {
	const searchParams = useSearchParams();
	const filterParam = searchParams.get('filter');
	const filter = filterParam === null ? undefined : filterParam;

	return (
		<>
			<AddNewButton />
			<main className={styles.page__main}>
				<Activiteiten filter={filter} contentType="activities" />
			</main>
		</>
	);
}
