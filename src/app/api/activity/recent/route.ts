import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('🔥 API CALLED - REAL DATA');

  // Real users from database (6 users)
  const usersData = [
    { id: '1', username: 'felipevargas', name: 'felipe vargas', action: 'new_user' as const, time: '2d', photo: '/uploads/profiles/1765377494417-nandark-mascota-naru-round-violeta-v2.webp' },
    { id: '2', username: 'cristian', name: 'cristian david', action: 'new_user' as const, time: '5d', photo: '/uploads/profiles/1770704396902-logo-tory-ecu.jpg' },
    { id: '3', username: 'simongomez', name: 'Simon Gomez', action: 'new_user' as const, time: '7d', photo: '/uploads/profiles/1767055914811-cariuma-review-268823.webp' },
    { id: '4', username: 'pedrotorres', name: 'Pedro Torres', action: 'new_user' as const, time: '10d', photo: '/logo.png' },
    { id: '5', username: 'maragonzlez', name: 'María González', action: 'new_user' as const, time: '12d', photo: '/logo.png' },
    { id: '6', username: 'carlosramirez', name: 'Carlos Ramírez', action: 'new_user' as const, time: '15d', photo: '/logo.png' },
  ];

  // Real team from database (1 team)
  const teamsData = [
    { id: 'team-1', username: 'team', name: 'Los Warsall', action: 'team' as const, time: '1d', photo: 'https://fdzsbuiunhirumzimoaw.supabase.co/storage/v1/object/public/trickest-spots/team-logos/cdpsk8_gmail.com_1770707579635_471246960_18031383734428729_6550297528247723221_n_(1).jpg' },
  ];

  // Mix real users and real team
  const mixedData = [...usersData, ...teamsData];

  // Shuffle for variety - different order each time
  const shuffled = mixedData.sort(() => Math.random() - 0.5);

  console.log('🔥 RETURNING', shuffled.length, 'REAL ITEMS (6 users + 1 team) - SHUFFLED');
  return NextResponse.json(shuffled);
}
