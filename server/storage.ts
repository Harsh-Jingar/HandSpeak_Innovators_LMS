import { users, courses, modules, lessons, userProgress } from "@shared/schema";
import type { User, InsertUser, Course, Module, Lesson, UserProgress } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getCourses(): Promise<Course[]>;
  getCourse(id: number): Promise<Course | undefined>;
  getModules(courseId: number): Promise<Module[]>;
  getModule(id: number): Promise<Module | undefined>;
  getLessons(moduleId: number): Promise<Lesson[]>;
  getLesson(id: number): Promise<Lesson | undefined>;
  getUserProgress(userId: number): Promise<UserProgress[]>;
  updateProgress(userId: number, lessonId: number, progress: number): Promise<void>;
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private courses: Map<number, Course>;
  private modules: Map<number, Module>;
  private lessons: Map<number, Lesson>;
  private progress: Map<string, UserProgress>;
  currentId: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.courses = new Map();
    this.modules = new Map();
    this.lessons = new Map();
    this.progress = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });

    // Seed courses, modules and lessons
    this.seedCoursesAndModules();
  }

  private seedCoursesAndModules() {
    const sampleCourses: Course[] = [
      {
        id: 1,
        title: "ASL Basics",
        description: "Learn the fundamentals of American Sign Language",
        language: "ASL",
        imageUrl: "https://images.unsplash.com/photo-1499244571948-7ccddb3583f1",
        lessons: 12,
        durationHours: 24,
      },
      {
        id: 2,
        title: "BSL for Beginners",
        description: "Start your journey with British Sign Language",
        language: "BSL",
        imageUrl: "https://images.unsplash.com/photo-1518893494013-481c1d8ed3fd",
        lessons: 10,
        durationHours: 20,
      },
      {
        id: 3,
        title: "ISL Fundamentals",
        description: "Master Indian Sign Language basics",
        language: "ISL",
        imageUrl: "https://images.unsplash.com/photo-1494178270175-e96de2971df9",
        lessons: 15,
        durationHours: 30,
      },
    ];

    const sampleModules: Module[] = [
      // ASL Modules
      {
        id: 1,
        courseId: 1,
        title: "ASL Numbers (1-20)",
        description: "Learn to count and express numbers in ASL",
        type: "numbers",
        order: 1,
      },
      {
        id: 2,
        courseId: 1,
        title: "ASL Alphabet",
        description: "Master the ASL alphabet and fingerspelling",
        type: "alphabets",
        order: 2,
      },
      {
        id: 3,
        courseId: 1,
        title: "Basic Greetings",
        description: "Learn common greetings and introductions",
        type: "words",
        order: 3,
      },
    ];

    // Sample lessons for ASL Alphabet module with actual ASL video URLs
    const alphabetLessons: Lesson[] = [
      {
        id: 1,
        moduleId: 2,
        title: "Letter A",
        description: "Learn how to sign the letter A in ASL",
        videoUrl: "https://www.signingsavvy.com/media/mp4-ld/22/22671.mp4",
        order: 1,
        duration: 60,
      },
      {
        id: 2,
        moduleId: 2,
        title: "Letter B",
        description: "Learn how to sign the letter B in ASL",
        videoUrl: "https://www.signingsavvy.com/media/mp4-ld/22/22672.mp4",
        order: 2,
        duration: 60,
      },
      {
        id: 3,
        moduleId: 2,
        title: "Letter C",
        description: "Learn how to sign the letter C in ASL",
        videoUrl: "https://www.signingsavvy.com/media/mp4-ld/22/22673.mp4",
        order: 3,
        duration: 60,
      },
    ];

    // Sample lessons for Numbers module with actual ASL video URLs
    const numberLessons: Lesson[] = [
      {
        id: 27,
        moduleId: 1,
        title: "Number 1",
        description: "Learn how to sign the number 1 in ASL",
        videoUrl: "https://www.signingsavvy.com/media/mp4-ld/22/22799.mp4",
        order: 1,
        duration: 45,
      },
      {
        id: 28,
        moduleId: 1,
        title: "Number 2",
        description: "Learn how to sign the number 2 in ASL",
        videoUrl: "https://www.signingsavvy.com/media/mp4-ld/22/22800.mp4",
        order: 2,
        duration: 45,
      },
      {
        id: 29,
        moduleId: 1,
        title: "Number 3",
        description: "Learn how to sign the number 3 in ASL",
        videoUrl: "https://www.signingsavvy.com/media/mp4-ld/22/22801.mp4",
        order: 3,
        duration: 45,
      },
    ];

    // Sample lessons for Basic Greetings with actual ASL video URLs
    const greetingLessons: Lesson[] = [
      {
        id: 47,
        moduleId: 3,
        title: "Hello",
        description: "Learn to say 'Hello' in ASL",
        videoUrl: "https://www.signingsavvy.com/media/mp4-ld/22/22914.mp4",
        order: 1,
        duration: 90,
      },
      {
        id: 48,
        moduleId: 3,
        title: "How are you?",
        description: "Learn to ask 'How are you?' in ASL",
        videoUrl: "https://www.signingsavvy.com/media/mp4-ld/22/22915.mp4",
        order: 2,
        duration: 120,
      },
      {
        id: 49,
        moduleId: 3,
        title: "Good morning",
        description: "Learn to say 'Good morning' in ASL",
        videoUrl: "https://www.signingsavvy.com/media/mp4-ld/22/22916.mp4",
        order: 3,
        duration: 90,
      },
    ];

    // Add all data to storage
    sampleCourses.forEach(course => this.courses.set(course.id, course));
    sampleModules.forEach(module => this.modules.set(module.id, module));
    [...alphabetLessons, ...numberLessons, ...greetingLessons].forEach(lesson => 
      this.lessons.set(lesson.id, lesson)
    );
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getCourses(): Promise<Course[]> {
    return Array.from(this.courses.values());
  }

  async getCourse(id: number): Promise<Course | undefined> {
    return this.courses.get(id);
  }

  async getModules(courseId: number): Promise<Module[]> {
    return Array.from(this.modules.values())
      .filter(m => m.courseId === courseId)
      .sort((a, b) => a.order - b.order);
  }

  async getModule(id: number): Promise<Module | undefined> {
    return this.modules.get(id);
  }

  async getLessons(moduleId: number): Promise<Lesson[]> {
    return Array.from(this.lessons.values())
      .filter(l => l.moduleId === moduleId)
      .sort((a, b) => a.order - b.order);
  }

  async getLesson(id: number): Promise<Lesson | undefined> {
    return this.lessons.get(id);
  }

  async getUserProgress(userId: number): Promise<UserProgress[]> {
    return Array.from(this.progress.values()).filter(p => p.userId === userId);
  }

  async updateProgress(userId: number, lessonId: number, progress: number): Promise<void> {
    const key = `${userId}-${lessonId}`;
    const existing = this.progress.get(key);

    if (existing) {
      this.progress.set(key, {
        ...existing,
        progress,
        completed: progress === 100
      });
    } else {
      this.progress.set(key, {
        id: this.currentId++,
        userId,
        lessonId,
        progress,
        completed: progress === 100
      });
    }
  }
}

export const storage = new MemStorage();