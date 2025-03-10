// app/api/teacher-schedule/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get("teacherId");

    if (!teacherId) {
      return NextResponse.json(
        { error: "Teacher ID is required" },
        { status: 400 }
      );
    }

    const schedule = await prisma.schedule.findMany({
      where: { teacherId },
      include: {
        subject: true,
        gradeClass: {
          include: {
            grade: true,
            class: true,
          },
        },
      },
      orderBy: [
        { day: "asc" },
        { startTime: "asc" },
      ],
    });

    const formattedSchedule = schedule.map((entry) => ({
      id: entry.id,
      day: entry.day,
      startTime: entry.startTime,
      endTime: entry.endTime,
      subject: entry.subject.name,
      grade: entry.gradeClass.grade.level,
      className: entry.gradeClass.class.name,
    }));

    return NextResponse.json(formattedSchedule, { status: 200 });
  } catch (error) {
    console.error("Error fetching teacher schedule:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}