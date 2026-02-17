'use client';

import { useState, useEffect } from 'react';
import CommentForm from '@/components/molecules/CommentForm';
import CommentItem from '@/components/molecules/CommentItem';
import { MessageSquare, TrendingUp, Clock } from 'lucide-react';

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
  userId: string;
  userVote?: 'like' | 'dislike' | null;
  replyCount?: number; // Número de respuestas
}

interface SpotCommentsProps {
  spotId: number;
  maxHeight?: string;
  highlightCommentId?: number | null;
}

export default function SpotComments({ spotId, maxHeight = '400px', highlightCommentId }: SpotCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<'recent' | 'popular'>('recent');
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  const limit = 10;

  const fetchComments = async (append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setOffset(0);
      }

      const currentOffset = append ? offset : 0;
      const response = await fetch(
        `/api/spots/${spotId}/comments?sort=${sort}&limit=${limit}&offset=${currentOffset}`
      );

      if (!response.ok) {
        const data = await response.json();
        // El error puede ser un objeto o un string
        const errorMessage = typeof data.error === 'string'
          ? data.error
          : data.error?.message || data.data?.message || 'Error al cargar comentarios';
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Validar que la respuesta tenga la estructura esperada
      const commentsList = data.data?.comments || data.comments || [];
      const totalCount = data.data?.total || data.total || 0;
      const hasMoreValue = data.data?.hasMore ?? data.hasMore ?? false;

      if (append) {
        setComments((prev) => [...prev, ...commentsList]);
      } else {
        setComments(commentsList);
      }

      setTotal(totalCount);
      setHasMore(hasMoreValue);
      setOffset(currentOffset + commentsList.length);
      setError(null);

    } catch (err) {
      console.error('Error cargando comentarios:', err);
      setError(err instanceof Error ? err.message : String(err) || 'Error al cargar comentarios');
      // Asegurar que comments siempre sea un array
      setComments([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchComments(false);
  }, [spotId, sort]);

  // Scroll al comentario específico cuando terminan de cargar
  useEffect(() => {
    if (!highlightCommentId || loading) return;

    console.log('🔍 SpotComments: Buscando comentario', highlightCommentId);

    const scrollToComment = () => {
      const targetElement = document.getElementById(`comment-${highlightCommentId}`);
      console.log('📍 Elemento encontrado:', targetElement);

      if (targetElement) {
        console.log('✅ Haciendo scroll al comentario');
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        targetElement.classList.add('ring-4', 'ring-green-400', 'ring-opacity-75');
        setTimeout(() => {
          targetElement.classList.remove('ring-4', 'ring-green-400', 'ring-opacity-75');
        }, 2000);
        return true;
      }
      return false;
    };

    // Intentar scroll inmediatamente
    if (scrollToComment()) {
      console.log('✅ Scroll inmediato exitoso');
      return;
    }

    // Si no se encontró, expandir hilos y reintentar
    setTimeout(() => {
      console.log('⏳ Expandiendo hilos para buscar respuesta...');

      // Buscar botones "Ver X respuestas"
      const allButtons = Array.from(document.querySelectorAll('button'));
      const threadButtons = allButtons.filter(btn =>
        btn.textContent?.includes('Ver ') && btn.textContent?.includes(' respuesta')
      );

      console.log('📂 Hilos encontrados:', threadButtons.length);

      // Expandir todos los hilos
      threadButtons.forEach((btn, i) => {
        console.log(`📂 Expandiendo hilo ${i + 1}...`);
        (btn as HTMLButtonElement).click();
      });

      // Intentar scroll varias veces después de expandir
      let attempts = 0;
      const maxAttempts = 10; // Aumentar a 10 intentos

      const tryScroll = () => {
        attempts++;
        console.log(`🔎 Intento ${attempts}/${maxAttempts}`);

        if (scrollToComment()) {
          console.log('✅ Scroll exitoso');
          return;
        }

        if (attempts < maxAttempts) {
          setTimeout(tryScroll, 800); // Aumentar a 800ms entre intentos
        } else {
          console.log('❌ No se encontró el comentario después de expandir todos los hilos');
          const allComments = document.querySelectorAll('[id^="comment-"]');
          console.log('📋 Comentarios disponibles:', Array.from(allComments).map(c => c.id));
          console.log('❌ El comentario', highlightCommentId, 'no existe en ningún hilo');
        }
      };

      setTimeout(tryScroll, 1000); // Esperar 1 segundo antes del primer intento
    }, 1000);
  }, [highlightCommentId, loading]);

  const handleCommentCreated = () => {
    // Reset to first page and refetch
    setOffset(0);
    fetchComments(false);
  };

  const handleLoadMore = () => {
    fetchComments(true);
  };

  return (
    <div className="space-y-3">
      {/* Header with count and sort */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-cyan-400">
            {total} {total === 1 ? 'Comentario' : 'Comentarios'}
          </span>
        </div>

        {/* Sort toggle */}
        <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1 border border-slate-700">
          <button
            onClick={() => setSort('recent')}
            className={`
              px-2 py-1 rounded text-xs font-bold flex items-center gap-1 transition-all
              ${sort === 'recent'
                ? 'bg-purple-600 text-white'
                : 'text-slate-400 hover:text-white'
              }
            `}
          >
            <Clock className="w-3 h-3" />
            Recientes
          </button>
          <button
            onClick={() => setSort('popular')}
            className={`
              px-2 py-1 rounded text-xs font-bold flex items-center gap-1 transition-all
              ${sort === 'popular'
                ? 'bg-purple-600 text-white'
                : 'text-slate-400 hover:text-white'
              }
            `}
          >
            <TrendingUp className="w-3 h-3" />
            Populares
          </button>
        </div>
      </div>

      {/* Comment form */}
      <CommentForm spotId={spotId} onCommentCreated={handleCommentCreated} />

      {/* Error message */}
      {error && (
        <div className="bg-red-900/30 border-2 border-red-500 text-red-300 px-4 py-3 rounded-lg font-bold text-sm text-center">
          ❌ {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="bg-slate-800 border-2 border-slate-700 rounded-lg p-6 text-center">
          <div className="w-8 h-8 animate-spin border-4 border-cyan-400 border-t-transparent rounded-full mx-auto mb-2" />
          <p className="text-cyan-400 font-bold text-sm">Cargando comentarios...</p>
        </div>
      )}

      {/* Comments list */}
      {!loading && Array.isArray(comments) && comments.length > 0 && (
        <div className="space-y-3 overflow-y-auto" style={{ maxHeight }}>
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              id={comment.id}
              content={comment.content}
              likes={comment.likes}
              dislikes={comment.dislikes}
              isPinned={comment.isPinned}
              createdAt={comment.createdAt}
              user={comment.user}
              userId={comment.userId}
              spotId={spotId}
              userVote={comment.userVote}
              replyCount={comment.replyCount}
              highlightReplyId={highlightCommentId}
              onDelete={handleCommentCreated}
              onVoteChange={handleCommentCreated}
            />
          ))}

          {/* Load more button */}
          {hasMore && (
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 hover:border-cyan-400 rounded-lg font-bold text-cyan-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingMore ? 'Cargando...' : `Cargar más comentarios (${total - comments.length} restantes)`}
            </button>
          )}
        </div>
      )}

      {/* Empty state */}
      {!loading && comments.length === 0 && (
        <div className="bg-slate-800 border-2 border-slate-700 rounded-lg p-6 text-center">
          <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-2" />
          <p className="text-slate-400 font-bold mb-1">
            Aún no hay comentarios
          </p>
          <p className="text-slate-500 text-sm">
            ¡Sé el primero en compartir tu experiencia!
          </p>
        </div>
      )}
    </div>
  );
}
