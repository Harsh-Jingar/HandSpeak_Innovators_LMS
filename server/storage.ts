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
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private courses: Map<number, Course>;
  private modules: Map<number, Module>;
  private lessons: Map<number, Lesson>;
  private progress: Map<string, UserProgress>;
  currentId: number;
  sessionStore: session.Store;

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

  private generateNumberLessons(startId: number, moduleId: number, language: string): Lesson[] {
    const lessons: Lesson[] = [];
    for (let i = 1; i <= 10; i++) {
      lessons.push({
        id: startId + i - 1,
        moduleId,
        title: `Number ${i}`,
        description: `Learn to sign number ${i} in ${language}`,
        content: `Learn how to sign the number ${i} in ${language}`,
        videoUrl: `https://example.com/videos/${language.toLowerCase()}/numbers/${i}.mp4`,
        thumbnailUrl: `https://example.com/thumbnails/${language.toLowerCase()}/numbers/${i}.jpg`,
        order: i,
        duration: 180,
        keyPoints: [
          `Hand position for number ${i}`,
          "Common mistakes to avoid",
          "Practice exercises"
        ],
        practiceExercises: [
          {
            type: "record",
            title: `Practice Number ${i}`,
            description: `Record yourself signing number ${i}`,
            content: {
              prompt: `Sign number ${i}`
            }
          }
        ],
        resources: [
          {
            type: "pdf",
            title: `${language} Number ${i} Guide`,
            description: `Guide for signing number ${i}`,
            url: `/resources/${language.toLowerCase()}/numbers/number-${i}.pdf`
          }
        ]
      });
    }
    return lessons;
  }

  private generateAlphabetLessons(startId: number, moduleId: number, language: string): Lesson[] {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    return letters.map((letter, index) => ({
      id: startId + index,
      moduleId,
      title: `Letter ${letter}`,
      description: `Learn to sign letter ${letter} in ${language}`,
      content: `Learn how to sign the letter ${letter} in ${language}`,
      videoUrl: `https://example.com/videos/${language.toLowerCase()}/alphabet/${letter.toLowerCase()}.mp4`,
      thumbnailUrl: `https://example.com/thumbnails/${language.toLowerCase()}/alphabet/${letter.toLowerCase()}.jpg`,
      order: index + 1,
      duration: 180,
      keyPoints: [
        `Hand position for letter ${letter}`,
        "Common mistakes to avoid",
        "Practice exercises"
      ],
      practiceExercises: [
        {
          type: "record",
          title: `Practice Letter ${letter}`,
          description: `Record yourself signing letter ${letter}`,
          content: {
            prompt: `Sign letter ${letter}`
          }
        }
      ],
      resources: [
        {
          type: "pdf",
          title: `${language} Letter ${letter} Guide`,
          description: `Guide for signing letter ${letter}`,
          url: `/resources/${language.toLowerCase()}/alphabet/letter-${letter.toLowerCase()}.pdf`
        }
      ]
    }));
  }

  private seedCoursesAndModules() {
    // Create the three main courses
    const sampleCourses: Course[] = [
      {
        id: 1,
        title: "American Sign Language (ASL)",
        description: "Learn American Sign Language (ASL) - Alphabet, Numbers, and Basic Greetings",
        language: "ASL",
        imageUrl: "/courses/asl-course.jpg",
        lessons: 39, // 26 alphabet + 10 numbers + 3 greetings
        durationHours: 10,
        level: "beginner",
        category: "comprehensive"
      },
      {
        id: 2,
        title: "British Sign Language (BSL)",
        description: "Learn British Sign Language (BSL) - Alphabet, Numbers, and Basic Greetings",
        language: "BSL",
        imageUrl: "/courses/bsl-course.jpg",
        lessons: 39,
        durationHours: 10,
        level: "beginner",
        category: "comprehensive"
      },
      {
        id: 3,
        title: "Indian Sign Language (ISL)",
        description: "Learn Indian Sign Language (ISL) - Alphabet, Numbers, and Basic Greetings",
        language: "ISL",
        imageUrl: "/courses/isl-course.jpg",
        lessons: 39,
        durationHours: 10,
        level: "beginner",
        category: "comprehensive"
      }
    ];

    // Add courses to storage
    sampleCourses.forEach(course => this.courses.set(course.id, course));

    // Create modules for each course (3 modules per course)
    const sampleModules: Module[] = [
      // ASL Modules
      {
        id: 1,
        courseId: 1,
        title: "ASL Alphabet",
        description: "Learn the ASL alphabet - 26 letters",
        type: "alphabets",
        order: 1,
        lessons: 26
      },
      {
        id: 2,
        courseId: 1,
        title: "ASL Numbers",
        description: "Learn numbers 1-10 in ASL",
        type: "numbers",
        order: 2,
        lessons: 10
      },
      {
        id: 3,
        courseId: 1,
        title: "ASL Basic Words & Greetings",
        description: "Learn essential greetings and phrases in ASL",
        type: "greetings",
        order: 3,
        lessons: 3
      },

      // BSL Modules
      {
        id: 4,
        courseId: 2,
        title: "BSL Alphabet",
        description: "Learn the BSL alphabet - 26 letters",
        type: "alphabets",
        order: 1,
        lessons: 26
      },
      {
        id: 5,
        courseId: 2,
        title: "BSL Numbers",
        description: "Learn numbers 1-10 in BSL",
        type: "numbers",
        order: 2,
        lessons: 10
      },
      {
        id: 6,
        courseId: 2,
        title: "BSL Basic Words & Greetings",
        description: "Learn essential greetings and phrases in BSL",
        type: "greetings",
        order: 3,
        lessons: 3
      },

      // ISL Modules
      {
        id: 7,
        courseId: 3,
        title: "ISL Alphabet",
        description: "Learn the ISL alphabet - 26 letters",
        type: "alphabets",
        order: 1,
        lessons: 26
      },
      {
        id: 8,
        courseId: 3,
        title: "ISL Numbers",
        description: "Learn numbers 1-10 in ISL",
        type: "numbers",
        order: 2,
        lessons: 10
      },
      {
        id: 9,
        courseId: 3,
        title: "ISL Basic Words & Greetings",
        description: "Learn essential greetings and phrases in ISL",
        type: "greetings",
        order: 3,
        lessons: 3
      }
    ];

    // Add modules to storage
    sampleModules.forEach(module => this.modules.set(module.id, module));

    // Generate lessons for each module
    let currentLessonId = 1;

    sampleModules.forEach(module => {
      let moduleLessons: Lesson[] = [];
      const language = module.title.split(" ")[0];

      if (module.type === "alphabets") {
        moduleLessons = this.generateAlphabetLessons(currentLessonId, module.id, language);
      } else if (module.type === "numbers") {
        moduleLessons = this.generateNumberLessons(currentLessonId, module.id, language);
      } else if (module.type === "greetings") {
        const greetingsLessons = [
          {
            id: currentLessonId,
            moduleId: module.id,
            title: "Hello and Goodbye",
            description: `Learn basic greetings in ${language}`,
            content: `Learn how to say hello, hi, and goodbye in ${language}`,
            videoUrl: `/videos/${language.toLowerCase()}/greetings/hello-goodbye.mp4`,
            thumbnailUrl: `/thumbnails/${language.toLowerCase()}/greetings/hello-goodbye.jpg`,
            order: 1,
            duration: 180,
            keyPoints: [
              `Basic ${language} greetings`,
              "Different ways to say hello",
              "How to say goodbye",
              "Common greeting etiquette"
            ],
            practiceExercises: [
              {
                type: "record",
                title: "Practice Hello and Goodbye",
                description: "Record yourself signing hello and goodbye",
                content: {
                  prompt: "Sign 'hello' and 'goodbye'"
                }
              }
            ],
            resources: [
              {
                type: "pdf",
                title: `${language} Greetings Guide`,
                description: "Guide for basic greetings",
                url: `/resources/${language.toLowerCase()}/greetings/guide.pdf`
              }
            ]
          },
          {
            id: currentLessonId + 1,
            moduleId: module.id,
            title: "How are you?",
            description: `Learn to ask and respond to 'How are you?' in ${language}`,
            content: `Learn common phrases for asking and responding to 'How are you?' in ${language}`,
            videoUrl: `/videos/${language.toLowerCase()}/greetings/how-are-you.mp4`,
            thumbnailUrl: `/thumbnails/${language.toLowerCase()}/greetings/how-are-you.jpg`,
            order: 2,
            duration: 180,
            keyPoints: [
              "Asking 'How are you?'",
              "Common responses",
              "Facial expressions",
              "Conversation flow"
            ],
            practiceExercises: [
              {
                type: "record",
                title: "Practice Questions",
                description: "Record yourself asking 'How are you?'",
                content: {
                  prompt: "Sign 'How are you?'"
                }
              }
            ],
            resources: [
              {
                type: "pdf",
                title: `${language} Questions Guide`,
                description: "Guide for asking questions",
                url: `/resources/${language.toLowerCase()}/greetings/questions.pdf`
              }
            ]
          },
          {
            id: currentLessonId + 2,
            moduleId: module.id,
            title: "Nice to meet you",
            description: `Learn to say 'Nice to meet you' in ${language}`,
            content: `Learn how to introduce yourself and say 'Nice to meet you' in ${language}`,
            videoUrl: `/videos/${language.toLowerCase()}/greetings/nice-to-meet-you.mp4`,
            thumbnailUrl: `/thumbnails/${language.toLowerCase()}/greetings/nice-to-meet-you.jpg`,
            order: 3,
            duration: 180,
            keyPoints: [
              "Introducing yourself",
              "Saying 'Nice to meet you'",
              "Proper handshake etiquette",
              "Follow-up phrases"
            ],
            practiceExercises: [
              {
                type: "record",
                title: "Practice Introductions",
                description: "Record yourself saying 'Nice to meet you'",
                content: {
                  prompt: "Sign 'Nice to meet you'"
                }
              }
            ],
            resources: [
              {
                type: "pdf",
                title: `${language} Introductions Guide`,
                description: "Guide for introductions",
                url: `/resources/${language.toLowerCase()}/greetings/introductions.pdf`
              }
            ]
          }
        ];
        moduleLessons = greetingsLessons;
      }

      // Add lessons to storage
      moduleLessons.forEach(lesson => this.lessons.set(lesson.id, lesson));
      currentLessonId += moduleLessons.length;
    });
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
        completed: progress === 100,
        practiceResults: null
      });
    }
  }
}

export const storage = new MemStorage();