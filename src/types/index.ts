import { UserRole, Level } from '@prisma/client'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  level?: Level
  studentId?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Alumni {
  id: string
  userId: string
  graduationYear?: number
  degree?: string
  institution?: string
  currentCompany?: string
  currentPosition?: string
  linkedInProfile?: string
  bio?: string
  isPublic: boolean
}

export interface Course {
  id: string
  name: string
  level: Level
  description?: string
  orderIndex: number
}

export interface LearningProgress {
  id: string
  userId: string
  topicId: string
  preClassComplete: boolean
  liveClassAttended: boolean
  afterClassComplete: boolean
  completedAt?: Date
}

// NextAuth type extensions
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      level?: string
      refreshToken?: string
    }
  }

  interface User {
    role: string
    level?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    level?: string
    refreshToken?: string
  }
}