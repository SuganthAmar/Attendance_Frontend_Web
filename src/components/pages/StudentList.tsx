import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RECORDS_PER_PAGE = 6;

type StudentCardProps = {
  profilePic: string;
  id: string;
  regNo: string;
  name: string;
  dept: string;
  address: string;
  email: string;
  city: string;
  contact: string;
  fatherContact: string;
  dob: string;
  year: string;
  status: string;
};

const StudentCard: React.FC<{ student: StudentCardProps; onViewDetails: (student: StudentCardProps) => void }> = ({ student, onViewDetails }) => {
  return (
    <div className="max-w-sm w-full bg-gray-800 shadow-lg rounded-lg overflow-hidden border border-gray-700 p-4">
      <div className="flex items-center">
        <img
          src={student.profilePic}
          alt="Profile"
          className="w-24 h-32 object-cover rounded-md border border-gray-500"
        />
        <div className="ml-4">
          <h2 className="text-xl font-semibold text-white">{student.name}</h2>
          <p className="text-gray-300">Reg No: {student.regNo}</p>
          <p className="text-gray-300">Dept: {student.dept}</p>
          <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" onClick={() => onViewDetails(student)}>View Details</button>
        </div>
      </div>
    </div>
  );
};

const StudentList: React.FC = () => {
  const [students, setStudents] = useState<StudentCardProps[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentCardProps[]>([]);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentCardProps | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:5000/student/all`)
      .then(response => response.json())
      .then(data => {
        if (data.students && Array.isArray(data.students)) {
          const studentData = data.students.map((student: any) => ({
            profilePic: student.image,
            regNo: student.registerNo,
            name: student.name,
            dept: student.department,
            address: student.address,
            email: student.email,
            city: student.city,
            contact: student.contact,
            fatherContact: student.fatherContact,
            dob: student.dob,
            year: student.year,
            status: student.status,
            id: student._id
          }));
          setStudents(studentData);
          setFilteredStudents(studentData);
        } else {
          console.error("Unexpected API response format:", data);
        }
      })
      .catch(error => console.error('Error fetching students:', error));
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredStudents(students);
    } else {
      setFilteredStudents(
        students.filter(student => student.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    setPage(1);
  }, [searchQuery, students]);

  const totalPages = Math.ceil(filteredStudents.length / RECORDS_PER_PAGE);
  const displayedStudents = filteredStudents.slice((page - 1) * RECORDS_PER_PAGE, page * RECORDS_PER_PAGE);

  const goBack = () => {
    window.history.back();
  };

  return (
    <div className="p-4 text-white min-h-screen">
      <div className="mb-4 flex justify-between items-center">
        <button className='px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600' onClick={goBack}>Back</button>
        <input
          type="text"
          placeholder="Search by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="p-2 border rounded w-1/2 bg-gray-800 text-white border-gray-600"
        />
      </div>
      {displayedStudents.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {displayedStudents.map((student) => (
            <StudentCard key={student.regNo} student={student} onViewDetails={setSelectedStudent} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-400">No students found.</p>
      )}
      <div className="flex justify-center mt-6">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-4 py-2 mx-2 bg-blue-500 text-white rounded disabled:opacity-50 hover:bg-blue-600"
        >
          Prev
        </button>
        <span className="mx-4">Page {page} of {totalPages || 1}</span>
        <button
          disabled={page === totalPages || totalPages === 0}
          onClick={() => setPage(page + 1)}
          className="px-4 py-2 mx-2 bg-blue-500 text-white rounded disabled:opacity-50 hover:bg-blue-600"
        >
          Next
        </button>
      </div>
      {selectedStudent && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96 text-white">
            <div className='text-center'>
              <img
                src={selectedStudent.profilePic}
                alt="Profile"
                className="w-24 h-32 object-cover rounded-md border border-gray-500 mx-auto"
              />
              <h2 className="text-xl font-semibold text-center mt-2">{selectedStudent.name}</h2>
              <p>Reg No: {selectedStudent.regNo}</p>
              <p>Dept: {selectedStudent.dept}</p>
              <p>Year: {selectedStudent.year}</p>
              <p>Email: {selectedStudent.email}</p>
              <p>Address: {selectedStudent.address}</p>
              <p>City: {selectedStudent.city}</p>
              <p>Contact: {selectedStudent.contact}</p>
              <p>Father's Contact: {selectedStudent.fatherContact}</p>
              <p>DOB: {selectedStudent.dob}</p>
              <p>Status: {selectedStudent.status}</p>
            </div>
            <div className="flex justify-between mt-4">
              <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600" onClick={() => setSelectedStudent(null)}>Close</button>
              <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" onClick={() => navigate(`/student/${selectedStudent.id}/attendance`)}>View Attendance</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentList;