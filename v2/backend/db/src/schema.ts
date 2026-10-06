export type ProjectStatus = "draft" | "published";

export interface Project {
  id: string;
  slug: string;
  title: string;
  shortDesc: string;
  longDescMd: string;
  featured: boolean;
  status: ProjectStatus;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  subject?: string;
  body: string;
  readAt?: string | null;
  repliedAt?: string | null;
  createdFromIp?: string | null;
  createdAt: string;
}
