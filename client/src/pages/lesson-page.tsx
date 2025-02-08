import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Lesson, Module, UserProgress } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ArrowLeft, PlayCircle, CheckCircle2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function LessonPage() {
  const [, params] = useRoute("/lesson/:id");
  const lessonId = parseInt(params?.id || "0");

  const { data: lesson, isLoading: isLoadingLesson } = useQuery<Lesson>({
    queryKey: [`/api/lessons/${lessonId}`],
  });

  const { data: module, isLoading: isLoadingModule } = useQuery<Module>({
    queryKey: [`/api/modules/${lesson?.moduleId}`],
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

  const isLoading = isLoadingLesson || isLoadingModule;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!lesson || !module) {
    return <div>Lesson not found</div>;
  }

  const handleProgress = () => {
    progressMutation.mutate(Math.min(lessonProgress + 25, 100));
  };

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
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">{lesson.title}</h1>
            <p className="text-muted-foreground">{lesson.description}</p>
          </div>

          <Card className="mb-8">
            <CardContent className="p-0 aspect-video relative">
              <video
                key={lesson.videoUrl}
                className="w-full h-full"
                controls
                poster="/video-thumbnail.jpg"
                onEnded={handleProgress}
              >
                <source src={lesson.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Your Progress</h2>
                <span className="text-sm text-muted-foreground">
                  {lessonProgress}% Complete
                </span>
              </div>
              <Progress value={lessonProgress} className="mb-6" />
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <PlayCircle className="h-4 w-4" />
                  {lessonProgress === 100 ? 'Lesson Completed' : 'Watch the video to progress'}
                </div>
                {lessonProgress === 100 ? (
                  <div className="flex items-center gap-2 text-primary">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">Completed</span>
                  </div>
                ) : (
                  <Button onClick={handleProgress} disabled={progressMutation.isPending}>
                    {progressMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Mark as Complete
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
