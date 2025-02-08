import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Module, UserProgress } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ArrowLeft, PlayCircle, CheckCircle2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function ModulePage() {
  const [, params] = useRoute("/module/:id");
  const moduleId = parseInt(params?.id || "0");

  const { data: module, isLoading: isLoadingModule } = useQuery<Module>({
    queryKey: [`/api/modules/${moduleId}`],
  });

  const { data: progress } = useQuery<UserProgress[]>({
    queryKey: ["/api/progress"],
  });

  const moduleProgress = progress?.find(p => p.moduleId === moduleId)?.progress || 0;

  const progressMutation = useMutation({
    mutationFn: async (progress: number) => {
      await apiRequest("POST", `/api/progress/${moduleId}`, { progress });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
    },
  });

  if (isLoadingModule) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!module) {
    return <div>Module not found</div>;
  }

  const handleProgress = () => {
    // Simulate progress increment (in real app, this would be based on video progress)
    progressMutation.mutate(Math.min(moduleProgress + 25, 100));
  };

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

          <Card className="mb-8">
            <CardContent className="p-0 aspect-video relative">
              <video
                key={module.videoUrl}
                className="w-full h-full"
                controls
                poster="/video-thumbnail.jpg"
                onEnded={handleProgress}
              >
                <source src={module.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Your Progress</h2>
                <span className="text-sm text-muted-foreground">
                  {moduleProgress}% Complete
                </span>
              </div>
              <Progress value={moduleProgress} className="mb-6" />
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <PlayCircle className="h-4 w-4" />
                  {moduleProgress === 100 ? 'Module Completed' : 'Watch the video to progress'}
                </div>
                {moduleProgress === 100 ? (
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
