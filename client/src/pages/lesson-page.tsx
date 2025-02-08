import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link, useLocation } from "wouter";
import { Lesson, Module, UserProgress } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useRef, useEffect } from "react";

export default function LessonPage() {
  const [, params] = useRoute("/lesson/:id");
  const [, setLocation] = useLocation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressInterval = useRef<NodeJS.Timeout>();
  const lessonId = parseInt(params?.id || "0");

  const { data: lesson, isLoading: isLoadingLesson } = useQuery<Lesson>({
    queryKey: [`/api/lessons/${lessonId}`],
  });

  const { data: module, isLoading: isLoadingModule } = useQuery<Module>({
    queryKey: [`/api/modules/${lesson?.moduleId}`],
    enabled: !!lesson,
  });

  const { data: lessons, isLoading: isLoadingLessons } = useQuery<Lesson[]>({
    queryKey: [`/api/modules/${lesson?.moduleId}/lessons`],
    enabled: !!lesson,
  });

  const { data: progress } = useQuery<UserProgress[]>({
    queryKey: ["/api/progress"],
  });

  const lessonProgress = progress?.find(p => p.lessonId === lessonId)?.progress || 0;

  const progressMutation = useMutation({
    mutationFn: async (progress: number) => {
      await apiRequest("POST", `/api/progress/${lessonId}`, { progress });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
    },
  });

  useEffect(() => {
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, []);

  const handleVideoProgress = () => {
    const video = videoRef.current;
    if (!video) return;

    const progress = Math.round((video.currentTime / video.duration) * 100);
    progressMutation.mutate(progress);

    if (progress === 100) {
      const currentIndex = lessons?.findIndex(l => l.id === lessonId) ?? -1;
      const nextLesson = lessons?.[currentIndex + 1];

      if (nextLesson) {
        setTimeout(() => {
          setLocation(`/lesson/${nextLesson.id}`);
        }, 2000);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    progressInterval.current = setInterval(handleVideoProgress, 5000);
  };

  const isLoading = isLoadingLesson || isLoadingModule || isLoadingLessons;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!lesson || !module || !lessons) {
    return <div>Lesson not found</div>;
  }

  const currentIndex = lessons.findIndex(l => l.id === lessonId);
  const previousLesson = lessons[currentIndex - 1];
  const nextLesson = lessons[currentIndex + 1];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href={`/module/${module.id}`}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Module
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">{lesson.title}</h1>
            <p className="text-muted-foreground">{lesson.description}</p>
          </div>

          <Card className="mb-8 overflow-hidden">
            <CardContent className="p-0">
              <div className="aspect-video relative">
                <video
                  ref={videoRef}
                  className="w-full h-full"
                  controls
                  autoPlay
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={handleVideoProgress}
                >
                  <source src={lesson.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-background/80">
                  <Progress value={lessonProgress} className="rounded-none" />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between items-center">
            {previousLesson ? (
              <Link href={`/lesson/${previousLesson.id}`}>
                <Button variant="outline" className="flex items-center gap-2">
                  <ChevronLeft className="h-4 w-4" />
                  Previous: {previousLesson.title}
                </Button>
              </Link>
            ) : (
              <span />
            )}

            {nextLesson && (
              <Link href={`/lesson/${nextLesson.id}`}>
                <Button className="flex items-center gap-2">
                  Next: {nextLesson.title}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}