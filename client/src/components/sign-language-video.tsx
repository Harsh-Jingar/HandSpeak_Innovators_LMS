import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SignLanguageVideoProps {
  src: string;
  title: string;
  onProgress?: (progress: number) => void;
  thumbnailUrl?: string;
}

export default function SignLanguageVideo({ src, title, onProgress, thumbnailUrl }: SignLanguageVideoProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [showVideo, setShowVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlay = () => {
    setShowVideo(true);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && onProgress) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      onProgress(Math.round(progress));
    }
  };

  const handleEnded = () => {
    if (onProgress) {
      onProgress(100);
    }
  };

  return (
    <Card className="overflow-hidden">
      {!showVideo ? (
        <div className="aspect-video bg-muted relative group cursor-pointer" onClick={handlePlay}>
          {thumbnailUrl ? (
            <img 
              src={thumbnailUrl} 
              alt={title} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
              <div className="text-4xl font-bold text-primary/20">
                {title.split(' ').pop()}
              </div>
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative z-10">
              <Button size="lg" variant="ghost" className="rounded-full">
                <Play className="h-8 w-8" />
              </Button>
            </div>
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
          </div>
          <div className="absolute bottom-6 left-6 text-white text-lg font-medium">
            {title}
          </div>
        </div>
      ) : (
        <div className="aspect-video bg-muted relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}
          <video
            ref={videoRef}
            src={src}
            controls
            autoPlay
            className="w-full h-full"
            onLoadedData={() => setIsLoading(false)}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
          />
        </div>
      )}
    </Card>
  );
}
