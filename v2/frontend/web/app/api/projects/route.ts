import { NextResponse } from "next/server";
import { listPublishedProjects } from "@/lib/projects-store";

export async function GET() {
  const projects = await listPublishedProjects();
  const types = Array.from(new Set(projects.map((project) => project.type)));

  return NextResponse.json({
    projects,
    total: projects.length,
    types,
  });
}
