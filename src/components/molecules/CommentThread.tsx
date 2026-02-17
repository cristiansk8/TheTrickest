'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import CommentItem from './CommentItem';

interface User {
  name: string | null;
  photo: string | null;
  username: string | null;
}

interface Reply {
  id: number;
  content: string;
  likes: number;
  dislikes: number;
  isPinned: boolean;
  createdAt: string;
  user: User;
  userId: string;
  userVote?: 'like' | 'dislike' | null;
}

interface CommentThreadProps {
  spotId: number;
  commentId: number;
  replyCount: number;
  highlightReplyId?: number | null; // NEW: Reply to highlight
}

export default function CommentThread({ spotId, commentId, replyCount, highlightReplyId }: CommentThreadProps) {
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [total, setTotal] = useState(replyCount);

  // Auto-expandir si hay un reply para destacar
  useEffect(() => {
    if (highlightReplyId && !isExpanded && !loading) {
      console.log('🔍 CommentThread: Auto-expandiendo para destacar reply', highlightReplyId);
      fetchReplies();
    }
  }, [highlightReplyId]);

  const toggleReplies = () => {
    if (isExpanded) {
      // Colapsar
      setIsExpanded(false);
    } else {
      // Expandir - cargar respuestas
      fetchReplies();
    }
  };

  const fetchReplies = async () => {
    try {
      setLoading(true);
      setError(null);

      // Si hay un reply para destacar, cargar TODAS las respuestas (máximo 50)
      const limit = highlightReplyId ? 50 : 10;
      const response = await fetch(
        `/api/spots/${spotId}/comments/${commentId}/replies?limit=${limit}&offset=0`
      );

      if (!response.ok) {
        const data = await response.json();
        const errorMessage = typeof data.error === 'string'
          ? data.error
          : data.error?.message || data.data?.message || 'Error al cargar respuestas';
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const repliesList = data.data?.replies || data.replies || [];
      const totalCount = data.data?.total || data.total || 0;

      setReplies(repliesList);
      setTotal(totalCount);
      setIsExpanded(true);

    } catch (err) {
      console.error('Error cargando respuestas:', err);
      setError(err instanceof Error ? err.message : String(err) || 'Error al cargar respuestas');
    } finally {
      setLoading(false);
    }
  };

  const handleReplyDeleted = () => {
    // Recargar respuestas después de eliminar una
    fetchReplies();
  };

  const handleReplyVoted = () => {
    // Recargar respuestas para actualizar contadores
    if (isExpanded) {
      fetchReplies();
    }
  };

  if (total === 0) {
    return null;
  }

  return (
    <div className="ml-8 mt-2 border-l-2 border-slate-700 pl-4">
      {/* Toggle button */}
      <button
        onClick={toggleReplies}
        disabled={loading}
        className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-cyan-400 transition-colors disabled:opacity-50"
      >
        <MessageSquare className="w-3 h-3" />
        {isExpanded ? (
          <>
            <ChevronUp className="w-3 h-3" />
            Ocultar {total} {total === 1 ? 'respuesta' : 'respuestas'}
          </>
        ) : (
          <>
            <ChevronDown className="w-3 h-3" />
            Ver {total} {total === 1 ? 'respuesta' : 'respuestas'}
          </>
        )}
        {loading && (
          <div className="w-3 h-3 animate-spin border-2 border-cyan-400 border-t-transparent rounded-full" />
        )}
      </button>

      {/* Error message */}
      {error && (
        <div className="mt-2 text-xs text-red-400">
          ❌ {error}
        </div>
      )}

      {/* Replies list */}
      {isExpanded && !loading && replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {replies.map((reply) => (
            <div key={reply.id} className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
              <CommentItem
                id={reply.id}
                content={reply.content}
                likes={reply.likes}
                dislikes={reply.dislikes}
                isPinned={reply.isPinned}
                createdAt={reply.createdAt}
                user={reply.user}
                userId={reply.userId}
                spotId={spotId}
                userVote={reply.userVote}
                onDelete={handleReplyDeleted}
                onVoteChange={handleReplyVoted}
                isReply={true}
              />
            </div>
          ))}

          {/* Load more (if has more) */}
          {replies.length < total && (
            <button
              onClick={() => fetchReplies()}
              className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-cyan-400 rounded-lg font-bold text-xs text-slate-300 hover:text-cyan-400 transition-all"
            >
              Cargar más respuestas ({total - replies.length} restantes)
            </button>
          )}
        </div>
      )}

      {/* No replies */}
      {isExpanded && !loading && replies.length === 0 && (
        <div className="mt-2 text-xs text-slate-500">
          Aún no hay respuestas. ¡Sé el primero!
        </div>
      )}
    </div>
  );
}
