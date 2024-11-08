"use server"
import * as z from "zod"
import bcrypt from "bcryptjs"

import { teacherSchema} from "../schema";
import { error } from "console";
import prisma from "@/lib/prisma";
export const teacherRegister=async(values: z.infer<typeof teacherSchema>) => {
    const valdatedfields = teacherSchema.parse(values)
    if(!valdatedfields){
        return {error:"Invalid Credentials"}
    }

    const {username, name, surname, email, phone, address, img, bloodType, birthday, sex, role}=valdatedfields

    // Function to generate a random 6-character password
    const generateRandomPassword = () => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let password = '';
        for (let i = 0; i < 6; i++) {
            password += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return password;
    };

    const password = generateRandomPassword(); 
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const existingUser = await prisma.teacher.findUnique({
        where:{
            username
        }
      
    })
    const existingEmail = await prisma.teacher.findUnique({
        where:{
            email
        }
      
    }) 
    const existingPhone = await prisma.teacher.findUnique({
        where:{
            
            phone
        }
      
    })

    if(existingUser){
        return {error:"username already in use!"}
    }
    if(existingEmail){
        return {error:"email already in use!"}
    }
    if(existingPhone){
        return {error:"phone already in use!"}
    }
    await prisma.teacher.create({
        data:{
            username,
            password:hashedPassword,
            name,
            surname,
            email,
            phone,
            address,
            img,
            bloodType,
            birthday,
            sex,
            role
        }
    })



    return {success:"account created successfully"} 
    
}