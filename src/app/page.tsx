'use client';
import styles from './page.module.scss';
import Activiteiten from '@/components/Activiteiten/activiteiten';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';


export default function Home() {
	const searchParams = useSearchParams();
	const filterParam = searchParams.get('filter');
	const filter = filterParam === null ? undefined : filterParam;

	return (
		<>
			


			<button className={styles.modal__button}>
				<Link href="/create">Add new</Link>
			</button>

			<main className={styles.page__main}>
				<Activiteiten filter={filter} />
			</main>
		</>
	);
}
