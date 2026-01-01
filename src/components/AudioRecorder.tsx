import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Mic, Square, AlertCircle, Trash2 } from 'lucide-react';

interface AudioRecorderProps {
  onAudioRecorded: (file: File, url: string) => void;
  darkMode: boolean;
}

export function AudioRecorder({ onAudioRecorded, darkMode }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const MAX_RECORDING_TIME = 300; // 5 minutes

  useEffect(() => {
    // Check microphone permission
    checkMicrophonePermission();

    return () => {
      stopRecording();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const checkMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setPermissionGranted(true);
      setError(null);
    } catch (err) {
      setPermissionGranted(false);
      setError('Microphone access denied. Please allow microphone access to record audio.');
    }
  };

  const startRecording = async () => {
    try {
      setError(null);
      chunksRef.current = [];
      setAudioBlob(null);

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        } 
      });
      
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        
        // Convert to File
        const file = new File([blob], `recording-${Date.now()}.webm`, {
          type: 'audio/webm',
        });
        
        const url = URL.createObjectURL(blob);
        onAudioRecorded(file, url);

        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= MAX_RECORDING_TIME) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      setError('Failed to start recording. Please check your microphone permissions.');
      console.error('Recording error:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const handleClear = () => {
    setAudioBlob(null);
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div>
      <motion.div
        className={`rounded-2xl p-12 text-center ${
          darkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'
        }`}
      >
        {!permissionGranted && !error && (
          <div className="mb-6">
            <p className="opacity-70">Checking microphone permissions...</p>
          </div>
        )}

        {!audioBlob ? (
          <div>
            <motion.div
              className="relative inline-block mb-6"
              animate={isRecording ? { scale: [1, 1.1, 1] } : {}}
              transition={{ repeat: isRecording ? Infinity : 0, duration: 1.5 }}
            >
              <div
                className={`w-32 h-32 rounded-full flex items-center justify-center ${
                  isRecording
                    ? 'bg-red-500 shadow-lg shadow-red-500/50'
                    : darkMode
                    ? 'bg-purple-500/20'
                    : 'bg-purple-100'
                }`}
              >
                {isRecording ? (
                  <div className="relative">
                    <Square className="w-12 h-12 text-white" />
                    <motion.div
                      className="absolute inset-0 border-4 border-white rounded-full"
                      animate={{ scale: [1, 1.5], opacity: [1, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    />
                  </div>
                ) : (
                  <Mic className="w-12 h-12 text-purple-500" />
                )}
              </div>
            </motion.div>

            {isRecording && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-6"
              >
                <div className="text-4xl mb-2 text-red-500">{formatTime(recordingTime)}</div>
                <p className="opacity-70">Recording in progress...</p>
                <div className="flex items-center justify-center gap-2 mt-4">
                  <motion.div
                    className="w-2 h-2 bg-red-500 rounded-full"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  />
                  <motion.div
                    className="w-2 h-8 bg-red-500 rounded-full"
                    animate={{ height: [8, 32, 8] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-red-500 rounded-full"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                  />
                </div>
              </motion.div>
            )}

            {!isRecording && (
              <div className="mb-6">
                <h3 className="text-2xl mb-2">Record Your Voice</h3>
                <p className="opacity-70">
                  Click the button below to start recording
                </p>
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={isRecording ? stopRecording : startRecording}
              disabled={!permissionGranted}
              className={`px-8 py-4 rounded-xl text-white transition-all ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600'
                  : permissionGranted
                  ? 'bg-purple-500 hover:bg-purple-600'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {isRecording ? (
                <>
                  <Square className="inline w-5 h-5 mr-2" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="inline w-5 h-5 mr-2" />
                  Start Recording
                </>
              )}
            </motion.button>

            {!isRecording && (
              <p className="text-sm opacity-50 mt-4">
                Maximum recording time: {formatTime(MAX_RECORDING_TIME)}
              </p>
            )}
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-4">
                <Mic className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl mb-2">Recording Complete</h3>
              <p className="opacity-70">Duration: {formatTime(recordingTime)}</p>
            </div>

            <button
              onClick={handleClear}
              className={`px-6 py-3 rounded-lg transition-colors inline-flex items-center gap-2 ${
                darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              Record Again
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
          <div>
            <p>{error}</p>
            {!permissionGranted && (
              <button
                onClick={checkMicrophonePermission}
                className="mt-2 underline"
              >
                Try Again
              </button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
