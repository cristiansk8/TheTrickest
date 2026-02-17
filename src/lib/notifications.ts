import prisma from '@/app/lib/prisma';

/**
 * Helper functions para crear notificaciones automáticas
 */

export async function createNotification({
  userId,
  type,
  title,
  message,
  link,
  metadata,
}: {
  userId: string; // Email del usuario
  type: string;
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        link: link || null,
        metadata: metadata || null,
      },
    });
  } catch (error) {
    console.error('Error creando notificación:', error);
  }
}

// Notificación cuando un juez evalúa un submission
export async function notifySubmissionEvaluated({
  userEmail,
  submissionId,
  challengeName,
  score,
  status,
  judgeEmail,
  judgeName,
}: {
  userEmail: string;
  submissionId: number;
  challengeName: string;
  score: number | null;
  status: 'approved' | 'rejected';
  judgeEmail: string;
  judgeName: string | null;
}) {
  const isApproved = status === 'approved';
  const emoji = isApproved ? '✅' : '❌';
  const action = isApproved ? 'aprobó' : 'rechazó';

  await createNotification({
    userId: userEmail,
    type: 'submission_evaluated',
    title: `${emoji} Evaluación: ${challengeName}`,
    message: `${judgeName || 'Un juez'} ${action} tu truco${isApproved && score ? ` con ${score} puntos` : ''}`,
    link: `/dashboard/skaters/tricks`,
    metadata: {
      submissionId,
      challengeName,
      score,
      status,
      judgeEmail,
    },
  });
}

// Notificación cuando alguien te invita a un equipo
export async function notifyTeamInvitation({
  userEmail,
  teamName,
  teamId,
  inviterName,
}: {
  userEmail: string;
  teamName: string;
  teamId: number;
  inviterName: string | null;
}) {
  await createNotification({
    userId: userEmail,
    type: 'team_invitation',
    title: `👥 Invitación de equipo`,
    message: `${inviterName || 'Alguien'} te invitó a unirte a "${teamName}"`,
    link: `/dashboard/teams`,
    metadata: {
      teamId,
      teamName,
    },
  });
}

// Notificación cuando tu posición en el ranking cambia
export async function notifyRankingUpdate({
  userEmail,
  newPosition,
  oldPosition,
  category,
}: {
  userEmail: string;
  newPosition: number;
  oldPosition: number;
  category: 'individual' | 'team';
}) {
  const improved = newPosition < oldPosition;
  const emoji = improved ? '📈' : '📉';
  const action = improved ? 'subiste' : 'bajaste';
  const change = Math.abs(newPosition - oldPosition);

  await createNotification({
    userId: userEmail,
    type: 'ranking_update',
    title: `${emoji} Ranking actualizado`,
    message: `${action} ${change} ${change === 1 ? 'posición' : 'posiciones'} en el ranking ${category === 'team' ? 'de equipos' : 'individual'}. Ahora estás en el puesto #${newPosition}`,
    link: `/dashboard/ranking`,
    metadata: {
      newPosition,
      oldPosition,
      category,
    },
  });
}

// Notificación cuando alguien te sigue
export async function notifyNewFollower({
  userEmail,
  followerEmail,
  followerName,
  followerPhoto,
}: {
  userEmail: string;
  followerEmail: string;
  followerName: string | null;
  followerPhoto: string | null;
}) {
  await createNotification({
    userId: userEmail,
    type: 'new_follower',
    title: `🔔 Nuevo seguidor`,
    message: `${followerName || 'Un skater'} comenzó a seguirte`,
    link: `/profile/${followerEmail}`,
    metadata: {
      followerEmail,
      followerName,
      followerPhoto,
    },
  });
}

// Notificación cuando alguien vota tu submission
export async function notifyVoteReceived({
  userEmail,
  challengeName,
  submissionId,
  voteType,
}: {
  userEmail: string;
  challengeName: string;
  submissionId: number;
  voteType: 'upvote' | 'downvote';
}) {
  const emoji = voteType === 'upvote' ? '👍' : '👎';

  await createNotification({
    userId: userEmail,
    type: 'vote_received',
    title: `${emoji} Nuevo voto en "${challengeName}"`,
    message: `Tu submission recibió un ${voteType === 'upvote' ? 'voto positivo' : 'voto negativo'} de la comunidad`,
    link: `/dashboard/skaters/tricks`,
    metadata: {
      submissionId,
      challengeName,
      voteType,
    },
  });
}

// Notificación cuando una submission es aprobada por la comunidad
export async function notifyCommunityApproved({
  userEmail,
  challengeName,
  submissionId,
  upvotes,
}: {
  userEmail: string;
  challengeName: string;
  submissionId: number;
  upvotes: number;
}) {
  await createNotification({
    userId: userEmail,
    type: 'community_approved',
    title: `🎉 ¡Aprobado por la comunidad!`,
    message: `Tu truco "${challengeName}" fue aprobado automáticamente con ${upvotes} votos positivos`,
    link: `/dashboard/skaters/tricks`,
    metadata: {
      submissionId,
      challengeName,
      upvotes,
    },
  });
}

// Notificación cuando te aceptan en un equipo
export async function notifyTeamAccepted({
  userEmail,
  teamName,
  teamId,
}: {
  userEmail: string;
  teamName: string;
  teamId: number;
}) {
  await createNotification({
    userId: userEmail,
    type: 'team_accepted',
    title: `🎊 ¡Te uniste a un equipo!`,
    message: `Ahora eres parte de "${teamName}"`,
    link: `/dashboard/teams`,
    metadata: {
      teamId,
      teamName,
    },
  });
}
