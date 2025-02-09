import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { loginUser } from "@/api/userApi"; // Import the loginUser function

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type LoginFormValues = z.infer<typeof formSchema>;

export function LoginForm() {
  const navigate = useNavigate();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      // Attempt to log in the user
      const response = await loginUser(values.email, values.password);

      if (response.success) {
        // Store user data (userId and userName) in localStorage
        localStorage.setItem("userId", response.data._id);  // Store user ID
        localStorage.setItem("userName", response.data.name);  // Store user Name

        toast.success("Login successful!");
        navigate("/"); // Redirect to homepage or desired page after login
      } else {
        toast.error("Login failed. Please check your credentials and try again.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again later.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg dark:bg-gray-800 dark:text-white">
        <h2 className="text-2xl font-semibold text-center mb-6 dark:text-white">Login</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel className="dark:text-white">Email</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="password" render={({ field }) => (
              <FormItem>
                <FormLabel className="dark:text-white">Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Enter your password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center text-sm">
          <span className="text-gray-600 dark:text-gray-400">Don't have an account?</span>
          <button
            className="ml-2 text-blue-500 dark:text-blue-400 hover:underline"
            onClick={() => navigate("/register")}
          >
            Register here
          </button>
        </div>
      </div>
    </div>
  );
}
