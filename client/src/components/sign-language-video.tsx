import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface SignLanguageVideoProps {
  src: string;
  title: string;
  onProgress?: (progress: number) => void;
}

export default function SignLanguageVideo({ src, title, onProgress }: SignLanguageVideoProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <Card className="overflow-hidden">
      <div className="aspect-video relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}
        <iframe
          className="w-full h-full"
          src={src}
          title={title}
          onLoad={() => {
            setIsLoading(false);
            // Simulate progress for embedded content
            if (onProgress) {
              setTimeout(() => onProgress(100), 5000); // Mark as complete after 5 seconds of viewing
            }
          }}
        />
      </div>
    </Card>
  );
}
