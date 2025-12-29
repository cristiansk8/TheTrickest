'use client';

import { Camera, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { useRef, useState } from 'react';

interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (imageUrl: string) => void;
}

export default function ImageUpload({
  currentImage,
  onImageChange,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Solo se permiten imágenes');
      return;
    }

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no debe superar 5MB');
      return;
    }

    setUploading(true);

    try {
      // Crear FormData para enviar el archivo
      const formData = new FormData();
      formData.append('file', file);

      // Subir a tu API
      const response = await fetch('/api/upload/profile-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Error al subir la imagen');

      const data = await response.json();
      const imageUrl = data.url;

      setPreview(imageUrl);
      onImageChange(imageUrl);
    } catch (error) {
      console.error('Error al subir imagen:', error);
      alert('Error al subir la imagen. Intenta de nuevo.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    onImageChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Preview de la imagen */}
      <div className="relative group">
        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-cyan-500 shadow-lg shadow-cyan-500/50 overflow-hidden bg-slate-800 flex items-center justify-center">
          {preview ? (
            <Image
              src={preview}
              alt="Profile"
              width={160}
              height={160}
              className="w-full h-full object-cover"
            />
          ) : (
            <Camera className="w-12 h-12 text-slate-600" />
          )}
        </div>

        {/* Botón de eliminar (solo si hay imagen) */}
        {preview && !uploading && (
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 border-2 border-white shadow-lg transform hover:scale-110 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Overlay de carga */}
        {uploading && (
          <div className="absolute inset-0 bg-black/70 rounded-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-b-4 border-cyan-400"></div>
          </div>
        )}
      </div>

      {/* Botón de upload */}
      <div className="flex flex-col items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id="profile-image-upload"
        />
        <label
          htmlFor="profile-image-upload"
          className={`cursor-pointer bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold py-2 px-6 rounded-lg border-2 border-white uppercase tracking-wider text-sm shadow-lg transform hover:scale-105 transition-all flex items-center gap-2 ${
            uploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Upload className="w-4 h-4" />
          {uploading ? 'Subiendo...' : 'Cambiar Foto'}
        </label>
        <p className="text-xs text-slate-400 text-center">
          JPG, PNG o GIF (máx. 5MB)
        </p>
      </div>
    </div>
  );
}
