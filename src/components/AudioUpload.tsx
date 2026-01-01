import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Upload, File, X, AlertCircle } from 'lucide-react';

interface AudioUploadProps {
  onAudioSelected: (file: File, url: string) => void;
  darkMode: boolean;
}

export function AudioUpload({ onAudioSelected, darkMode }: AudioUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ACCEPTED_FORMATS = ['audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/flac', 'audio/x-flac'];
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  const MAX_DURATION = 300; // 5 minutes

  const validateFile = async (file: File): Promise<boolean> => {
    setError(null);

    // Check file type
    if (!ACCEPTED_FORMATS.includes(file.type) && !file.name.match(/\.(wav|mp3|flac)$/i)) {
      setError('Unsupported file format. Please upload WAV, MP3, or FLAC files.');
      return false;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      setError('File is too large. Maximum size is 50MB.');
      return false;
    }

    // Check duration (basic check using Audio element)
    try {
      const audio = new Audio();
      const url = URL.createObjectURL(file);
      
      await new Promise((resolve, reject) => {
        audio.addEventListener('loadedmetadata', () => {
          if (audio.duration > MAX_DURATION) {
            setError('Audio is too long. Maximum duration is 5 minutes.');
            reject();
          } else if (audio.duration < 0.5) {
            setError('Audio is too short. Minimum duration is 0.5 seconds.');
            reject();
          } else {
            resolve(true);
          }
          URL.revokeObjectURL(url);
        });
        audio.addEventListener('error', () => {
          setError('Failed to load audio file. Please try another file.');
          reject();
        });
        audio.src = url;
      });
    } catch {
      return false;
    }

    return true;
  };

  const handleFile = async (file: File) => {
    const isValid = await validateFile(file);
    if (isValid) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      onAudioSelected(file, url);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-blue-500 bg-blue-500/10 scale-105'
            : darkMode
            ? 'border-gray-700 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-800'
            : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'
        }`}
        whileHover={{ scale: selectedFile ? 1 : 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".wav,.mp3,.flac,audio/wav,audio/mpeg,audio/mp3,audio/flac"
          onChange={handleFileInput}
          className="hidden"
          aria-label="Upload audio file"
        />

        {!selectedFile ? (
          <>
            <Upload className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-2xl mb-2">Upload Audio File</h3>
            <p className="opacity-70 mb-4">
              Drag and drop your audio file here, or click to browse
            </p>
            <p className="text-sm opacity-50">
              Supported formats: WAV, MP3, FLAC • Max size: 50MB • Max duration: 5 minutes
            </p>
          </>
        ) : (
          <div className="flex items-center justify-center gap-4">
            <File className="w-8 h-8 text-blue-500" />
            <div className="flex-1 text-left">
              <p className="truncate">{selectedFile.name}</p>
              <p className="text-sm opacity-60">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className={`p-2 rounded-lg transition-colors ${
                darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
              }`}
              aria-label="Remove file"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-4 p-4 rounded-lg flex items-start gap-3 ${
            darkMode ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600'
          }`}
        >
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <p>{error}</p>
        </motion.div>
      )}
    </div>
  );
}
