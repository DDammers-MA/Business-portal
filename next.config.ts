import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
	/* config options here */
	sassOptions: {
		includePaths: [path.join(__dirname, 'styles')],
		implementation: 'sass-embedded',
	},
};

export default nextConfig;
