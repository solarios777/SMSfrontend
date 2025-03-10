
import prisma from "@/lib/prisma";
import { Class, Grade, GradeClass, Prisma } from "@prisma/client";
import Image from "next/image";
import { currentUser } from "@/lib/auth";
import FormContainer from "@/components/FormContainer";

import React from "react";
import DetailClassList from "@/components/DetailClassList";

const ClassListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const user = await currentUser();
  const role = user?.role.toLowerCase();
  const userId = user?.id;

  const { page, teacherId, ...queryParams } = searchParams;

  const query: Prisma.GradeWhereInput = {};

  if (teacherId) {
    query.GradeClass = {
      some: {
        OR: [
          { superviser: { some: { teacherId: teacherId } } },
          { assignments: { some: { teacherId: teacherId } } },
        ],
      },
    };
  }

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined && value.trim() !== "") {
        switch (key) {
          case "search":
            query.level = { equals: Number(value) };
            break;
          default:
            break;
        }
      }
    }
  }

  const [grades, count] = await prisma.$transaction([
    prisma.grade.findMany({
      where: query,
      include: {
        GradeClass: {
          include: {
            class: true,
            superviser: {
              include: {
                teacher: {
                  select: {
                    name: true,
                    surname: true,
                  },
                },
              },
            },
            _count: {
              select: {
                enrollments: true,
              },
            },
          },
        },
      },
    }),
    prisma.grade.count({ where: query }),
  ]);

  const flattenedData = grades.flatMap((grade) =>
    grade.GradeClass.map((gc) => ({
      id: gc.id,
      grade: `G - ${grade.level}`,
      section: gc.class.name,
      students: gc._count.enrollments,
      supervisor:
        gc.superviser.length > 0
          ? gc.superviser.map((sup) => `${sup.teacher.name} ${sup.teacher.surname}`).join(", ")
          : "",
    }))
  );

  const columns = [
    { header: "Grade", accessor: "grade" },
    { header: "Section Name", accessor: "section" },
    { header: "Number of Students", accessor: "students" },
    { header: "Supervisor", accessor: "supervisor" },
  ];

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between mb-4">
        <h1 className="hidden md:block text-lg font-semibold">Classes</h1>
        <div className="flex items-center gap-4">
          <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
            <Image src="/filter.png" alt="Filter" width={14} height={14} />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
            <Image src="/sort.png" alt="Sort" width={14} height={14} />
          </button>
          {role === "admin" && <FormContainer table="assignSupervisor" type="enroll" />}
          {role === "admin" && <FormContainer table="class" type="create" />}
        </div>
      </div>
      <DetailClassList columns={columns} list="classes" data={flattenedData} />
      
    </div>
  );
};

export default ClassListPage;