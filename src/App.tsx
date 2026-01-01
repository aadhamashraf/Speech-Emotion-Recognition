import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Mic, Moon, Sun } from 'lucide-react';
import { AudioUpload } from './components/AudioUpload';
import { AudioRecorder } from './components/AudioRecorder';
import { AudioPlayer } from './components/AudioPlayer';
import { EmotionResults } from './components/EmotionResults';
import { HistoryPanel } from './components/HistoryPanel';

export interface EmotionPrediction {
  emotion: string;
  confidence: number;
  timestamp: Date;
  audioName?: string;
}

export interface EmotionResult {
  primary: {
    emotion: string;
    confidence: number;
  };
  all: Array<{
    emotion: string;
    confidence: number;
  }>;
}

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [view, setView] = useState<'home' | 'upload' | 'record'>('home');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<EmotionResult | null>(null);
  const [history, setHistory] = useState<EmotionPrediction[]>([]);

  const emotionColors: Record<string, string> = {
    happy: '#FFD700',
    sad: '#4A90E2',
    angry: '#E74C3C',
    fearful: '#9B59B6',
    neutral: '#95A5A6',
    surprised: '#F39C12',
    disgusted: '#16A085',
  };

  const handleAudioSelected = (file: File, url: string) => {
    setAudioFile(file);
    setAudioUrl(url);
    setResult(null);
  };

  const handleAnalyze = async () => {
    if (!audioFile) return;

    setIsAnalyzing(true);
    setResult(null);

    // Simulate emotion analysis with realistic delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock emotion prediction
    const emotions = ['happy', 'sad', 'angry', 'fearful', 'neutral', 'surprised', 'disgusted'];
    const primaryEmotion = emotions[Math.floor(Math.random() * emotions.length)];
    const primaryConfidence = 65 + Math.random() * 30; // 65-95%

    const otherEmotions = emotions
      .filter(e => e !== primaryEmotion)
      .map(emotion => ({
        emotion,
        confidence: Math.random() * (100 - primaryConfidence),
      }))
      .sort((a, b) => b.confidence - a.confidence);

    const mockResult: EmotionResult = {
      primary: {
        emotion: primaryEmotion,
        confidence: primaryConfidence,
      },
      all: [
        { emotion: primaryEmotion, confidence: primaryConfidence },
        ...otherEmotions,
      ].sort((a, b) => b.confidence - a.confidence),
    };

    setResult(mockResult);
    setIsAnalyzing(false);

    // Add to history
    setHistory(prev => [
      {
        emotion: primaryEmotion,
        confidence: primaryConfidence,
        timestamp: new Date(),
        audioName: audioFile.name,
      },
      ...prev.slice(0, 9), // Keep last 10
    ]);
  };

  const handleReset = () => {
    setAudioFile(null);
    setAudioUrl(null);
    setResult(null);
    setView('home');
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Header */}
      <header className={`border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl">Speech Emotion Recognition</h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-lg transition-colors ${
              darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'
            }`}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto text-center"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-5xl mb-6">Analyze Emotions from Speech</h2>
                <p className="text-xl mb-12 opacity-80">
                  Upload an audio file or record your voice to detect emotional tone using advanced AI.
                  Get instant insights with confidence scores and beautiful visualizations.
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-6 mb-12">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setView('upload')}
                  className={`p-8 rounded-2xl border-2 transition-all ${
                    darkMode
                      ? 'border-blue-500 bg-blue-500/10 hover:bg-blue-500/20'
                      : 'border-blue-500 bg-blue-50 hover:bg-blue-100'
                  }`}
                >
                  <Upload className="w-12 h-12 mx-auto mb-4 text-blue-500" />
                  <h3 className="text-2xl mb-2">Upload Audio</h3>
                  <p className="opacity-80">Choose a WAV, MP3, or FLAC file</p>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setView('record')}
                  className={`p-8 rounded-2xl border-2 transition-all ${
                    darkMode
                      ? 'border-purple-500 bg-purple-500/10 hover:bg-purple-500/20'
                      : 'border-purple-500 bg-purple-50 hover:bg-purple-100'
                  }`}
                >
                  <Mic className="w-12 h-12 mx-auto mb-4 text-purple-500" />
                  <h3 className="text-2xl mb-2">Record Voice</h3>
                  <p className="opacity-80">Record directly from your browser</p>
                </motion.button>
              </div>

              {history.length > 0 && <HistoryPanel history={history} darkMode={darkMode} />}
            </motion.div>
          )}

          {view === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <button
                onClick={handleReset}
                className={`mb-6 px-4 py-2 rounded-lg transition-colors ${
                  darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                ← Back to Home
              </button>

              <AudioUpload onAudioSelected={handleAudioSelected} darkMode={darkMode} />

              {audioUrl && (
                <div className="mt-8">
                  <AudioPlayer audioUrl={audioUrl} darkMode={darkMode} />

                  <div className="mt-6 text-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleAnalyze}
                      disabled={isAnalyzing}
                      className={`px-8 py-4 rounded-xl text-white text-xl transition-all ${
                        isAnalyzing
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg'
                      }`}
                    >
                      {isAnalyzing ? 'Analyzing Audio...' : 'Analyze Emotion'}
                    </motion.button>
                  </div>
                </div>
              )}

              {result && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mt-12"
                >
                  <EmotionResults result={result} emotionColors={emotionColors} darkMode={darkMode} />
                </motion.div>
              )}
            </motion.div>
          )}

          {view === 'record' && (
            <motion.div
              key="record"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <button
                onClick={handleReset}
                className={`mb-6 px-4 py-2 rounded-lg transition-colors ${
                  darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                ← Back to Home
              </button>

              <AudioRecorder onAudioRecorded={handleAudioSelected} darkMode={darkMode} />

              {audioUrl && (
                <div className="mt-8">
                  <AudioPlayer audioUrl={audioUrl} darkMode={darkMode} />

                  <div className="mt-6 text-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleAnalyze}
                      disabled={isAnalyzing}
                      className={`px-8 py-4 rounded-xl text-white text-xl transition-all ${
                        isAnalyzing
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg'
                      }`}
                    >
                      {isAnalyzing ? 'Analyzing Audio...' : 'Analyze Emotion'}
                    </motion.button>
                  </div>
                </div>
              )}

              {result && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mt-12"
                >
                  <EmotionResults result={result} emotionColors={emotionColors} darkMode={darkMode} />
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className={`border-t mt-20 ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center opacity-60">
          <p>Speech Emotion Recognition System • Powered by AI</p>
        </div>
      </footer>
    </div>
  );
}