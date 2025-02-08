import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Course, Module, UserProgress } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ArrowLeft, Play, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function CoursePage() {
  const [, params] = useRoute("/course/:id");
  const courseId = parseInt(params?.id || "0");

  const { data: course, isLoading: isLoadingCourse } = useQuery<Course>({
    queryKey: [`/api/courses/${courseId}`],
  });

  const { data: modules, isLoading: isLoadingModules } = useQuery<Module[]>({
    queryKey: [`/api/courses/${courseId}/modules`],
  });

  const { data: progress } = useQuery<UserProgress[]>({
    queryKey: ["/api/progress"],
  });

  const isLoading = isLoadingCourse || isLoadingModules;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!course || !modules) {
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

          <div className="grid gap-4">
            {modules.map((module) => {
              const moduleProgress = progress?.find(p => p.moduleId === module.id)?.progress || 0;

              return (
                <Card key={module.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-grow">
                        <h3 className="text-xl font-semibold mb-2">{module.title}</h3>
                        <p className="text-muted-foreground mb-4">{module.description}</p>
                        <div className="flex items-center gap-4">
                          <Progress value={moduleProgress} className="w-48" />
                          <span className="text-sm text-muted-foreground">
                            {moduleProgress}% Complete
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <Link href={`/module/${module.id}`}>
                          <Button className="flex items-center gap-2">
                            {moduleProgress === 100 ? (
                              <>
                                <CheckCircle2 className="h-4 w-4" />
                                Review
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4" />
                                {moduleProgress > 0 ? 'Continue' : 'Start'}
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