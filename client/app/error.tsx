"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<div className="min-h-screen bg-zinc-950 flex items-center justify-center">
			<div className="text-center">
				<div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30">
					<span className="text-4xl">⚠️</span>
				</div>
				<h2 className="text-2xl font-bold text-white mb-4">Something went wrong!</h2>
				<p className="text-zinc-400 mb-6">An unexpected error occurred. Please try again.</p>
				<button
					onClick={() => reset()}
					className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-medium rounded-lg transition-colors"
				>
					Try again
				</button>
			</div>
		</div>
	);
}
