export async function optimizeImage(file: File): Promise<File> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');

		img.onload = () => {
			// Calculate new dimensions (maintaining aspect ratio)
			let width = img.width;
			let height = img.height;
			const maxWidth = 1200;
			const maxHeight = 800;

			if (width > maxWidth) {
				height = (height * maxWidth) / width;
				width = maxWidth;
			}
			if (height > maxHeight) {
				width = (width * maxHeight) / height;
				height = maxHeight;
			}

			// Set canvas dimensions
			canvas.width = width;
			canvas.height = height;

			// Draw and compress image
			ctx?.drawImage(img, 0, 0, width, height);

			// Convert to blob with compression
			canvas.toBlob(
				(blob) => {
					if (!blob) {
						reject(new Error('Failed to create blob'));
						return;
					}

					// Create new file
					const optimizedFile = new File(
						[blob],
						file.name.replace(/\.[^/.]+$/, '') + '_optimized.jpg',
						{
							type: 'image/jpeg',
						}
					);

					resolve(optimizedFile);
				},
				'image/jpeg',
				0.8 // Quality: 0.8 = 80%
			);
		};

		img.onerror = () => {
			reject(new Error('Failed to load image'));
		};

		// Create object URL from file
		img.src = URL.createObjectURL(file);
	});
}

// Helper function to check if file needs optimization
export function shouldOptimizeImage(file: File): boolean {
	// Only process images
	if (!file.type.startsWith('image/')) {
		return false;
	}

	// Skip if already optimized
	if (file.name.includes('_optimized')) {
		return false;
	}

	// Skip if file is smaller than 500KB
	if (file.size < 500 * 1024) {
		return false;
	}

	return true;
}
