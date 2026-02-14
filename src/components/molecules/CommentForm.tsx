'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Send } from 'lucide-react';

interface CommentFormProps {
  spotId: number;
  onCommentCreated: () => void;
  placeholder?: string;
}

export default function CommentForm({
  spotId,
  onCommentCreated,
  placeholder = 'Comparte tu experiencia en este spot...',
}: CommentFormProps) {
  const { data: session } = useSession();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const maxLength = 500;
  const remainingChars = maxLength - content.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user?.email) {
      setError('Debes iniciar sesión para comentar');
      setTimeout(() => setError(null), 3000);
      return;
    }

    const trimmedContent = content.trim();

    if (!trimmedContent) {
      setError('El comentario no puede estar vacío');
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (trimmedContent.length > maxLength) {
      setError(`El comentario excede los ${maxLength} caracteres`);
      setTimeout(() => setError(null), 3000);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/spots/${spotId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: trimmedContent }),
      });

      const data = await response.json();

      if (!response.ok) {
        // El error puede ser un objeto o un string
        const errorMessage = typeof data.error === 'string'
          ? data.error
          : data.error?.message || data.data?.message || 'Error al crear comentario';
        setError(errorMessage);
        setTimeout(() => setError(null), 3000);
        return;
      }

      // Success
      setSuccess('¡Comentario publicado!');
      setContent('');
      setTimeout(() => setSuccess(null), 2000);
      onCommentCreated();

    } catch (err) {
      console.error('Error creando comentario:', err);
      setError('Error al crear comentario. Inténtalo de nuevo.');
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {/* Error message */}
      {error && (
        <div className="bg-red-900/30 border border-red-500 text-red-300 px-3 py-2 rounded text-sm font-bold">
          ⚠️ {error}
        </div>
      )}

      {/* Success message */}
      {success && (
        <div className="bg-green-900/30 border border-green-500 text-green-300 px-3 py-2 rounded text-sm font-bold">
          ✅ {success}
        </div>
      )}

      {/* Textarea */}
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          disabled={isSubmitting}
          maxLength={maxLength}
          rows={3}
          className={`
            w-full px-3 py-2 bg-neutral-900 border-2 rounded-lg text-white
            focus:outline-none focus:border-accent-cyan-400 resize-none
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-red-500' : 'border-neutral-700'}
            transition-colors
          `}
        />

        {/* Character counter */}
        <div className={`absolute bottom-2 right-2 text-xs font-bold ${
          remainingChars < 20 ? 'text-red-400' : 'text-neutral-500'
        }`}>
          {remainingChars}
        </div>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={isSubmitting || !content.trim() || !session}
        className={`
          w-full font-bold py-2 px-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2
          ${isSubmitting || !content.trim() || !session
            ? 'bg-neutral-700 border-neutral-600 text-neutral-500 cursor-not-allowed'
            : 'bg-accent-purple-600 hover:bg-accent-purple-700 border-accent-purple-400 text-white cursor-pointer'
          }
        `}
      >
        {isSubmitting ? (
          <>
            <div className="w-4 h-4 animate-spin border-2 border-white border-t-transparent rounded-full" />
            Publicando...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            {session ? 'Comentar' : 'Inicia sesión para comentar'}
          </>
        )}
      </button>

      {!session && (
        <p className="text-[10px] text-neutral-500 text-center">
          🔒 Necesitas una cuenta para comentar
        </p>
      )}
    </form>
  );
}
