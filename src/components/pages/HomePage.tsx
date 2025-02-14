// src/components/pages/HomePage.tsx
import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  getAttendanceByDate,
  getUnverifiedAttendance,
  generateAttendanceForDate,
} from "@/api/attendanceApi";
import { getLoggedInUser, getUserById } from "@/api/userApi";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReportDialog } from "@/components/pages/ReportDialog";
import { generatePDF } from "@/utils/generatePDF";

const HomePage: React.FC = () => {
  const [theme, setTheme] = useState<string>("dark");
  const [username, setUsername] = useState<string>("");
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [unverifiedStudents, setUnverifiedStudents] = useState<any[]>([]);
  const [filterDepartment, setFilterDepartment] = useState<string>("");
  const [filterYear, setFilterYear] = useState<string>("");
  const navigate = useNavigate();

  const getStatusClass = (status: string): string => {
    if (status === "Present") return "text-green-500 font-semibold";
    if (status === "Absent") return "text-red-500 font-semibold";
    return "";
  };

  const dropdownContentClass =
    theme === "dark" ? "bg-gray-800 text-white w-56" : "bg-white text-black w-56";
  const actionButtonClass =
    theme === "dark" ? "bg-gray-800 text-white border-gray-700 hover:bg-gray-700" : "bg-gray-100 text-black border-gray-200 hover:bg-gray-200";

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      navigate("/login");
      return;
    }
    const fetchUsername = async () => {
      try {
        const user = await getLoggedInUser(userId);
        setUsername(user.data.name);
      } catch (error) {
        navigate("/login");
      }
    };
    fetchUsername();
  }, [navigate]);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const formattedDate = selectedDate.toISOString().split("T")[0];
        await generateAttendanceForDate(formattedDate);
        let data = await getAttendanceByDate(formattedDate);
        data = await Promise.all(
          data.map(async (record: any) => {
            if (record.verifiedBy) {
              try {
                const userData = await getUserById(record.verifiedBy);
                return { ...record, verifiedBy: userData.name };
              } catch (error) {
                console.error("Error fetching user name", error);
                return record;
              }
            }
            return record;
          })
        );
        setAttendanceData(data || []);
      } catch (error) {
        setAttendanceData([]);
      }
    };
    fetchAttendance();
  }, [selectedDate]);

  useEffect(() => {
    const fetchUnverified = async () => {
      try {
        const formattedDate = selectedDate.toISOString().split("T")[0];
        const data = await getUnverifiedAttendance(formattedDate);
        setUnverifiedStudents(data || []);
      } catch (error) {
        setUnverifiedStudents([]);
      }
    };
    fetchUnverified();
  }, [selectedDate]);

  const uniqueDepartments = useMemo(() => {
    const depts = new Set<string>();
    attendanceData.forEach((record) => {
      if (record.department) depts.add(record.department);
    });
    return Array.from(depts);
  }, [attendanceData]);

  const uniqueYears = useMemo(() => {
    const years = new Set<string>();
    attendanceData.forEach((record) => {
      if (record.year) years.add(record.year);
    });
    return Array.from(years);
  }, [attendanceData]);

  const filteredAttendanceData = attendanceData.filter((record) => {
    return (
      (!filterDepartment || record.department === filterDepartment) &&
      (!filterYear || record.year === filterYear)
    );
  });

  const tableClass = theme === "dark" ? "border-white text-white" : "border-black text-black";
  const headerClass = theme === "dark" ? "bg-gray-700 text-white" : "bg-gray-200 text-black";
  const rowClass = theme === "dark" ? "bg-gray-800 text-white" : "bg-gray-100 text-black";
  const alternateRowClass = theme === "dark" ? "bg-gray-700 text-white" : "bg-gray-50 text-black";

  const handleLogout = () => {
    localStorage.removeItem("userId");
    navigate("/login");
  };

  const getInitials = (name: string): string => {
    if (!name) return "NA";
    const nameParts = name.split(" ");
    return nameParts.map((part) => part[0].toUpperCase()).join("").slice(0, 2);
  };

  const handleDownloadPDF = () => {
    const pdfDoc = generatePDF(attendanceData);
    pdfDoc.save("attendance_report.pdf");
  };

  const handleStudentList = () => {
    navigate("/students");
  };

  return (
    <div className={`relative flex flex-col p-4 h-screen ${theme === "dark" ? "bg-[#0a0a0a] text-white" : "bg-[#ffffff] text-black"}`}>
      {/* Logout Button */}
      <Button
        variant="outline"
        className="absolute top-4 right-8 text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
        onClick={handleLogout}
      >
        Logout
      </Button>

      {/* Profile Avatar */}
      <div
        onClick={() => navigate("/profile")}
        className={`absolute top-4 right-36 flex items-center justify-center w-12 h-12 cursor-pointer ${theme === "dark" ? "bg-white text-black" : "bg-black text-white"} font-bold rounded-full shadow-lg hover:scale-105 transition-all`}
      >
        {getInitials(username)}
      </div>

      {/* Notifications, Download, and Send Report Buttons */}
      <div className="absolute top-4 left-8 flex space-x-2">
        <Button
          variant="outline"
          className={actionButtonClass}
          onClick={() => navigate("/notifications")}
        >
          Notifications ({unverifiedStudents.length})
        </Button>
        <Button variant="outline" className={actionButtonClass} onClick={handleDownloadPDF}>
          Download
        </Button>
        <Button variant="outline" className={actionButtonClass} onClick={handleStudentList}>
          View All Students
        </Button>
        <ReportDialog attendanceData={attendanceData} />
      </div>

      <div className="mt-16 flex">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date: Date | undefined) => {
            if (date) setSelectedDate(date);
          }}
          className={`rounded-md border shadow mr-8 ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}
        />
        <div className="w-full">
          <h2 className="text-xl font-semibold mb-4">Attendance Records</h2>
          <div className="flex space-x-4 mb-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className={actionButtonClass}>
                  Department: {filterDepartment || "All"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className={dropdownContentClass}>
                <DropdownMenuItem onClick={() => setFilterDepartment("")}>
                  All Departments
                </DropdownMenuItem>
                {uniqueDepartments.map((dept) => (
                  <DropdownMenuItem key={dept} onClick={() => setFilterDepartment(dept)}>
                    {dept}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className={actionButtonClass}>
                  Year: {filterYear || "All"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className={dropdownContentClass}>
                <DropdownMenuItem onClick={() => setFilterYear("")}>
                  All Years
                </DropdownMenuItem>
                {uniqueYears.map((year) => (
                  <DropdownMenuItem key={year} onClick={() => setFilterYear(year)}>
                    {year}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <table className={`w-full border-collapse border ${tableClass}`}>
            <thead className={headerClass}>
              <tr>
                <th className="border px-4 py-2">Student Name</th>
                <th className="border px-4 py-2">Register No</th>
                <th className="border px-4 py-2">Department</th>
                <th className="border px-4 py-2">Year</th>
                <th className="border px-4 py-2">Status</th>
                <th className="border px-4 py-2">Verification</th>
                <th className="border px-4 py-2">Time In</th>
                <th className="border px-4 py-2">Verified By</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendanceData.length > 0 ? (
                filteredAttendanceData.map((attendance, index) => (
                  <tr key={attendance._id} className={index % 2 === 0 ? rowClass : alternateRowClass}>
                    <td className="border px-4 py-2">{attendance.name}</td>
                    <td className="border px-4 py-2">{attendance.registerNo}</td>
                    <td className="border px-4 py-2">{attendance.department}</td>
                    <td className="border px-4 py-2">{attendance.year}</td>
                    <td className={`border px-4 py-2 ${getStatusClass(attendance.status)}`}>
                      {attendance.status}
                    </td>
                    <td className="border px-4 py-2">{attendance.verificationMethod}</td>
                    <td className="border px-4 py-2">
                      {attendance.timeIn ? new Date(attendance.timeIn).toLocaleTimeString() : "N/A"}
                    </td>
                    <td className="border px-4 py-2">
                      {attendance.verifiedBy ? attendance.verifiedBy : "Pending"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="border px-4 py-2 text-center">
                    No records
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
