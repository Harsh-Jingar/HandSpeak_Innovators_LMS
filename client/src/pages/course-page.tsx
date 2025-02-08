import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Course, UserProgress } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function CoursePage() {
  const [, params] = useRoute("/course/:id");
  const courseId = parseInt(params?.id || "0");

  const { data: course, isLoading: isLoadingCourse } = useQuery<Course>({
    queryKey: [`/api/courses/${courseId}`],
  });

  const { data: progress } = useQuery<UserProgress[]>({
    queryKey: ["/api/progress"],
  });

  const currentProgress = progress?.find(p => p.courseId === courseId)?.progress || 0;

  const progressMutation = useMutation({
    mutationFn: async (progress: number) => {
      await apiRequest("POST", `/api/progress/${courseId}`, { progress });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
    },
  });

  if (isLoadingCourse) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!course) {
    return <div>Course not found</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Courses
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <img
            src={course.imageUrl}
            alt={course.title}
            className="w-full h-64 object-cover rounded-lg mb-8"
          />
          
          <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
          <p className="text-muted-foreground mb-8">{course.description}</p>

          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Your Progress</h2>
              <Progress value={currentProgress} className="mb-4" />
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  {currentProgress}% Complete
                </span>
                <Button
                  onClick={() => progressMutation.mutate(Math.min(currentProgress + 10, 100))}
                  disabled={progressMutation.isPending}
                >
                  {progressMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Continue Learning
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {Array.from({ length: course.lessons }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Lesson {i + 1}</h3>
                    <p className="text-sm text-muted-foreground">
                      Duration: {Math.round(course.durationHours / course.lessons)}h
                    </p>
                  </div>
                  <Progress
                    value={currentProgress >= ((i + 1) / course.lessons) * 100 ? 100 : 0}
                    className="w-24"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
