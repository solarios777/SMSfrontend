"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Eye, EyeOff } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { changePassword } from "@/app/_services/changePassword";

// Define Password Schema
const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(/[A-Z]/, "Must include at least one uppercase letter")
      .regex(/[a-z]/, "Must include at least one lowercase letter")
      .regex(/[0-9]/, "Must include at least one number")
      .regex(/[\W_]/, "Must include at least one special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type PasswordSchema = z.infer<typeof passwordSchema>;

const ChangePassword = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<PasswordSchema>({
    resolver: zodResolver(passwordSchema),
  });


  // State for password visibility
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // State for Dialog
  const [openDialog, setOpenDialog] = useState(false);

  // Toggle password visibility
  const toggleVisibility = (field: "current" | "new" | "confirm") => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // Handle password submission
  

const onSubmit = async () => {
  const { currentPassword, newPassword } = getValues();

  try {
    await changePassword(currentPassword, newPassword);
    toast.success("Password changed successfully!");
    setOpenDialog(false);
    
  } catch (error) {
    toast.error("Failed to change password. Please try again.");
  }
};


  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <form className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold text-center mb-4">Change Password</h2>

        {/* Current Password */}
        <div className="mb-4 relative">
          <label className="block text-sm font-medium text-gray-700">Current Password</label>
          <div className="relative">
            <input
              type={showPassword.current ? "text" : "password"}
              {...register("currentPassword")}
              className="w-full px-4 py-2 mt-1 border rounded-md focus:ring focus:ring-blue-300 pr-10"
              placeholder="Enter current password"
            />
            <button
              type="button"
              onClick={() => toggleVisibility("current")}
              className="absolute inset-y-0 right-2 flex items-center text-gray-500"
            >
              {showPassword.current ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.currentPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.currentPassword.message}</p>
          )}
        </div>

        {/* New Password */}
        <div className="mb-4 relative">
          <label className="block text-sm font-medium text-gray-700">New Password</label>
          <div className="relative">
            <input
              type={showPassword.new ? "text" : "password"}
              {...register("newPassword")}
              className="w-full px-4 py-2 mt-1 border rounded-md focus:ring focus:ring-blue-300 pr-10"
              placeholder="Enter new password"
            />
            <button
              type="button"
              onClick={() => toggleVisibility("new")}
              className="absolute inset-y-0 right-2 flex items-center text-gray-500"
            >
              {showPassword.new ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.newPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.newPassword.message}</p>
          )}
        </div>

        {/* Confirm New Password */}
        <div className="mb-4 relative">
          <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
          <div className="relative">
            <input
              type={showPassword.confirm ? "text" : "password"}
              {...register("confirmPassword")}
              className="w-full px-4 py-2 mt-1 border rounded-md focus:ring focus:ring-blue-300 pr-10"
              placeholder="Confirm new password"
            />
            <button
              type="button"
              onClick={() => toggleVisibility("confirm")}
              className="absolute inset-y-0 right-2 flex items-center text-gray-500"
            >
              {showPassword.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Open Dialog on Button Click */}
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <button
              type="button"
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
              onClick={handleSubmit(() => setOpenDialog(true))}
            >
              Change Password
            </button>
          </DialogTrigger>

          {/* Confirmation Dialog */}
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Password Change</DialogTitle>
            </DialogHeader>
            <p className="text-gray-600">Are you sure you want to change your password?</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={onSubmit}>
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </form>
    </div>
  );
};

export default ChangePassword;
