import { motion } from 'motion/react';
import { Clock, Smile, Frown, Angry, Meh, Zap, ThumbsDown, AlertCircle } from 'lucide-react';
import { EmotionPrediction } from '../App';

interface HistoryPanelProps {
  history: EmotionPrediction[];
  darkMode: boolean;
}

const emotionIcons: Record<string, React.ReactNode> = {
  happy: <Smile className="w-5 h-5" />,
  sad: <Frown className="w-5 h-5" />,
  angry: <Angry className="w-5 h-5" />,
  fearful: <AlertCircle className="w-5 h-5" />,
  neutral: <Meh className="w-5 h-5" />,
  surprised: <Zap className="w-5 h-5" />,
  disgusted: <ThumbsDown className="w-5 h-5" />,
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

export function HistoryPanel({ history, darkMode }: HistoryPanelProps) {
  if (history.length === 0) return null;

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className={`rounded-2xl p-6 ${
        darkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'
      }`}
    >
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5" />
        <h3 className="text-xl">Recent Analysis</h3>
      </div>

      <div className="space-y-2">
        {history.slice(0, 5).map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + index * 0.1 }}
            className={`p-3 rounded-lg flex items-center justify-between ${
              darkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
            } transition-colors`}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-600/20">
                {emotionIcons[item.emotion]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="truncate">{emotionLabels[item.emotion]}</div>
                <div className="text-sm opacity-60 truncate">
                  {item.audioName || 'Recording'}
                </div>
              </div>
            </div>
            <div className="text-sm opacity-60 whitespace-nowrap ml-2">
              {formatTimeAgo(item.timestamp)}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}