import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useNavigate } from "react-router-dom";
import {
  getUnverifiedAttendance,
  approveAttendance,
  declineAttendance,
} from "@/api/attendanceApi";
import { getLoggedInUser } from "@/api/userApi";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NotificationsPage: React.FC = () => {
  const [theme, setTheme] = useState<string>("dark");
  const [username, setUsername] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [notificationData, setNotificationData] = useState<any[]>([]);
  // New filter states – default "All" means no filter is applied.
  const [filterDepartment, setFilterDepartment] = useState<string>("All");
  const [filterYear, setFilterYear] = useState<string>("All");
  const [filterStatus, setFilterStatus] = useState<string>("All"); // In Time/status filter

  const navigate = useNavigate();

  // Fetch logged in user details
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      navigate("/login");
      return;
    }
    const fetchUser = async () => {
      try {
        const user = await getLoggedInUser(userId);
        setUsername(user.data.name);
      } catch (error) {
        navigate("/login");
      }
    };
    fetchUser();
  }, [navigate]);

  // Fetch unverified attendance records for the selected date
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const formattedDate = selectedDate.toISOString().split("T")[0];
        const data = await getUnverifiedAttendance(formattedDate);
        setNotificationData(data || []);
      } catch (error) {
        setNotificationData([]);
      }
    };
    fetchNotifications();
  }, [selectedDate]);

  // Compute unique departments from the notification data
  const uniqueDepartments = useMemo(() => {
    const depts = new Set<string>();
    notificationData.forEach((record) => {
      if (record.department) depts.add(record.department);
    });
    return Array.from(depts);
  }, [notificationData]);

  // Compute unique years from the notification data
  const uniqueYears = useMemo(() => {
    const years = new Set<string>();
    notificationData.forEach((record) => {
      if (record.year) years.add(record.year);
    });
    return Array.from(years);
  }, [notificationData]);

  // Compute unique statuses (for In Time) from the notification data.
  // If no timeIn exists, we treat that record as "Absent" instead of "N/A".
  const uniqueStatuses = useMemo(() => {
    const statuses = new Set<string>();
    notificationData.forEach((record) => {
      let status = record.status;
      if (!record.timeIn) status = "Absent";
      statuses.add(status);
    });
    return Array.from(statuses);
  }, [notificationData]);

  // Filter notification records using all three criteria.
  const filteredData = useMemo(() => {
    return notificationData.filter((record) => {
      // Compute the status for filtering purposes.
      let computedStatus = record.status;
      if (!record.timeIn) computedStatus = "Absent";

      const deptMatch = filterDepartment === "All" || record.department === filterDepartment;
      const yearMatch = filterYear === "All" || record.year === filterYear;
      const statusMatch = filterStatus === "All" || computedStatus === filterStatus;
      return deptMatch && yearMatch && statusMatch;
    });
  }, [notificationData, filterDepartment, filterYear, filterStatus]);

  // CSS classes for light/dark themes
  const tableClass = theme === "dark" ? "border-white text-white" : "border-black text-black";
  const headerClass = theme === "dark" ? "bg-gray-700 text-white" : "bg-gray-200 text-black";
  const rowClass = theme === "dark" ? "bg-gray-800 text-white" : "bg-gray-100 text-black";
  const alternateRowClass = theme === "dark" ? "bg-gray-700 text-white" : "bg-gray-50 text-black";

  // Format a date/time string to 12‑hour format
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: "numeric", minute: "numeric", hour12: true });
  };

  // Handlers for individual row actions
  const handleApprove = async (id: string) => {
    try {
      await approveAttendance(id, username);
      setNotificationData(notificationData.filter((rec) => rec._id !== id));
    } catch (error) {
      console.error("Error approving attendance", error);
    }
  };

  const handleDecline = async (id: string) => {
    try {
      // Pass username to the decline API so that verifiedBy is updated.
      await declineAttendance(id, username);
      setNotificationData(notificationData.filter((rec) => rec._id !== id));
    } catch (error) {
      console.error("Error declining attendance", error);
    }
  };

  // Bulk actions
  const handleApproveAll = async () => {
    try {
      await Promise.all(filteredData.map((rec) => approveAttendance(rec._id, username)));
      const approvedIds = filteredData.map((rec) => rec._id);
      setNotificationData(notificationData.filter((rec) => !approvedIds.includes(rec._id)));
    } catch (error) {
      console.error("Error approving all", error);
    }
  };

  const handleDeclineAll = async () => {
    try {
      // Make sure to pass username to each decline call.
      await Promise.all(filteredData.map((rec) => declineAttendance(rec._id, username)));
      const declinedIds = filteredData.map((rec) => rec._id);
      setNotificationData(notificationData.filter((rec) => !declinedIds.includes(rec._id)));
    } catch (error) {
      console.error("Error declining all", error);
    }
  };

  // Back button handler
  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className={`flex flex-col p-4 h-screen ${theme === "dark" ? "bg-[#0a0a0a] text-white" : "bg-[#ffffff] text-black"}`}>
      {/* Back button */}
      <Button variant="outline" onClick={handleBack} className="mb-4">
        Back
      </Button>
      <div className="flex">
        {/* Calendar on the left */}
        <div className="mr-8">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date: Date | undefined) => { if (date) setSelectedDate(date); }}
            className="rounded-md border shadow"
          />
        </div>
        {/* Main content: unverified notifications list */}
        <div className="w-full">
          <h2 className="text-xl font-semibold mb-4">Unverified Attendance</h2>
          {/* Filter dropdowns */}
          <div className="flex space-x-4 mb-4">
            {/* Department filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Department: {filterDepartment === "All" ? "All" : filterDepartment}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuItem onClick={() => setFilterDepartment("All")}>
                  All Departments
                </DropdownMenuItem>
                {uniqueDepartments.map((dept) => (
                  <DropdownMenuItem key={dept} onClick={() => setFilterDepartment(dept)}>
                    {dept}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {/* Year filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Year: {filterYear === "All" ? "All" : filterYear}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuItem onClick={() => setFilterYear("All")}>
                  All Years
                </DropdownMenuItem>
                {uniqueYears.map((year) => (
                  <DropdownMenuItem key={year} onClick={() => setFilterYear(year)}>
                    {year}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {/* In Time / Status filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  In Time: {filterStatus === "All" ? "All" : filterStatus}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuItem onClick={() => setFilterStatus("All")}>
                  All
                </DropdownMenuItem>
                {uniqueStatuses.map((status) => (
                  <DropdownMenuItem key={status} onClick={() => setFilterStatus(status)}>
                    {status}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {/* Table displaying notifications */}
          <table className={`w-full border-collapse border ${tableClass}`}>
            <thead className={headerClass}>
              <tr>
                <th className="border px-4 py-2">Name</th>
                <th className="border px-4 py-2">Department</th>
                <th className="border px-4 py-2">Year</th>
                <th className="border px-4 py-2">In Time</th>
                <th className="border px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((record, index) => (
                  <tr key={record._id} className={index % 2 === 0 ? rowClass : alternateRowClass}>
                    <td className="border px-4 py-2">{record.name}</td>
                    <td className="border px-4 py-2">{record.department}</td>
                    <td className="border px-4 py-2">{record.year}</td>
                    <td className="border px-4 py-2">
                      {record.timeIn ? formatTime(record.timeIn) : "Absent"}
                    </td>
                    <td className="border px-4 py-2">
                      <Button onClick={() => handleApprove(record._id)} className="mr-2">
                        Approve
                      </Button>
                      <Button onClick={() => handleDecline(record._id)} variant="destructive">
                        Decline
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="border px-4 py-2 text-center">
                    No pending records
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {/* Bulk actions */}
          <div className="mt-4 flex justify-end space-x-4">
            <Button onClick={handleApproveAll}>Approve All</Button>
            <Button onClick={handleDeclineAll} variant="destructive">
              Decline All
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
