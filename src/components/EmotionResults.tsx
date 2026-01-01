import { motion } from 'motion/react';
import { Smile, Frown, Angry, Meh, Zap, ThumbsDown, AlertCircle } from 'lucide-react';
import { EmotionResult } from '../App';

interface EmotionResultsProps {
  result: EmotionResult;
  emotionColors: Record<string, string>;
  darkMode: boolean;
}

const emotionIcons: Record<string, React.ReactNode> = {
  happy: <Smile className="w-16 h-16" />,
  sad: <Frown className="w-16 h-16" />,
  angry: <Angry className="w-16 h-16" />,
  fearful: <AlertCircle className="w-16 h-16" />,
  neutral: <Meh className="w-16 h-16" />,
  surprised: <Zap className="w-16 h-16" />,
  disgusted: <ThumbsDown className="w-16 h-16" />,
};

const emotionLabels: Record<string, string> = {
  happy: 'Happy',
  sad: 'Sad',
  angry: 'Angry',
  fearful: 'Fearful',
  neutral: 'Neutral',
  surprised: 'Surprised',
  disgusted: 'Disgusted',
};

export function EmotionResults({ result, emotionColors, darkMode }: EmotionResultsProps) {
  const primaryColor = emotionColors[result.primary.emotion];
  const topThree = result.all.slice(0, 3);

  return (
    <div>
      {/* Primary Emotion Display */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`rounded-2xl p-12 text-center mb-8 ${
          darkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'
        }`}
        style={{
          boxShadow: `0 0 40px ${primaryColor}40`,
        }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mb-6"
          style={{ color: primaryColor }}
        >
          {emotionIcons[result.primary.emotion]}
        </motion.div>

        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-5xl mb-4"
          style={{ color: primaryColor }}
        >
          {emotionLabels[result.primary.emotion]}
        </motion.h2>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <div className="text-3xl mb-2">
            {result.primary.confidence.toFixed(1)}%
          </div>
          <p className="opacity-70">Confidence Score</p>
        </motion.div>

        {/* Confidence Bar */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className={`h-4 rounded-full overflow-hidden ${
            darkMode ? 'bg-gray-700' : 'bg-gray-200'
          }`}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${result.primary.confidence}%` }}
            transition={{ delay: 0.6, duration: 1, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(to right, ${primaryColor}, ${primaryColor}dd)`,
            }}
          />
        </motion.div>
      </motion.div>

      {/* Top 3 Emotions */}
      <div className={`rounded-2xl p-6 ${
        darkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'
      }`}>
        <h3 className="text-xl mb-6">Detailed Emotion Analysis</h3>
        <div className="space-y-4">
          {topThree.map((emotion, index) => (
            <motion.div
              key={emotion.emotion}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className={`p-4 rounded-xl ${
                darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: `${emotionColors[emotion.emotion]}20`,
                      color: emotionColors[emotion.emotion],
                    }}
                  >
                    {emotionIcons[emotion.emotion]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      {emotionLabels[emotion.emotion]}
                    </div>
                    <div className="text-sm opacity-70">
                      {emotion.confidence.toFixed(1)}%
                    </div>
                  </div>
                </div>
                {index === 0 && (
                  <div
                    className="px-3 py-1 rounded-full text-sm"
                    style={{
                      backgroundColor: `${emotionColors[emotion.emotion]}20`,
                      color: emotionColors[emotion.emotion],
                    }}
                  >
                    Primary
                  </div>
                )}
              </div>

              <div className={`h-2 rounded-full overflow-hidden ${
                darkMode ? 'bg-gray-600' : 'bg-gray-200'
              }`}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${emotion.confidence}%` }}
                  transition={{ delay: 0.8 + index * 0.1, duration: 0.8 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: emotionColors[emotion.emotion] }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* All Emotions Grid */}
      <div className={`rounded-2xl p-6 mt-8 ${
        darkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'
      }`}>
        <h3 className="text-xl mb-6">Complete Analysis</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {result.all.map((emotion, index) => (
            <motion.div
              key={emotion.emotion}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1 + index * 0.05 }}
              className={`p-4 rounded-xl text-center ${
                darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
              }`}
            >
              <div className="mb-2" style={{ color: emotionColors[emotion.emotion] }}>
                {emotionIcons[emotion.emotion]}
              </div>
              <div className="text-sm mb-1">{emotionLabels[emotion.emotion]}</div>
              <div
                className="text-sm"
                style={{ color: emotionColors[emotion.emotion] }}
              >
                {emotion.confidence.toFixed(1)}%
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}