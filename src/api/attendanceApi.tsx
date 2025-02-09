import axios from "axios";

const API_URL = "http://localhost:5000/attendance";

// Fetch attendance for a given date
export const getAttendanceByDate = async (date: string) => {
  try {
    const response = await axios.get(`${API_URL}/date/${date}`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching attendance by date:", error);
    return [];
  }
};

// Fetch unverified attendance for a given date
export const getUnverifiedAttendance = async (date: string) => {
  try {
    const response = await axios.get(`${API_URL}/unverified/${date}`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching unverified attendance:", error);
    return [];
  }
};

export const approveAttendance = async (id: string, username: string) => {
  console.log(id);
  console.log(username);
  try {
    const response = await axios.put(`${API_URL}/approve/${id}`, {
      verifiedBy: username,
    });
    return response.data;
  } catch (error) {
    console.error("Error approving attendance:", error);
    throw error;
  }
};

export const declineAttendance = async (id: string, username: string) => {
  try {
    await axios.put(`${API_URL}/decline/${id}`, { verifiedBy: username });
  } catch (error) {
    console.error("Error declining attendance:", error);
  }
};

export const approveAllAttendance = async (username: string) => {
  try {
    await axios.put(`${API_URL}/approve-all`, { verifiedBy: username });
  } catch (error) {
    console.error("Error approving all attendance:", error);
  }
};

export const generateAttendanceForDate = async (date: string) => {
  try {
    const response = await axios.post(`${API_URL}/generate/${date}`);
    return response.data;
  } catch (error) {
    console.error("Error generating attendance records:", error);
    throw error;
  }
};
export const getStudentAttendance = (
  studentId: string,
  startDate?: string,
  endDate?: string
) => {
  const params: Record<string, string> = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  return axios.get(`${API_URL}/student/${studentId}`, { params });
};