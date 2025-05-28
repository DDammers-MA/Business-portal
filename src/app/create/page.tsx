'use client';

import { useState } from 'react';
import MultiStepForm from '../../components/multiple-steps-form/MultiStepForm';
import styles from './create.module.scss';
import { Tooltip } from '@heroui/tooltip';

export default function CreatePage() {
	const [selectedType, setSelectedType] = useState<'activity' | 'event'>(
		'activity'
	);

	const getDefaultFormData = (type: 'activity' | 'event') =>
		({
			title: '',
			type,
			name: '',
			addr: '',
			description: '',
			opening_hours: '',
			image_url: '',
			image_file: undefined,
			email: '',
			phone: '',
			budget: '',
			start_time: '',
			end_time: '',
			date: '',
			place: '',
			postal_code: '',
			active: true,
			status: 'inreview',
			openingTimes: {},
		} as const);

	return (
		<div className={styles.page}>
			<div className={styles.page__container}>
				<div className={styles.typeToggle}>
					<Tooltip
						className={styles.customTooltip}
						content="Activities are a one-time occurence, like a workshop or a class."
					>
						<button
							title="This is a tooltip"
							className={selectedType === 'activity' ? styles.active : ''}
							onClick={() => setSelectedType('activity')}
							type="button"
						>
							Activity
						</button>
					</Tooltip>

					<Tooltip
						className={styles.customTooltip}
						content="Events are recurring activities, like weekly meetups or regular series."
					>
						<button
							className={selectedType === 'event' ? styles.active : ''}
							onClick={() => setSelectedType('event')}
							type="button"
						>
							Event
						</button>
					</Tooltip>
				</div>

				<MultiStepForm
					mode="create"
					initialData={getDefaultFormData(selectedType)}
					key={selectedType}
				/>
			</div>
		</div>
	);
}
