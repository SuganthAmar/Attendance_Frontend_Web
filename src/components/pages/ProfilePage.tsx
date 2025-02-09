import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { getLoggedInUser, updateUserProfile } from "@/api/userApi";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react"; // Icon for the back button

const ADMIN_PASSWORD = "citchennai"; // Fixed frontend password

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    isAdmin: false,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(user);
  const [adminRequest, setAdminRequest] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          navigate("/login");
          return;
        }

        const response = await getLoggedInUser(userId);
        if (response.success) {
          setUser(response.data);
          setFormData(response.data);
        } else {
          toast.error("Failed to fetch user data.");
          navigate("/login");
        }
      } catch (error) {
        console.error(error);
        toast.error("Error fetching profile data.");
        navigate("/login");
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdminToggle = () => {
    setFormData((prev) => ({ ...prev, isAdmin: !prev.isAdmin }));
  };

  const handleRequestAdmin = () => {
    const password = prompt("Enter the admin password:");
    if (password === ADMIN_PASSWORD) {
      toast.success("Admin access granted! Click edit to change admin");
      setAdminRequest(true);
      setFormData((prev) => ({ ...prev, isAdmin: true }));
    } else {
      toast.error("Incorrect password. Access denied.");
    }
  };

  const handleSubmit = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        toast.error("No user ID found.");
        return;
      }

      const response = await updateUserProfile(
        userId,
        formData.name,
        formData.email,
        formData.password,
        formData.isAdmin
      );

      if (response.success) {
        setUser(response.data);
        setIsEditing(false);
        toast.success("Profile updated successfully!");
      } else {
        toast.error("Failed to update profile.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error updating profile.");
    }
  };

  return (
    <Card className="max-w-lg mx-auto mt-10 p-6 relative">
      {/* Top-left Back Button */}
      <Button
        variant="ghost"
        className="absolute top-4 left-4 flex items-center space-x-2"
        onClick={() => (isEditing ? setIsEditing(false) : navigate("/"))}
      >
        <ArrowLeft className="w-5 h-5" />
        <span>{isEditing ? "Back" : "Home"}</span>
      </Button>

      <CardHeader className="text-center">
        <h2 className="text-lg font-bold">{isEditing ? "Edit Profile" : "Your Profile"}</h2>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <label className="block font-semibold">Name</label>
          <Input
            name="name"
            value={isEditing ? formData.name : user.name}
            onChange={isEditing ? handleChange : undefined}
            readOnly={!isEditing}
            className={isEditing ? "border" : "border-none"}
          />
        </div>
        <div>
          <label className="block font-semibold">Email</label>
          <Input
            name="email"
            value={isEditing ? formData.email : user.email}
            onChange={isEditing ? handleChange : undefined}
            readOnly={!isEditing}
            className={isEditing ? "border" : "border-none"}
          />
        </div>
        <div>
          <label className="block font-semibold">Password</label>
          <Input
            name="password"
            type="password"
            value={isEditing ? formData.password : "********"}
            onChange={isEditing ? handleChange : undefined}
            readOnly={!isEditing}
            className={isEditing ? "border" : "border-none"}
          />
        </div>

        {isEditing && (
          <div className="flex items-center space-x-2">
            <Switch id="admin-toggle" checked={formData.isAdmin} onCheckedChange={handleAdminToggle} />
            <Label htmlFor="admin-toggle">Admin</Label>
          </div>
        )}

        {!user.isAdmin && !adminRequest && (
          <Button onClick={handleRequestAdmin} variant="outline" className="mt-4">
            Request Admin Access
          </Button>
        )}

        <div className="flex justify-end space-x-4 mt-4">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>Save</Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfilePage;
