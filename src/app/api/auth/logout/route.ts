import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Temporary simple logout (no cookie handling)
    return NextResponse.json({ message: 'Logged out successfully' })
  } catch (err) {
    console.error('Logout error:', err)

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}