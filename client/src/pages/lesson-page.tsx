import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link, useLocation } from "wouter";
import { Lesson, Module, UserProgress } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import SignLanguageVideo from "@/components/sign-language-video";

export default function LessonPage() {
  const [, params] = useRoute("/lesson/:id");
  const [, setLocation] = useLocation();
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

      // If progress is 100%, wait 2 seconds and go to next lesson
      //This section is already in edited code.
    },
  });

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

          <div className="mb-8">
            <SignLanguageVideo
              src={lesson.videoUrl}
              title={lesson.title}
              onProgress={(progress) => progressMutation.mutate(progress)}
            />
            <div className="mt-4 bg-background">
              <Progress value={lessonProgress} className="h-2" />
            </div>
          </div>

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