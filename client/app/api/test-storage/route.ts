import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'Storage test endpoint',
    timestamp: new Date().toISOString(),
    env: {
      serverUrl: process.env.NEXT_PUBLIC_SERVER_URL,
      hasGoogleClientId: !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    }
  });
}
