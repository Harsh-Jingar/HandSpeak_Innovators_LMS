import { users, courses, userProgress } from "@shared/schema";
import type { User, InsertUser, Course, UserProgress } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getCourses(): Promise<Course[]>;
  getCourse(id: number): Promise<Course | undefined>;
  getUserProgress(userId: number): Promise<UserProgress[]>;
  updateProgress(userId: number, courseId: number, progress: number): Promise<void>;
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private courses: Map<number, Course>;
  private progress: Map<string, UserProgress>;
  currentId: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.courses = new Map();
    this.progress = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });

    // Seed courses
    this.seedCourses();
  }

  private seedCourses() {
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

    sampleCourses.forEach(course => this.courses.set(course.id, course));
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

  async getUserProgress(userId: number): Promise<UserProgress[]> {
    return Array.from(this.progress.values()).filter(p => p.userId === userId);
  }

  async updateProgress(userId: number, courseId: number, progress: number): Promise<void> {
    const key = `${userId}-${courseId}`;
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
        courseId,
        progress,
        completed: progress === 100
      });
    }
  }
}

export const storage = new MemStorage();
