import MultiStepForm from '../../components/multiple-steps-form/MultiStepForm';
import styles from './create.module.scss';

export default function Home() {
	return (
		<div className={styles.page}>
			<div className={styles.page__container}>
				{/* <h1 className={styles.page__title}>Multi-Step Form</h1> */}
				<MultiStepForm mode="create" />
			</div>
		</div>
	);
}
