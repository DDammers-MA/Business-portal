import { zxcvbn, zxcvbnOptions, ZxcvbnResult } from '@zxcvbn-ts/core';
import * as zxcvbnCommonPackage from '@zxcvbn-ts/language-common';
import * as zxcvbnEnPackage from '@zxcvbn-ts/language-en';

// Load the common and English dictionaries
const options = {
	dictionary: {
		...zxcvbnCommonPackage.dictionary,
		...zxcvbnEnPackage.dictionary,
	},
	graphs: zxcvbnCommonPackage.adjacencyGraphs,
	translations: zxcvbnEnPackage.translations,
};
zxcvbnOptions.setOptions(options);

export function checkPasswordStrength(password: string): ZxcvbnResult {
	return zxcvbn(password);
}

async function sha1(text: string): Promise<string> {
	const encoder = new TextEncoder();
	const data = encoder.encode(text);
	const hashBuffer = await crypto.subtle.digest('SHA-1', data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const hashHex = hashArray
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
	return hashHex.toUpperCase();
}

export async function isPasswordPwned(password: string): Promise<boolean> {
	try {
		const hash = await sha1(password);
		const prefix = hash.substring(0, 5);
		const suffix = hash.substring(5);

		const response = await fetch(
			`https://api.pwnedpasswords.com/range/${prefix}`
		);

		if (!response.ok) {
			throw new Error(`HIBP API request failed: ${response.statusText}`);
		}

		const text = await response.text();
		const lines = text.split('\r\n');

		for (const line of lines) {
			const [hashSuffix, count] = line.split(':');
			if (hashSuffix === suffix) {
				console.warn(`Password found in HIBP database ${count} times.`);
				return true;
			}
		}

		return false;
	} catch (error) {
		console.error('Error checking password against HIBP:', error);
		throw new Error('Could not verify password security. Please try again.');
	}
}

export function generateSecurePassword(): string {
	const lowercase = 'abcdefghijklmnopqrstuvwxyz';
	const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	const numbers = '0123456789';
	const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';

	// Ensure at least one of each required character type
	let password = '';
	password += uppercase[Math.floor(Math.random() * uppercase.length)]; // One uppercase
	password += lowercase[Math.floor(Math.random() * lowercase.length)]; // One lowercase
	password += numbers[Math.floor(Math.random() * numbers.length)]; // One number
	password += special[Math.floor(Math.random() * special.length)]; // One special

	// Add 8 more random characters to make it 12 characters long and more random
	const allChars = lowercase + uppercase + numbers + special;
	for (let i = 0; i < 8; i++) {
		password += allChars[Math.floor(Math.random() * allChars.length)];
	}

	// Shuffle the password to make it more random
	return password
		.split('')
		.sort(() => Math.random() - 0.5)
		.join('');
}
