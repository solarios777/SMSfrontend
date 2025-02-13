import { PrismaClient } from '@prisma/client';
import { uuid } from 'uuidv4';

const prisma = new PrismaClient();



async function main() {
  // Create Parents
  const parents = await Promise.all(
    Array.from({ length: 10 }, (_, i) => 
      prisma.parent.create({
        data: {
          id: uuid(),
          username: `parent_user_${i + 1}`,
          name: `Parent Name ${i + 1}`,
          surname: `Surname ${i + 1}`,
          email: `parent${i + 1}@example.com`,
          sex: i % 2 === 0 ? 'MALE' : 'FEMALE',
          bloodType: 'O+',
          phone: `12345678${i}`,
          address: `Address ${i + 1}`,
          password: 'securepassword',
          birthday: new Date(2005 - i, 0, 1),
        },
      })
    )
  );

  // Create Students
  const students = await Promise.all(
    Array.from({ length: 10 }, (_, i) => 
      prisma.student.create({
        data: {
          username: `student_user_${i + 1}`,
          name: `Student Name ${i + 1}`,
          surname: `Surname ${i + 1}`,
          email: `student${i + 1}@example.com`,
          phone: `98765432${i}`,
          address: `Address ${i + 1}`,
          bloodType: 'O+',
          sex: i % 2 === 0 ? 'MALE' : 'FEMALE',
          password: 'securepassword',
          birthday: new Date(2005 - i, 0, 1), // Different birthdays
          parentId: parents[i].id,
        },
      })
    )
  );

  // Create Teachers
  const teachers = await Promise.all(
    Array.from({ length: 10 }, (_, i) => 
      prisma.teacher.create({
        data: {
          username: `teacher_user_${i + 1}`,
          name: `Teacher Name ${i + 1}`,
          surname: `Surname ${i + 1}`,
          email: `teacher${i + 1}@example.com`,
          phone: `11122233${i}`,
          address: `Address ${i + 1}`,
          bloodType: 'A+',
          sex: i % 2 === 0 ? 'MALE' : 'FEMALE',
          password: 'securepassword',
          birthday: new Date(1980 - i, 0, 1), // Different birthdays
        },
      })
    )
  );

  // Create Subjects
  const subjects = await Promise.all(
    ['Mathematics', 'Science', 'History', 'Chemistry', 'Biology', 'English', 'Physics', 'Geography', 'Literature'].map(name => 
      prisma.subject.create({ data: { name } })
    )
  );

  // Create Grades
  const grades = await Promise.all(
    Array.from({ length: 12 }, (_, i) => 
      prisma.grade.create({
        data: {
          level: i + 1,
        },
      })
    )
  );

  // Create Classes
  const classes = await Promise.all(
    ['A', 'B', 'C', 'D', 'E'].map(name => 
      prisma.class.create({
        data: {
          name: name
        },
      })
    )
  );

  // Create GradeClass Combinations
  const gradeClasses = await Promise.all(
    classes.flatMap(classItem => 
      grades.map(grade => 
        prisma.gradeClass.create({
          data: {
            gradeId: grade.id,
            classId: classItem.id,
          },
        })
      )
    )
  );

  // Create Enrollments
  await Promise.all(
    students.map((student, index) => {
      const gradeClass = gradeClasses[index % gradeClasses.length]; // Assign GradeClass in a loop
      return prisma.enrollment.create({
        data: {
          studentId: student.id,
          gradeClassId: gradeClass.id,
          year: 2023,
        },
      });
    })
  );

  // Create Teacher Assignments
  await Promise.all(
    teachers.map((teacher, index) => {
      const gradeClass = gradeClasses[index % gradeClasses.length]; // Assign GradeClass in a loop
      const subject = subjects[index % subjects.length]; // Assign Subject in a loop
      return prisma.teacherAssignment.create({
        data: {
          teacherId: teacher.id,
          gradeClassId: gradeClass.id,
          subjectId: subject.id,
          year: 2023,
        },
      });
    })
  );

// Create Attendance Records
// Create Attendance Records
await Promise.all(
  students.flatMap((student) => {
    const attendanceRecords = Array.from({ length: 20 }, () => {
      const randomDay = Math.floor(Math.random() * 29) + 1; // Random day (1-29)
      const randomMonth = Math.floor(Math.random() * 12); // Random month (0-11)
      const randomYear = 2025; // Fixed year

      const normalizedDate = new Date(randomYear, randomMonth, randomDay); // Use random day

      // Function to determine attendance status
      const getRandomStatus = () => {
        const randomValue = Math.random();
        if (randomValue < 0.8) {
          return 'PRESENT'; // 80% chance
        } else if (randomValue < 0.95) {
          return 'LATE'; // 15% chance
        } else {
          return 'ABSENT'; // 5% chance
        }
      };

      return prisma.attendance.create({
        data: {
          day: randomDay,
          studentId: student.id,
          status: getRandomStatus(), // Populate status based on probabilities
          date: normalizedDate, // Store as full DateTime
        },
      });
    });

    return attendanceRecords;
  })
);


  // Create SubjectClassGrades
  await Promise.all(
    subjects.flatMap(subject => 
      gradeClasses.map(gradeClass => 
        prisma.subjectClassGrade.create({
          data: {
            subjectId: subject.id,
            classId: gradeClass.classId,
            gradeId: gradeClass.gradeId,
            year: 2024,
          },
        })
      )
    )
  );

  console.log('Seeding completed.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
