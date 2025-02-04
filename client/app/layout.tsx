import "../globals.css";
import { Metadata } from "next";
import { Fira_Code as FontMono, Inter as FontSans } from "next/font/google";

const fontSans = FontSans({
	subsets: ["latin"],
	variable: "--font-sans",
});

const fontMono = FontMono({
	subsets: ["latin"],
	variable: "--font-geist-mono",
});

export const metadata: Metadata = {
	title: {
		default: "EduClarify AI",
		template: `%s - EduClarify AI`,
	},
	icons: {
		icon: "/heygen-logo.png",
	},
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html suppressHydrationWarning className={`${fontSans.variable} ${fontMono.variable} font-sans dark`} lang="en">
			<head />
			<body className="min-h-screen bg-zinc-950 text-white antialiased">
				<main className="relative flex flex-col h-screen w-screen">{children}</main>
			</body>
		</html>
	);
}
