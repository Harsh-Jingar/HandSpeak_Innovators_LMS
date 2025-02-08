import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SignLanguageVideoProps {
  src: string;
  title: string;
  onProgress?: (progress: number) => void;
}

export default function SignLanguageVideo({ src, title, onProgress }: SignLanguageVideoProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [showVideo, setShowVideo] = useState(false);

  // When user clicks play, show the iframe and start tracking progress
  const handlePlay = () => {
    setShowVideo(true);
    // Start progress tracking
    if (onProgress) {
      setTimeout(() => onProgress(100), 5000); // Mark as complete after 5 seconds of viewing
    }
  };

  return (
    <Card className="overflow-hidden">
      {!showVideo ? (
        <div className="aspect-video bg-muted relative group cursor-pointer" onClick={handlePlay}>
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
        <div className="aspect-video relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}
          <iframe
            className="w-full h-full"
            src={`${src}#video`}
            title={title}
            onLoad={() => setIsLoading(false)}
            style={{
              border: "none",
              overflow: "hidden",
              marginTop: "-100px", // Adjust to focus on video content
              height: "calc(100% + 200px)" // Compensate for margin
            }}
          />
        </div>
      )}
    </Card>
  );
}