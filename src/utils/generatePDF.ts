// src/utils/generatePDF.ts
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generatePDF = (attendanceData: any[]) => {
  const doc = new jsPDF();
  const tableColumn = [
    "Student Name",
    "Register No",
    "Department",
    "Year",
    "Status",
    "Verification",
    "Time In",
    "Verified By",
  ];
  const tableRows: any[] = [];

  attendanceData.forEach((record) => {
    const rowData = [
      record.name,
      record.registerNo,
      record.department,
      record.year,
      record.status,
      record.verificationMethod,
      record.timeIn ? new Date(record.timeIn).toLocaleTimeString() : "N/A",
      record.verifiedBy ? record.verifiedBy : "Pending",
    ];
    tableRows.push(rowData);
  });

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
  });

  return doc;
};
