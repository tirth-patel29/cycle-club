import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // If a POST request hits the root '/' (such as Razorpay webhook hitting cycleclub.tirthpatel.tech/)
  if (request.method === 'POST' && request.nextUrl.pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/api/webhooks/razorpay';
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/'],
};
