// src/components/ReportDialog.tsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { generatePDF } from '@/utils/generatePDF';

interface ReportDialogProps {
  attendanceData: any[];
}

const API_URL = "http://localhost:5000";

export function ReportDialog({ attendanceData }: ReportDialogProps) {
  const [emails, setEmails] = useState("");
  const [message, setMessage] = useState("");

  const handleSend = async () => {
    // Split the emails by comma and remove extra spaces.
    const emailList = emails.split(",").map(e => e.trim()).filter(Boolean);

    // Generate the PDF document.
    const pdfDoc = generatePDF(attendanceData);
    const pdfBlob = pdfDoc.output("blob");

    // Prepare the data to send (using FormData).
    const formData = new FormData();
    formData.append("emails", emailList.join(","));
    formData.append("message", message);
    formData.append("pdf", pdfBlob, "attendance_report.pdf");

    // Call your backend API endpoint (adjust the URL as needed).
    try {
      const response = await fetch(`${API_URL}/api/send-email`, {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        alert("Email sent successfully!");
      } else {
        alert("Failed to send email");
      }
    } catch (error) {
      console.error("Error sending email", error);
      alert("Error sending email");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Send the Report</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send the Report</DialogTitle>
          <DialogDescription>
            Enter email addresses (comma separated) and a message. The current attendance table will be attached as a PDF.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="emails" className="text-right">
              Mail To
            </Label>
            <Input
              id="emails"
              placeholder="email1@example.com, email2@example.com"
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="message" className="text-right">
              Message
            </Label>
            <Input
              id="message"
              placeholder="Enter your message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleSend}>
            Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
