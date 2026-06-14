'use client';

import React, { useState } from 'react';
// Helper: compress image files before upload
async function compressImage(file: File, maxSizeMB = 1): Promise<File> {
  // Only compress image files
  if (!file.type.startsWith('image/')) return file;
  // If already small enough, skip
  if (file.size <= maxSizeMB * 1024 * 1024) return file;

  return new Promise((resolve) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      // Scale down proportionally
      let { width, height } = img;
      const maxDim = 1600; // max 1600px on longest side
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressed = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressed);
          } else {
            resolve(file);
          }
        },
        'image/jpeg',
        0.7 // quality 70%
      );
    };
    img.onerror = () => resolve(file);
    img.src = url;
  });
}

import {
  CheckCircle,
  Users,
  DollarSign,
  Award,
  Clock,
  Globe,
} from 'lucide-react';

const AplicarPage = () => {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg p-12 text-center border-t-4 border-red-500">
        <h1 className="text-4xl font-bold mb-6 text-gray-800">
          PROCESO <span className="text-red-600">CERRADO</span>
        </h1>
        <p className="text-xl text-gray-600">
          El proceso de aplicación para el examen del Board Latinoamericano de Perfusion ha concluido. 
        </p>
        <p className="mt-4 text-gray-500">
          Agradecemos a todos los participantes.
        </p>
      </div>
    </div>
  );
};

export default AplicarPage;