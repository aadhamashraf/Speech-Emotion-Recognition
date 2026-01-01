import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface AudioPlayerProps {
  audioUrl: string;
  darkMode: boolean;
}

export function AudioPlayer({ audioUrl, darkMode }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [waveformData, setWaveformData] = useState<number[]>([]);

  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      generateWaveform();
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);

  const generateWaveform = () => {
    // Generate mock waveform data
    const bars = 50;
    const data = Array.from({ length: bars }, () => Math.random() * 0.7 + 0.3);
    setWaveformData(data);
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const time = parseFloat(e.target.value);
    audio.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const vol = parseFloat(e.target.value);
    audio.volume = vol;
    setVolume(vol);
    setIsMuted(vol === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume || 0.5;
      setIsMuted(false);
      setVolume(volume || 0.5);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={`rounded-2xl p-6 ${
        darkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'
      }`}
    >
      <audio ref={audioRef} src={audioUrl} />

      {/* Waveform Visualization */}
      <div className="mb-6">
        <h3 className="text-lg mb-4">Audio Preview</h3>
        <div className="flex items-end justify-between gap-1 h-24 mb-2">
          {waveformData.map((height, index) => {
            const progress = currentTime / duration;
            const barProgress = index / waveformData.length;
            const isActive = barProgress <= progress;

            return (
              <motion.div
                key={index}
                className={`flex-1 rounded-full transition-colors ${
                  isActive
                    ? 'bg-gradient-to-t from-blue-500 to-purple-500'
                    : darkMode
                    ? 'bg-gray-700'
                    : 'bg-gray-300'
                }`}
                style={{ height: `${height * 100}%` }}
                initial={{ height: 0 }}
                animate={{ height: `${height * 100}%` }}
                transition={{ delay: index * 0.01 }}
              />
            );
          })}
        </div>
      </div>

      {/* Time Display */}
      <div className="flex justify-between text-sm opacity-70 mb-2">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      {/* Progress Bar */}
      <input
        type="range"
        min="0"
        max={duration || 0}
        value={currentTime}
        onChange={handleSeek}
        className="w-full h-2 rounded-lg appearance-none cursor-pointer mb-4"
        style={{
          background: `linear-gradient(to right, ${
            darkMode ? '#6366f1' : '#8b5cf6'
          } 0%, ${darkMode ? '#6366f1' : '#8b5cf6'} ${
            (currentTime / duration) * 100
          }%, ${darkMode ? '#374151' : '#e5e7eb'} ${
            (currentTime / duration) * 100
          }%, ${darkMode ? '#374151' : '#e5e7eb'} 100%)`,
        }}
      />

      {/* Controls */}
      <div className="flex items-center justify-between">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={togglePlay}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
            darkMode
              ? 'bg-purple-500 hover:bg-purple-600'
              : 'bg-purple-500 hover:bg-purple-600'
          }`}
        >
          {isPlaying ? (
            <Pause className="w-6 h-6 text-white" />
          ) : (
            <Play className="w-6 h-6 text-white ml-0.5" />
          )}
        </motion.button>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleMute}
            className={`p-2 rounded-lg transition-colors ${
              darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
            }`}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-24 h-2 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, ${
                darkMode ? '#6366f1' : '#8b5cf6'
              } 0%, ${darkMode ? '#6366f1' : '#8b5cf6'} ${
                (isMuted ? 0 : volume) * 100
              }%, ${darkMode ? '#374151' : '#e5e7eb'} ${
                (isMuted ? 0 : volume) * 100
              }%, ${darkMode ? '#374151' : '#e5e7eb'} 100%)`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
