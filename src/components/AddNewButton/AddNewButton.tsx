import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import styles from './addNewButton.module.scss';

const AddNewButton = () => {
	const { isAdmin } = useAuth();
	if (isAdmin) {
		return null;
	}

	return (
		<Link className={styles.addNewButton} href="/create">
			<i className="fa-solid fa-plus"></i>Add new
		</Link>
	);
};

export default AddNewButton;
