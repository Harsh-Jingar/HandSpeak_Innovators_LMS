import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Course } from "@shared/schema";
import { Clock, BookOpen } from "lucide-react";
import { Link } from "wouter";

export default function CourseCard({ course }: { course: Course }) {
  return (
    <Card className="overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <img
          src={course.imageUrl}
          alt={course.title}
          className="h-48 w-full object-cover hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-4 right-4">
          <span className="px-3 py-1 bg-primary text-white text-sm rounded-full font-medium">
            {course.language}
          </span>
        </div>
      </div>
      <CardHeader>
        <CardTitle className="text-xl">{course.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground">{course.description}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center border-t pt-4">
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {course.durationHours}h
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            {course.lessons} lessons
          </span>
        </div>
        <Link href={`/course/${course.id}`}>
          <Button>Start Learning</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}