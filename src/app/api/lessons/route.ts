import { NextResponse } from "next/server";
import { getLessons } from "@/lib/lesson-content";

export async function GET() {
  const lessons = await getLessons();
  return NextResponse.json({ lessons });
}