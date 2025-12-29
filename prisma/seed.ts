import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Hash de la contraseña para todos los usuarios de prueba
  const defaultPassword = await bcrypt.hash('password123', 10);
  console.log('🔐 Contraseña hasheada: password123');

  // 1. Crear usuarios de prueba (Admin y Jueces)
  console.log('👥 Creando usuarios...');

  const admin = await prisma.user.upsert({
    where: { email: 'admin@trickest.com' },
    update: {
      password: defaultPassword, // Actualizar contraseña si ya existe
    },
    create: {
      email: 'admin@trickest.com',
      name: 'Admin Trickest',
      password: defaultPassword,
      role: 'admin',
      profileStatus: 'complete',
      photo: '/logo.png',
    },
  });

  const judge1 = await prisma.user.upsert({
    where: { email: 'judge1@trickest.com' },
    update: {
      password: defaultPassword, // Actualizar contraseña si ya existe
    },
    create: {
      email: 'judge1@trickest.com',
      name: 'Carlos Ramírez',
      password: defaultPassword,
      role: 'judge',
      profileStatus: 'complete',
      photo: '/logo.png',
    },
  });

  const judge2 = await prisma.user.upsert({
    where: { email: 'judge2@trickest.com' },
    update: {
      password: defaultPassword, // Actualizar contraseña si ya existe
    },
    create: {
      email: 'judge2@trickest.com',
      name: 'María González',
      password: defaultPassword,
      role: 'judge',
      profileStatus: 'complete',
      photo: '/logo.png',
    },
  });

  const judge3 = await prisma.user.upsert({
    where: { email: 'judge3@trickest.com' },
    update: {
      password: defaultPassword, // Actualizar contraseña si ya existe
    },
    create: {
      email: 'judge3@trickest.com',
      name: 'Pedro Torres',
      password: defaultPassword,
      role: 'judge',
      profileStatus: 'complete',
      photo: '/logo.png',
    },
  });

  console.log('✅ Usuarios creados');

  // 2. Crear los 10 niveles de challenges + bonus
  console.log('🎯 Creando challenges...');

  const challenges = [
    {
      level: 1,
      name: 'Ollie',
      description: 'El truco fundamental del skateboarding. Salta con tu tabla sin usar las manos.',
      demoVideoUrl: 'https://www.youtube.com/watch?v=QkeOAcj8Y5k',
      difficulty: 'easy',
      points: 100,
      isBonus: false,
    },
    {
      level: 2,
      name: 'Kickflip',
      description: 'Haz que la tabla gire 360° sobre su eje longitudinal mientras estás en el aire.',
      demoVideoUrl: 'https://www.youtube.com/watch?v=ZOtJdT9p-n8',
      difficulty: 'medium',
      points: 150,
      isBonus: false,
    },
    {
      level: 3,
      name: 'Heelflip',
      description: 'Similar al kickflip pero la tabla gira en dirección opuesta usando el talón.',
      demoVideoUrl: 'https://www.youtube.com/watch?v=VBhWU4OvkdA',
      difficulty: 'medium',
      points: 150,
      isBonus: false,
    },
    {
      level: 4,
      name: '50-50 Grind',
      description: 'Deslízate sobre un rail o borde con ambos trucks simultáneamente.',
      demoVideoUrl: 'https://www.youtube.com/watch?v=7qrT38TnH5A',
      difficulty: 'medium',
      points: 200,
      isBonus: false,
    },
    {
      level: 5,
      name: 'Boardslide',
      description: 'Deslízate sobre un obstáculo con el centro de la tabla perpendicular al rail.',
      demoVideoUrl: 'https://www.youtube.com/watch?v=ioODobuRguU',
      difficulty: 'medium',
      points: 200,
      isBonus: false,
    },
    {
      level: 6,
      name: 'Pop Shove-it',
      description: 'La tabla gira 180° horizontalmente mientras saltas.',
      demoVideoUrl: 'https://www.youtube.com/watch?v=y8p_vFJWa_8',
      difficulty: 'medium',
      points: 180,
      isBonus: false,
    },
    {
      level: 7,
      name: '360 Flip (Tre Flip)',
      description: 'Combina un kickflip con un 360 shove-it. La tabla gira en dos ejes.',
      demoVideoUrl: 'https://www.youtube.com/watch?v=aHrn3-Cb3iM',
      difficulty: 'hard',
      points: 300,
      isBonus: false,
    },
    {
      level: 8,
      name: 'Hardflip',
      description: 'Combinación de frontside shove-it y kickflip. Truco técnico avanzado.',
      demoVideoUrl: 'https://www.youtube.com/watch?v=QXbWCrzWJo8',
      difficulty: 'hard',
      points: 350,
      isBonus: false,
    },
    {
      level: 9,
      name: 'Nollie Heelflip',
      description: 'Heelflip ejecutado desde nollie (pop con la nariz de la tabla).',
      demoVideoUrl: 'https://www.youtube.com/watch?v=7Jxb0M8qXHw',
      difficulty: 'hard',
      points: 400,
      isBonus: false,
    },
    {
      level: 10,
      name: 'Switch Kickflip',
      description: 'Kickflip en stance opuesto a tu postura natural. Requiere dominio total.',
      demoVideoUrl: 'https://www.youtube.com/watch?v=CTeXKHkNqgk',
      difficulty: 'expert',
      points: 500,
      isBonus: false,
    },
    {
      level: 0,
      name: 'BONUS: Impossible',
      description: '¡NIVEL BONUS! La tabla da una vuelta vertical completa alrededor de tu pie trasero.',
      demoVideoUrl: 'https://www.youtube.com/watch?v=dWfn7sToTkE',
      difficulty: 'expert',
      points: 1000,
      isBonus: true,
    },
  ];

  for (const challengeData of challenges) {
    await prisma.challenge.upsert({
      where: {
        level_isBonus: {
          level: challengeData.level,
          isBonus: challengeData.isBonus
        }
      },
      update: challengeData,
      create: challengeData,
    });
  }

  console.log('✅ Challenges creados');

  // 3. Crear usuarios skaters de prueba
  console.log('🛹 Creando skaters de prueba...');

  const skaters = [
    {
      email: 'skater1@trickest.com',
      username: 'tony_hawk_jr',
      name: 'Antonio Rodríguez',
      password: defaultPassword,
      role: 'skater',
      profileStatus: 'complete',
    },
    {
      email: 'skater2@trickest.com',
      username: 'street_rider',
      name: 'Laura Martínez',
      password: defaultPassword,
      role: 'skater',
      profileStatus: 'complete',
    },
    {
      email: 'skater3@trickest.com',
      username: 'flip_master',
      name: 'Diego Santos',
      password: defaultPassword,
      role: 'skater',
      profileStatus: 'complete',
    },
    {
      email: 'skater4@trickest.com',
      username: 'gnar_shredder',
      name: 'Sofía Gómez',
      password: defaultPassword,
      role: 'skater',
      profileStatus: 'complete',
    },
    {
      email: 'skater5@trickest.com',
      username: 'vert_legend',
      name: 'Miguel Ángel Ruiz',
      password: defaultPassword,
      role: 'skater',
      profileStatus: 'complete',
    },
  ];

  const createdSkaters = [];
  for (const skaterData of skaters) {
    const skater = await prisma.user.upsert({
      where: { email: skaterData.email },
      update: { password: defaultPassword },
      create: skaterData,
    });
    createdSkaters.push(skater);
  }

  console.log('✅ Skaters creados');

  // 4. Crear submissions de prueba (pending)
  console.log('📹 Creando submissions pendientes...');

  // URLs de videos de ejemplo (skateboarding tricks reales de YouTube)
  const videoUrls = [
    'https://www.youtube.com/watch?v=339ZL9Z7uGk', // Ollie tutorial
    'https://www.youtube.com/watch?v=GkXXQT1Z5U8', // Kickflip
    'https://www.youtube.com/watch?v=G-R50KqYy1I', // Pop Shove-it
    'https://www.youtube.com/watch?v=DJGbSwWTp1Y', // Heelflip
    'https://www.youtube.com/watch?v=8B8K_VGCrzk', // Varial Kickflip
  ];

  // Obtener los primeros 5 challenges
  const firstChallenges = await prisma.challenge.findMany({
    where: { isBonus: false },
    take: 5,
    orderBy: { level: 'asc' },
  });

  const submissions = [];
  for (let i = 0; i < createdSkaters.length && i < firstChallenges.length; i++) {
    const submission = await prisma.submission.create({
      data: {
        userId: createdSkaters[i].email,
        challengeId: firstChallenges[i].id,
        videoUrl: videoUrls[i],
        status: 'pending',
        submittedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Últimos 7 días
      },
    });
    submissions.push(submission);
  }

  console.log(`✅ ${submissions.length} submissions pendientes creadas`);

  console.log('🎉 Seed completado exitosamente!');
  console.log('\n📊 Resumen:');
  console.log(`- 1 Admin: ${admin.email}`);
  console.log(`- 3 Jueces: ${judge1.email}, ${judge2.email}, ${judge3.email}`);
  console.log(`- 5 Skaters de prueba`);
  console.log(`- 10 Niveles de trucos + 1 Bonus`);
  console.log(`- 5 Submissions pendientes para evaluar`);
  console.log('\n🔐 Credenciales de Prueba:');
  console.log('================================');
  console.log('📧 Admin/Jueces:');
  console.log('  - admin@trickest.com (Admin)');
  console.log('  - judge1@trickest.com (Juez)');
  console.log('  - judge2@trickest.com (Juez)');
  console.log('  - judge3@trickest.com (Juez)');
  console.log('\n📧 Skaters:');
  console.log('  - skater1@trickest.com (@tony_hawk_jr)');
  console.log('  - skater2@trickest.com (@street_rider)');
  console.log('  - skater3@trickest.com (@flip_master)');
  console.log('  - skater4@trickest.com (@gnar_shredder)');
  console.log('  - skater5@trickest.com (@vert_legend)');
  console.log('\n🔑 Contraseña para todos: password123');
  console.log('================================');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
