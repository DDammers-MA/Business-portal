import React, { useState, useEffect } from 'react';
import { checkPasswordStrength } from '@/utils/passwordUtils';
import styles from './password-field.module.scss';
import { toast } from 'sonner';

interface PasswordFieldProps {
	password: string;
	setPassword: (password: string) => void;
	repeatPassword: string;
	setRepeatPassword: (password: string) => void;
	isLoading?: boolean;
}

interface Requirement {
	id: string;
	text: string;
	validate: (pwd: string) => boolean;
	icon: string;
}

const passwordRequirements: Requirement[] = [
	{
		id: 'length',
		text: 'At least 12 characters long',
		validate: (pwd: string) => pwd.length >= 12,
		icon: 'fa-ruler-horizontal',
	},
	{
		id: 'uppercase',
		text: 'One uppercase letter',
		validate: (pwd: string) => /[A-Z]/.test(pwd),
		icon: 'fa-arrow-up',
	},
	{
		id: 'lowercase',
		text: 'One lowercase letter',
		validate: (pwd: string) => /[a-z]/.test(pwd),
		icon: 'fa-arrow-down',
	},
	{
		id: 'number',
		text: 'One number',
		validate: (pwd: string) => /[0-9]/.test(pwd),
		icon: 'fa-hashtag',
	},
	{
		id: 'special',
		text: 'One special character',
		validate: (pwd: string) => /[^A-Za-z0-9]/.test(pwd),
		icon: 'fa-star',
	},
];

export const PasswordField: React.FC<PasswordFieldProps> = ({
	password,
	setPassword,
	repeatPassword,
	setRepeatPassword,
	isLoading = false,
}) => {
	const [showPassword, setShowPassword] = useState(false);
	const [showRepeatPassword, setShowRepeatPassword] = useState(false);
	const [requirementStatuses, setRequirementStatuses] = useState<
		Record<string, boolean>
	>({});
	const [passwordStrength, setPasswordStrength] = useState(0);
	const [passwordsMatch, setPasswordsMatch] = useState(true);

	useEffect(() => {
		// Update requirement statuses
		const newStatuses = passwordRequirements.reduce(
			(acc, req) => ({
				...acc,
				[req.id]: req.validate(password),
			}),
			{}
		);
		setRequirementStatuses(newStatuses);

		// Check password strength
		if (password) {
			const strength = checkPasswordStrength(password);
			setPasswordStrength(strength.score);
		} else {
			setPasswordStrength(0);
		}

		// Check if passwords match
		if (repeatPassword) {
			setPasswordsMatch(password === repeatPassword);
		}
	}, [password, repeatPassword]);

	const getStrengthColor = () => {
		switch (passwordStrength) {
			case 0:
				return '#ff4444';
			case 1:
				return '#ffa700';
			case 2:
				return '#ffdb4a';
			case 3:
				return '#9acd32';
			case 4:
				return '#00b300';
			default:
				return '#e0e0e0';
		}
	};

	const getStrengthText = () => {
		switch (passwordStrength) {
			case 0:
				return 'Very Weak';
			case 1:
				return 'Weak';
			case 2:
				return 'Fair';
			case 3:
				return 'Strong';
			case 4:
				return 'Very Strong';
			default:
				return '';
		}
	};

	return (
		<div className={styles.passwordFieldContainer}>
			<div className={styles.passwordInputGroup}>
				<label htmlFor="password">Password:</label>
				<div className={styles.passwordInput}>
					<input
						id="password"
						type={showPassword ? 'text' : 'password'}
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						disabled={isLoading}
						className={styles.inputField}
					/>
					<button
						type="button"
						onClick={() => setShowPassword(!showPassword)}
						className={styles.showPasswordButton}
						disabled={isLoading}
					>
						<i
							className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}
						></i>
					</button>
				</div>
			</div>

			<div className={styles.passwordInputGroup}>
				<label htmlFor="repeatPassword">Repeat Password:</label>
				<div className={styles.passwordInput}>
					<input
						id="repeatPassword"
						type={showRepeatPassword ? 'text' : 'password'}
						value={repeatPassword}
						onChange={(e) => setRepeatPassword(e.target.value)}
						disabled={isLoading}
						className={`${styles.inputField} ${
							repeatPassword && !passwordsMatch ? styles.error : ''
						}`}
					/>
					<button
						type="button"
						onClick={() => setShowRepeatPassword(!showRepeatPassword)}
						className={styles.showPasswordButton}
						disabled={isLoading}
					>
						<i
							className={`fa-solid ${
								showRepeatPassword ? 'fa-eye-slash' : 'fa-eye'
							}`}
						></i>
					</button>
				</div>
				{repeatPassword && !passwordsMatch && (
					<span className={styles.errorText}>Passwords do not match</span>
				)}
			</div>

			{password && (
				<>
					<div className={styles.strengthMeter}>
						<div className={styles.strengthBar}>
							{[...Array(5)].map((_, index) => (
								<div
									key={index}
									className={`${styles.strengthSegment} ${
										index <= passwordStrength ? styles.active : ''
									}`}
									style={{
										backgroundColor:
											index <= passwordStrength
												? getStrengthColor()
												: undefined,
									}}
								/>
							))}
						</div>
						<span
							className={styles.strengthText}
							style={{ color: getStrengthColor() }}
						>
							{getStrengthText()}
						</span>
					</div>

					<div className={styles.requirements}>
						<p>Password requirements:</p>
						<div className={styles.requirementsList}>
							{passwordRequirements.map((req) => (
								<div
									key={req.id}
									className={`${styles.requirement} ${
										requirementStatuses[req.id] ? styles.valid : styles.invalid
									}`}
								>
									<i
										className={`fa-solid ${req.icon} ${styles.requirementIcon}`}
									></i>
									<span>{req.text}</span>
									<i
										className={`fa-solid ${
											requirementStatuses[req.id] ? 'fa-check' : 'fa-xmark'
										} ${styles.statusIcon}`}
									></i>
								</div>
							))}
						</div>
					</div>
				</>
			)}
		</div>
	);
};
