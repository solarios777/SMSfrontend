"use server"
import * as z from "zod"
import { TeacherAssignmentSchema, teacherAssignmentSchema } from "../schema/index";
import prisma from "@/lib/prisma";

type currentState={
  success?:boolean,
  error?:boolean,
  message?:string
}


export const createTeacherAssignment = async (
  currentState: currentState,
  data: TeacherAssignmentSchema
) => {
    
    try {
        const {teachername,subjectname,grade,classname,year}=data

        
    console.log("data",data);
    


    
    
    // Find the grade by name
    const gradeId = await prisma.grade.findUnique({
        where: { level: grade },
        select: { id: true } // Select only the ID
    });

   

    if (!gradeId) {
        return { success: false, error: true, message: "Grade not found!" };
    }
    // Find the subject by name
   
        await prisma.teacherAssignment.create({
        data: {
            teacherId: teachername, // Use the found teacher ID
            subjectId: subjectname,
            gradeId: gradeId.id,
            classId: classname,
            year

        }
    }) 
    return { success: true, error: false, message: " Teacher assigned successfully" };

    } catch (error) {
    return { success: false, error: true, message: "An unexpected error occurred" }; 
    }
}

