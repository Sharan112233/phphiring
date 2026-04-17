import { NextRequest, NextResponse } from 'next/server'

const PROTECTED = ['/dashboard', '/notifications', '/post-job']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get('phphire_session')?.value

  const isProtected = PROTECTED.some(p => pathname.startsWith(p))

  if (isProtected && !token) {
    const url = req.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/notifications/:path*', '/post-job'],
}
