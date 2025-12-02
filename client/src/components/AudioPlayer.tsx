import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Volume2, VolumeX, Download, RotateCcw } from "lucide-react";

interface AudioPlayerProps {
  audioUrl: string;
  title?: string;
  duration?: number;
  audioType?: string;
  showTranscript?: boolean;
  transcript?: string;
}

export default function AudioPlayer({ 
  audioUrl, 
  title, 
  duration, 
  audioType = "audio",
  showTranscript = false,
  transcript 
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration || 0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showTranscriptPanel, setShowTranscriptPanel] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedData = () => {
      setTotalDuration(audio.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (newTime: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const time = newTime[0];
    audio.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (newVolume: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const vol = newVolume[0];
    audio.volume = vol;
    setVolume(vol);
    setIsMuted(vol === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const resetAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = 0;
    setCurrentTime(0);
    setIsPlaying(false);
    audio.pause();
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getAudioTypeLabel = (type: string): string => {
    switch (type) {
      case 'podcast': return 'Podcast Episode';
      case 'narration': return 'Audio Narration';
      case 'interview': return 'Interview';
      case 'tutorial': return 'Audio Tutorial';
      default: return 'Audio Content';
    }
  };

  return (
    <Card className="p-4 mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      {/* Audio Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          {title && <h3 className="font-semibold text-lg">{title}</h3>}
          <p className="text-sm text-gray-600">{getAudioTypeLabel(audioType)}</p>
        </div>
        <div className="flex items-center space-x-2">
          {transcript && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTranscriptPanel(!showTranscriptPanel)}
            >
              Transcript
            </Button>
          )}
          <Button variant="outline" size="sm" asChild>
            <a href={audioUrl} download>
              <Download className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>

      {/* Main Controls */}
      <div className="flex items-center space-x-4 mb-4">
        <Button
          onClick={togglePlayPause}
          disabled={isLoading}
          size="lg"
          className="rounded-full w-12 h-12"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5 ml-0.5" />
          )}
        </Button>

        <Button
          onClick={resetAudio}
          variant="outline"
          size="sm"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>

        <div className="flex-1">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(totalDuration)}</span>
          </div>
          <Slider
            value={[currentTime]}
            max={totalDuration}
            step={1}
            onValueChange={handleSeek}
            className="w-full"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Volume Controls */}
      <div className="flex items-center space-x-3">
        <Button
          onClick={toggleMute}
          variant="ghost"
          size="sm"
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
        <div className="w-24">
          <Slider
            value={[isMuted ? 0 : volume]}
            max={1}
            step={0.1}
            onValueChange={handleVolumeChange}
          />
        </div>
        <span className="text-xs text-gray-600 w-8">
          {Math.round((isMuted ? 0 : volume) * 100)}%
        </span>
      </div>

      {/* Transcript Panel */}
      {showTranscriptPanel && transcript && (
        <div className="mt-4 p-4 bg-white rounded-lg border">
          <h4 className="font-medium mb-2">Transcript</h4>
          <div className="text-sm text-gray-700 max-h-40 overflow-y-auto whitespace-pre-wrap">
            {transcript}
          </div>
        </div>
      )}
    </Card>
  );
}