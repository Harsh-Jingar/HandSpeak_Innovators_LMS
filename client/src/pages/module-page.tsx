import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Module, Lesson, UserProgress } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ArrowLeft, Play, CheckCircle2 } from "lucide-react";

export default function ModulePage() {
  const [, params] = useRoute("/module/:id");
  const moduleId = parseInt(params?.id || "0");

  const { data: module, isLoading: isLoadingModule } = useQuery<Module>({
    queryKey: [`/api/modules/${moduleId}`],
  });

  const { data: lessons, isLoading: isLoadingLessons } = useQuery<Lesson[]>({
    queryKey: [`/api/modules/${moduleId}/lessons`],
  });

  const { data: progress } = useQuery<UserProgress[]>({
    queryKey: ["/api/progress"],
  });

  const isLoading = isLoadingModule || isLoadingLessons;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!module || !lessons) {
    return <div>Module not found</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href={`/course/${module.courseId}`}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Course
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">{module.title}</h1>
            <p className="text-muted-foreground">{module.description}</p>
          </div>

          <div className="grid gap-4">
            {lessons.map((lesson) => {
              const lessonProgress = progress?.find(p => p.lessonId === lesson.id)?.progress || 0;

              return (
                <Card key={lesson.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-grow">
                        <h3 className="text-xl font-semibold mb-2">{lesson.title}</h3>
                        <p className="text-muted-foreground mb-4">{lesson.description}</p>
                        <div className="flex items-center gap-4">
                          <Progress value={lessonProgress} className="w-48" />
                          <span className="text-sm text-muted-foreground">
                            {lessonProgress}% Complete
                          </span>
                          <span className="text-sm text-muted-foreground">
                            Duration: {Math.floor(lesson.duration / 60)}min {lesson.duration % 60}s
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <Link href={`/lesson/${lesson.id}`}>
                          <Button className="flex items-center gap-2">
                            {lessonProgress === 100 ? (
                              <>
                                <CheckCircle2 className="h-4 w-4" />
                                Review
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4" />
                                {lessonProgress > 0 ? 'Continue' : 'Start'}
                              </>
                            )}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}