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

    // Sample lessons for ASL Alphabet module
    const alphabetLessons: Lesson[] = Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').map((letter, index) => ({
      id: index + 1,
      moduleId: 2, // ASL Alphabet module
      title: `Letter ${letter}`,
      description: `Learn how to sign the letter ${letter} in ASL`,
      videoUrl: `https://www.signasl.org/videos/alphabet/${letter.toLowerCase()}.mp4`,
      order: index + 1,
      duration: 60, // 1 minute per letter
    }));

    // Sample lessons for Numbers module
    const numberLessons: Lesson[] = Array.from({ length: 20 }, (_, i) => ({
      id: 27 + i, // continue after alphabet
      moduleId: 1, // ASL Numbers module
      title: `Number ${i + 1}`,
      description: `Learn how to sign the number ${i + 1} in ASL`,
      videoUrl: `https://www.signasl.org/videos/numbers/${i + 1}.mp4`,
      order: i + 1,
      duration: 45, // 45 seconds per number
    }));

    // Sample lessons for Basic Greetings
    const greetingLessons: Lesson[] = [
      {
        id: 47,
        moduleId: 3,
        title: "Hello",
        description: "Learn to say 'Hello' in ASL",
        videoUrl: "https://www.signasl.org/videos/greetings/hello.mp4",
        order: 1,
        duration: 90,
      },
      {
        id: 48,
        moduleId: 3,
        title: "How are you?",
        description: "Learn to ask 'How are you?' in ASL",
        videoUrl: "https://www.signasl.org/videos/greetings/how_are_you.mp4",
        order: 2,
        duration: 120,
      },
      {
        id: 49,
        moduleId: 3,
        title: "Good morning",
        description: "Learn to say 'Good morning' in ASL",
        videoUrl: "https://www.signasl.org/videos/greetings/good_morning.mp4",
        order: 3,
        duration: 90,
      },
    ];

    sampleCourses.forEach(course => this.courses.set(course.id, course));
    sampleModules.forEach(module => this.modules.set(module.id, module));

    // Add all lessons
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