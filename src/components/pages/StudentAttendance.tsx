import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ITEMS_PER_PAGE = 5;

type AttendanceRecord = {
  date: string;
  status: string;
  name: string;
  verifiedBy: any;
  verificationMethod: string;
};

type StudentData = {
  name: string;
  attendance: AttendanceRecord[];
};

const formatDateTime = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleString("en-GB", { 
    day: "2-digit", month: "2-digit", year: "numeric", 
    hour: "2-digit", minute: "2-digit", hour12: false 
  }).replace(",", ""); 
};

const StudentAttendance: React.FC = () => {
  const { studentID } = useParams<{ studentID: string }>();
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [studentName, setStudentName] = useState<string>('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch(`http://localhost:5000/attendance/student/${studentID}`)
      .then(response => response.json())
      .then((data: StudentData) => {
        if (data.attendance && Array.isArray(data.attendance)) {
          setStudentName(data.attendance[0]?.name || 'Unknown Student');
          setAttendance(data.attendance);
        } else {
          console.error("Unexpected API response format:", data);
        }
      })
      .catch(error => console.error('Error fetching attendance:', error));
  }, [studentID]);

  const totalPages = Math.ceil(attendance.length / ITEMS_PER_PAGE);
  const displayedAttendance = attendance.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="p-4 text-white min-h-screen">
      <div className="mb-4 flex justify-between items-center">
        <button className='px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600' onClick={() => navigate(-1)}>Back</button>
      </div>
      <h2 className="text-xl font-semibold mb-4">Attendance Records for {studentName}</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-800 text-white border border-gray-700">
          <thead>
            <tr className="bg-gray-700">
              <th className="py-2 px-4 border border-gray-600">Date</th>
              <th className="py-2 px-4 border border-gray-600">Status</th>
              <th className="py-2 px-4 border border-gray-600">Verified By</th>
              <th className="py-2 px-4 border border-gray-600">Verification Method</th>
            </tr>
          </thead>
          <tbody>
            {displayedAttendance.length > 0 ? (
              displayedAttendance.map((record, index) => (
                <tr key={index} className="text-center">
                  <td className="py-2 px-4 border border-gray-600">{formatDateTime(record.date)}</td>
                  <td className={`py-2 px-4 border border-gray-600 ${record.status === 'Present' ? 'text-green-400' : 'text-red-400'}`}>{record.status}</td>
                  <td className="py-2 px-4 border border-gray-600">{record.verifiedBy?.name || 'N/A'}</td>
                  <td className="py-2 px-4 border border-gray-600">{record.verificationMethod || 'N/A'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-2 px-4 text-center">No attendance records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex justify-center mt-6">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-4 py-2 mx-2 bg-blue-500 text-white rounded disabled:opacity-50 hover:bg-blue-600"
        >
          Prev
        </button>
        <span className="mx-4">Page {page} of {totalPages}</span>
        <button
          disabled={page === totalPages || totalPages === 0}
          onClick={() => setPage(page + 1)}
          className="px-4 py-2 mx-2 bg-blue-500 text-white rounded disabled:opacity-50 hover:bg-blue-600"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default StudentAttendance;
