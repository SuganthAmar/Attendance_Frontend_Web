import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getStudentAttendance } from "@/api/attendanceApi";

interface Student {
  _id: string;
  name: string;
  registerNo: string;
  department: string;
  year: string;
}

interface AttendanceRecord {
  _id: string;
  date: string;
  status: string;
  verificationMethod: string;
  timeIn?: string;
  verifiedBy?: string;
  student: Student;
}

const StudentPage: React.FC = () => {
  // Get the studentId from the URL (e.g. /student/123)
  const { studentId } = useParams<{ studentId: string }>();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      try {
        // Call the frontend API helper to fetch attendance records
        const response = await getStudentAttendance(studentId!);
        // Expected response shape: { attendance: [ ... ] }
        setAttendanceRecords(response.data.attendance);
      } catch (err: any) {
        setError(err.response?.data?.message || "Error fetching attendance records");
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      fetchAttendance();
    }
  }, [studentId]);

  // Filter for records where the student was present
  const presentRecords = attendanceRecords.filter(record => record.status === "Present");
  const totalPresent = presentRecords.length;

  // Get student details from the first attendance record (if available)
  const studentDetails = attendanceRecords.length > 0 ? attendanceRecords[0].student : null;

  return (
    <div className="p-4">
      {loading ? (
        <p>Loading attendance records...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          {studentDetails && (
            <div className="mb-4">
              <h2 className="text-2xl font-bold">{studentDetails.name}</h2>
              <p>Register No: {studentDetails.registerNo}</p>
              <p>Department: {studentDetails.department}</p>
              <p>Year: {studentDetails.year}</p>
            </div>
          )}

          <h3 className="text-xl font-semibold mb-2">Attendance Records</h3>
          <table className="min-w-full border-collapse border">
            <thead className="bg-gray-200">
              <tr>
                <th className="border px-4 py-2">Date</th>
                <th className="border px-4 py-2">Status</th>
                <th className="border px-4 py-2">Verification</th>
                <th className="border px-4 py-2">Time In</th>
                <th className="border px-4 py-2">Verified By</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRecords.map(record => (
                <tr key={record._id}>
                  <td className="border px-4 py-2">{new Date(record.date).toLocaleDateString()}</td>
                  <td className="border px-4 py-2">{record.status}</td>
                  <td className="border px-4 py-2">{record.verificationMethod}</td>
                  <td className="border px-4 py-2">
                    {record.timeIn ? new Date(record.timeIn).toLocaleTimeString() : "N/A"}
                  </td>
                  <td className="border px-4 py-2">{record.verifiedBy || "Pending"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4">
            <p className="text-lg font-bold">
              Total Days Present: {totalPresent}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default StudentPage;
