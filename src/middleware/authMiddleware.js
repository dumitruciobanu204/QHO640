import { NextResponse } from 'next/server';
import { auth } from '../../firebase/firebaseconfig';

export async function middleware(request) {
    const user = auth.currentUser;

    if (!user) {
        const url = new URL(request.url);
        if (url.pathname.startsWith('/booking')) {  
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/booking/:path*'],
};
