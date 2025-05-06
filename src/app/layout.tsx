// layout.tsx (SERVER COMPONENT)
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Script from 'next/script';
// import Footer from '@/components/footer/footer';
import LayoutWrapper from '@/app/layoutWrapper'; // <- new client-side wrapper
import { Toaster } from 'sonner';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
	display: 'swap',
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
	display: 'swap',
});

export const metadata: Metadata = {
	title: 'Bussiness portal DoeDeal',
	description: 'Add your activities here!',
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<head>
				<Script
					src="https://kit.fontawesome.com/8a111eb1bb.js"
					crossOrigin="anonymous"
					strategy="afterInteractive"
				/>
			</head>
			<body className={`${geistSans.variable} ${geistMono.variable}`}>
			<Toaster richColors position="top-center" />
				<LayoutWrapper>{children}</LayoutWrapper>
	
			</body>
		</html>
	);
}
