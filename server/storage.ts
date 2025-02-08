import { users, courses, modules, userProgress } from "@shared/schema";
import type { User, InsertUser, Course, Module, UserProgress } from "@shared/schema";
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
  getUserProgress(userId: number): Promise<UserProgress[]>;
  updateProgress(userId: number, moduleId: number, progress: number): Promise<void>;
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private courses: Map<number, Course>;
  private modules: Map<number, Module>;
  private progress: Map<string, UserProgress>;
  currentId: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.courses = new Map();
    this.modules = new Map();
    this.progress = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });

    // Seed courses and modules
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
        videoUrl: "https://www.signasl.org/videos/numbers_1-20.mp4",
        order: 1,
      },
      {
        id: 2,
        courseId: 1,
        title: "ASL Alphabet",
        description: "Master the ASL alphabet and fingerspelling",
        type: "alphabets",
        videoUrl: "https://www.signasl.org/videos/alphabet.mp4",
        order: 2,
      },
      {
        id: 3,
        courseId: 1,
        title: "Basic Greetings",
        description: "Learn common greetings and introductions",
        type: "words",
        videoUrl: "https://www.signasl.org/videos/greetings.mp4",
        order: 3,
      },
      // BSL Modules
      {
        id: 4,
        courseId: 2,
        title: "BSL Numbers (1-20)",
        description: "Learn to count in British Sign Language",
        type: "numbers",
        videoUrl: "https://www.british-sign.co.uk/videos/numbers_1-20.mp4",
        order: 1,
      },
      {
        id: 5,
        courseId: 2,
        title: "BSL Alphabet",
        description: "Learn the BSL alphabet",
        type: "alphabets",
        videoUrl: "https://www.british-sign.co.uk/videos/alphabet.mp4",
        order: 2,
      },
      // ISL Modules
      {
        id: 6,
        courseId: 3,
        title: "ISL Numbers (1-20)",
        description: "Learn to count in Indian Sign Language",
        type: "numbers",
        videoUrl: "https://www.indiansignlanguage.org/videos/numbers_1-20.mp4",
        order: 1,
      },
      {
        id: 7,
        courseId: 3,
        title: "ISL Alphabet",
        description: "Master the ISL alphabet",
        type: "alphabets",
        videoUrl: "https://www.indiansignlanguage.org/videos/alphabet.mp4",
        order: 2,
      },
    ];

    sampleCourses.forEach(course => this.courses.set(course.id, course));
    sampleModules.forEach(module => this.modules.set(module.id, module));
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

  async getUserProgress(userId: number): Promise<UserProgress[]> {
    return Array.from(this.progress.values()).filter(p => p.userId === userId);
  }

  async updateProgress(userId: number, moduleId: number, progress: number): Promise<void> {
    const key = `${userId}-${moduleId}`;
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
        moduleId,
        progress,
        completed: progress === 100
      });
    }
  }
}

export const storage = new MemStorage();