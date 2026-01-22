'use client';

import { useState, useRef } from 'react';
import { Camera, X, Upload } from 'lucide-react';

interface PhotoUploaderProps {
  onUploadComplete: (url: string) => void;
  maxPhotos?: number;
  currentPhotos?: string[];
  spotId?: number;
}

export default function PhotoUploader({
  onUploadComplete,
  maxPhotos = 10,
  currentPhotos = [],
  spotId
}: PhotoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Solo se permiten archivos de imagen');
      return;
    }

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no puede superar 5MB');
      return;
    }

    // Validar límite de fotos
    if (currentPhotos.length >= maxPhotos) {
      alert(`Máximo ${maxPhotos} fotos permitidas`);
      return;
    }

    // Convertir a base64
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;

      setUploading(true);

      try {
        const response = await fetch('/api/upload/photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            file: base64,
            filename: file.name,
            fileType: 'spot-photo'
          })
        });

        if (response.ok) {
          const data = await response.json();
          onUploadComplete(data.url);
        } else {
          const error = await response.json();
          alert(`Error: ${error.message}`);
        }
      } catch (error) {
        console.error('Error uploading photo:', error);
        alert('Error al subir la foto');
      } finally {
        setUploading(false);
      }
    };

    reader.readAsDataURL(file);
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-black uppercase">📸 Fotos del Spot</h3>
        <span className="text-cyan-400 text-sm">
          {currentPhotos.length}/{maxPhotos}
        </span>
      </div>

      {/* Botón de Upload */}
      <div className="flex gap-2">
        <button
          onClick={handleCameraClick}
          disabled={uploading || currentPhotos.length >= maxPhotos}
          className="flex-1 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded border-2 border-cyan-300 transition-all flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Subiendo...
            </>
          ) : (
            <>
              <Camera className="w-5 h-5" />
              {currentPhotos.length > 0 ? 'Agregar Otra' : 'Subir Foto'}
            </>
          )}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading || currentPhotos.length >= maxPhotos}
        />
      </div>

      {/* Preview de fotos */}
      {currentPhotos.length > 0 && (
        <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
          {currentPhotos.map((photo, index) => (
            <div key={index} className="relative group">
              <img
                src={photo}
                alt={`Foto ${index + 1}`}
                className="w-full h-20 object-cover rounded-lg border-2 border-cyan-400"
              />
              <button
                onClick={() => {/* TODO: Implementar delete */}}
                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Info */}
      <div className="bg-slate-800/50 border border-slate-600 rounded p-3">
        <p className="text-cyan-100 text-xs">
          <strong>Tip:</strong> Las fotos ayudan a que otros skaters reconozcan el spot más rápido.
          {' '}
          Máximo {maxPhotos} fotos de 5MB cada una.
        </p>
      </div>
    </div>
  );
}
