'use client';

import { useEffect, useState } from 'react';
import { MessageSquare, TrendingUp, ChevronDown } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface User {
  name: string | null;
  photo: string | null;
  username: string | null;
}

interface Comment {
  id: number;
  content: string;
  likes: number;
  dislikes: number;
  isPinned: boolean;
  createdAt: string;
  user: User;
}

interface TopCommentPreviewProps {
  spotId: number;
  spotName: string;
  onViewAllComments: () => void;
}

export default function TopCommentPreview({
  spotId,
  spotName,
  onViewAllComments,
}: TopCommentPreviewProps) {
  const { data: session } = useSession();
  const [topComment, setTopComment] = useState<Comment | null>(null);
  const [totalComments, setTotalComments] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopComment = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/spots/${spotId}/top-comment`);
        const data = await response.json();

        if (data.success && data.data.hasComments) {
          setTopComment(data.data.comment);
          setTotalComments(data.data.totalComments);
        }
      } catch (error) {
        console.error('Error fetching top comment:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopComment();
  }, [spotId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'ahora mismo';
    if (diffMins < 60) return `hace ${diffMins} min`;
    if (diffHours < 24) return `hace ${diffHours}h`;
    if (diffDays < 7) return `hace ${diffDays}d`;
    return date.toLocaleDateString('es-ES');
  };

  if (loading) {
    return (
      <div className="mt-3 pt-3 border-t border-slate-200">
        <div className="flex items-center justify-center py-2">
          <div className="w-4 h-4 animate-spin border-2 border-cyan-400 border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  // No hay comentarios
  if (!topComment) {
    return (
      <div className="mt-3 pt-3 border-t border-slate-200">
        <button
          onClick={onViewAllComments}
          className="w-full py-2 px-3 bg-cyan-600 hover:bg-cyan-700 border-2 border-cyan-400 rounded-lg text-white font-bold transition-all flex items-center justify-center gap-2"
        >
          <MessageSquare className="w-4 h-4" />
          Sé el primero en comentar
        </button>
      </div>
    );
  }

  // Hay comentarios - mostrar el top
  return (
    <div className="mt-3 pt-3 border-t border-slate-200">
      {/* Header del preview */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1 text-sm">
          <TrendingUp className="w-4 h-4 text-green-500" />
          <span className="font-bold text-green-600">
            Comentario destacado
          </span>
        </div>
        <span className="text-xs text-slate-500">
          {totalComments} {totalComments === 1 ? 'comentario' : 'comentarios'}
        </span>
      </div>

      {/* Top comment preview */}
      <div className="bg-slate-50 border border-slate-300 rounded-lg p-3">
        {/* Autor */}
        <div className="flex items-center gap-2 mb-2">
          {topComment.user.photo ? (
            <img
              src={topComment.user.photo}
              alt={topComment.user.name || 'Usuario'}
              className="w-6 h-6 rounded-full border border-slate-300 object-cover"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
              {topComment.user.name?.charAt(0).toUpperCase() || '?'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-900 truncate">
              {topComment.user.name || 'Usuario'}
            </p>
            <p className="text-[10px] text-slate-500">
              {formatDate(topComment.createdAt)}
            </p>
          </div>
        </div>

        {/* Contenido (truncado) */}
        <p className="text-xs text-slate-700 line-clamp-2 mb-2">
          {topComment.content.length > 100
            ? topComment.content.substring(0, 100) + '...'
            : topComment.content}
        </p>

        {/* Likes badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs">
            <span className="text-green-500 font-bold">❤️ {topComment.likes}</span>
            {topComment.dislikes > 0 && (
              <span className="text-red-400 font-bold">👎 {topComment.dislikes}</span>
            )}
          </div>

          {/* Botón "Ver más" */}
          <button
            onClick={onViewAllComments}
            className="text-xs font-bold text-cyan-600 hover:text-cyan-700 flex items-center gap-1"
          >
            Ver todos
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Botón completo */}
      <button
        onClick={onViewAllComments}
        className="w-full mt-2 py-2 px-3 bg-slate-100 hover:bg-cyan-50 border-2 border-slate-300 hover:border-cyan-400 rounded-lg font-bold text-slate-700 hover:text-cyan-700 transition-all text-sm flex items-center justify-center gap-2"
      >
        <MessageSquare className="w-4 h-4" />
        Ver todos los comentarios ({totalComments})
      </button>

      {!session && (
        <p className="text-[10px] text-slate-500 text-center mt-1">
          🔒 Inicia sesión para comentar
        </p>
      )}
    </div>
  );
}
