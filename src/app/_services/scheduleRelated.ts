import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const assignSubjects = async (subjectId: string, selectedSections: Record<string, string[]>) => {
  try {
    const response = await axiosInstance.post("/tasksApi/subSecGradeRelation", {
      subjectId,
      selectedSections,
    });
    return response.data;
  } catch (error) {
    console.error("Error assigning subjects:", error);
    throw error;
  }
};
export const assignTeachforSubjects = async (subjectId: string, selectedSections: Record<string, string[]>, teacherId: string, year: string) => {
  try {
    const response = await axiosInstance.post("/tasksApi/TeachSubClassRelation", {
      subjectId,
      selectedSections,
      teacherId,
      year
    });
    return response.data;
  } catch (error) {
    console.error("Error assigning subjects:", error);
    throw error;
  }
};


export const fetchSchedules = async () => {
  try {
    const response = await axiosInstance.get("/tasksApi/fetchSchedule");
    return response.data;
  } catch (error) {
    console.error("Error fetching schedules:", error);
    throw error;
  }
};

export const updateSchedule = async (id: string, updatedData: any) => {
  try {
    const response = await axiosInstance.put(`/tasksApi/editSchedule/${id}`, updatedData);
    return response.data;
  } catch (error) {
    console.error("Error updating schedule:", error);
    throw error;
  }
};

export const deleteSchedule = async (id: string) => {
  try {
    await axiosInstance.delete(`/tasksApi/editSchedule/${id}`);
  } catch (error) {
    console.error("Error deleting schedule:", error);
    throw error;
  }
};



export default axiosInstance;
