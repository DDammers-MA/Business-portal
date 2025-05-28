import { ReactNode } from 'react';

export interface FormData {
	title: string;
	id?: string;
	creatorUid?: string;
	type: string;
	name: string;
	addr: string;
	description: string;
	opening_hours: string;
	image_url: string;
	image_file?: File;
	email: string;
	phone: string;
	budget: string;
	start_time: string;
	end_time: string;
	date: string;
	place: string;
	postal_code: string;
	 region: string;
	active?: boolean;
	status?: 'published' | 'inreview' | 'denied' | 'draft';
	openingTimes: Record<string, { start: string; end: string } | undefined>;
}
