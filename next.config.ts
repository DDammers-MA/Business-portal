import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
	/* config options here */
	sassOptions: {
		includePaths: [path.join(__dirname, 'styles')],
		implementation: 'sass-embedded',
	},
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'firebasestorage.googleapis.com',
				port: '',
				pathname: '/v0/b/**', // Allow images from any bucket path
			},
		],
	},
};

export default nextConfig;
