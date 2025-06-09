// Type definitions for the app
export interface Report {
    id: number;
    title: string;
    description: string;
    imageUrl: string | null;
    location: string;
    status: "active" | "resolved" | "deleted";
    isValid: boolean;
    createdById: string;
    createdAt: Date;
    updatedAt: Date | null;
  }
  
  export interface User {
    id: string;
    name: string | null;
    email: string;
    emailVerified: Date | null;
    image: string | null;
    bio: string | null;
    location: string | null;
    joinedAt: Date;
    isAdmin: boolean;
  }
  
  export interface UserProfile {
    id: number;
    userId: string;
    communities: string[];
    notes: string | null;
    createdAt: Date;
    updatedAt: Date | null;
  }
  
  export interface Tag {
    id: number;
    name: string;
    createdAt: Date;
  }
  
  export interface Comment {
    id: number;
    content: string;
    reportId: number;
    userId: string;
    createdAt: Date;
  }
  
  export interface Like {
    reportId: number;
    userId: string;
    createdAt: Date;
  }
  
  export interface Share {
    id: number;
    reportId: number;
    userId: string;
    platform: string | null;
    createdAt: Date;
  }
  
  export interface ReportViolation {
    id: number;
    reportId: number;
    reportedBy: string;
    reason: string;
    status: "pending" | "reviewed" | "resolved";
    reviewedBy: string | null;
    reviewedAt: Date | null;
    createdAt: Date;
  }
  
  // Extended types with relations
  export interface ReportWithRelations extends Report {
    user: Pick<User, "id" | "name" | "image"> | null;
    likesCount: number;
    commentsCount: number;
    sharesCount?: number;
    likedByUser: boolean;
    tags: Tag[];
  }
  
  export interface CommentWithUser extends Comment {
    user: Pick<User, "id" | "name" | "image"> | null;
  }
  
  export interface ViolationWithRelations extends ReportViolation {
    report: Report | null;
    reportedBy: Pick<User, "id" | "name" | "image"> | null;
    reportCreator?: Pick<User, "id" | "name" | "image"> | null;
  }