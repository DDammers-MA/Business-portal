'use client';

import { useRouter } from 'next/navigation';
import styles from './not-found.module.scss';

export default function NotFound() {
	const router = useRouter();

	return (
		<div className={styles.notFound}>
			<div className={styles.content}>
				<h1 className={styles.title}>404</h1>
				<div className={styles.illustration}>
					<div className={styles.circle}></div>
					<div className={styles.clip}>
						<div className={styles.paper}>
							<div className={styles.face}>
								<div className={styles.eyes}>
									<div className={`${styles.eye} ${styles.eyeLeft}`}></div>
									<div className={`${styles.eye} ${styles.eyeRight}`}></div>
								</div>
								<div
									className={`${styles.rosyCheeks} ${styles.rosyLeft}`}
								></div>
								<div
									className={`${styles.rosyCheeks} ${styles.rosyRight}`}
								></div>
								<div className={styles.mouth}></div>
							</div>
						</div>
					</div>
				</div>
				<div className={styles.message}>
					<h2>Whoops!</h2>
					<p>We couldn&apos;t find the page you&apos;re looking for.</p>
				</div>
				<button onClick={() => router.push('/')} className={styles.button}>
					Return Home
				</button>
			</div>
		</div>
	);
}
