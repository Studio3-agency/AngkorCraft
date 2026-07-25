import React, { useRef, useState } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { uploadImage, deleteMedia } from '../lib/api';

interface ImageUploadProps {
  value: string;
  publicId?: string | null;
  folder?: string;
  onChange: (url: string, publicId: string | null) => void;
}

/**
 * Image picker backed by Cloudinary. Uploads the chosen file via a
 * backend-signed request and returns the secure URL + public id. Replacing an
 * existing uploaded image deletes the old Cloudinary asset.
 */
export const ImageUpload: React.FC<ImageUploadProps> = ({ value, publicId, folder = 'angkorcraft', onChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const result = await uploadImage(file, folder);
      // Clean up the previous Cloudinary asset if we're replacing one.
      if (publicId) {
        deleteMedia(publicId).catch(() => {});
      }
      onChange(result.url, result.publicId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4">
        <div className="w-24 h-24 rounded-xl border-2 border-dashed border-[#E8DEC8] bg-[#FAF7F2] overflow-hidden flex items-center justify-center shrink-0">
          {value ? (
            <img src={value} alt="preview" className="w-full h-full object-cover" />
          ) : (
            <ImagePlus className="w-6 h-6 text-[#BF5A36]/50" />
          )}
        </div>
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 bg-[#134E4A] hover:bg-[#0f3d3a] disabled:opacity-60 text-white text-xs font-semibold px-3 py-2 rounded-lg cursor-pointer"
          >
            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImagePlus className="w-3.5 h-3.5" />}
            {uploading ? 'Uploading…' : value ? 'Replace image' : 'Upload image'}
          </button>
          {value && !uploading && (
            <button
              type="button"
              onClick={() => {
                if (publicId) deleteMedia(publicId).catch(() => {});
                onChange('', null);
              }}
              className="flex items-center gap-1 text-[#BF5A36] text-xs font-semibold cursor-pointer hover:underline"
            >
              <X className="w-3 h-3" /> Remove
            </button>
          )}
        </div>
      </div>
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
};
