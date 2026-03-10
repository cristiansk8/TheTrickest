import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('🔥 API CALLED - TEST VERSION');

  // Use the exact URLs from the database (they already work in leaderboard)
  const testData = [
    { id: '1', username: 'felipevargas', name: 'felipe vargas', action: 'new_user' as const, time: '2d', photo: '/uploads/profiles/1765377494417-nandark-mascota-naru-round-violeta-v2.webp' },
    { id: '2', username: 'cristian', name: 'cristian david', action: 'new_user' as const, time: '5d', photo: '/uploads/profiles/1770704396902-logo-tory-ecu.jpg' },
    { id: '3', username: 'simongomez', name: 'Simon Gomez', action: 'new_user' as const, time: '7d', photo: '/uploads/profiles/1767055914811-cariuma-review-268823.webp' },
    { id: '4', username: 'pedrotorres', name: 'Pedro Torres', action: 'new_user' as const, time: '10d', photo: '/logo.png' },
    { id: '5', username: 'maragonzlez', name: 'María González', action: 'new_user' as const, time: '12d', photo: '/logo.png' },
    { id: '6', username: 'carlosramirez', name: 'Carlos Ramírez', action: 'new_user' as const, time: '15d', photo: '/logo.png' },
  ];

  console.log('🔥 RETURNING', testData.length, 'USERS');
  return NextResponse.json(testData);
}
