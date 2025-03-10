import AGgrid from "@/components/AGgrid";
import TableSearch from "@/components/TableSearch";
import { currentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Image from "next/image";
import { Prisma } from "@prisma/client";
import FormContainer from "@/components/FormContainer";

type StudentList = {
  id: string;
  sex: string;
  name: string;
  username: string;
  phone?: string;
  address: any;
  img?: string;
  grade?: string;
  class?: string;
  firstpass?: any;
  age?: number; // Add age field

};

const StudentListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const user = await currentUser();
  const role = user?.role.toLowerCase();

  const columns = [
    { header: "Name", accessor: "name" },
    { header: "Username", accessor: "username" },
    { header: "Sex", accessor: "sex" },
    { header: "Age", accessor: "age" }, 
    { header: "Grade", accessor: "grade" },
    { header: "Class", accessor: "class" },
    { header: "Phone", accessor: "phone" },
    { header: "Address", accessor: "address" },
    { header: "First Pass", accessor: "firstpass" },
    
  ];

  const { search } = searchParams;

  const query: Prisma.StudentWhereInput = search
    ? { name: { contains: search, mode: "insensitive" } }
    : {};

  const [data, count] = await prisma.$transaction([
    prisma.student.findMany({
      where: query,
      include: {
        enrollments: {
          include: { gradeClass: { include: { grade: true, class: true } } },
      },
    },
    }),
    prisma.student.count({ where: query }),
  ]);

  // Transform data to match AG Grid
  const formattedData: any = data.map((student) => {
    // Check if birthday exists and is valid
  const birthDate = student.birthday ? new Date(student.birthday) : null;
  const isBirthDateValid = birthDate && !isNaN(birthDate.getTime());

  // Calculate age only if the birthDate is valid
  const age = isBirthDateValid
    ? new Date().getFullYear() - birthDate.getFullYear()
    : "N/A"; // Fallback for invalid or missing dates

    return {
      id: student.id,
      name: `${student.name} ${student.surname}`,
      username: student.username,
      sex: student.sex,
      phone: student.phone || "N/A",
      address: student.address,
      img: student.img || "/noAvatar.png",
      grade: student.enrollments[0]?.gradeClass?.grade?.level?.toString() || "N/A",
      class: student.enrollments[0]?.gradeClass?.class?.name || "N/A",
      firstpass: student.firstpass,
      age: age, // Add calculated age
    };
  });

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Students</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {role === "admin" && (
              <FormContainer table="student" type="create" />
            )}
          </div>
        </div>
      </div>
      <AGgrid columns={columns} data={formattedData} list="students" />
    </div>
  );
};

export default StudentListPage;