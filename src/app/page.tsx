'use client';

import { Modal } from '@/components/modal/modal';
import styles from './page.module.scss';
import Activiteiten from '@/components/Activiteiten/activiteiten';
import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
	const [isModalOpen, setIsModalOpen] = useState(false);
	return (
		<>
			{/* <button
				onClick={() => {
					setIsModalOpen(true);
				}}
				className={styles.modal__button}
			>
				open Modal
			</button> */}

			<button className={styles.modal__button}>
				<Link href='/create'>Add new</Link>
			</button>
 
			<Modal
				isOpen={isModalOpen}
				onClose={() => {
					setIsModalOpen(false);
				}}
			>
				<p>hallo</p>
			</Modal>

			<main className={styles.page__main}>
				<Activiteiten />
			</main>
		</>
	);
}
