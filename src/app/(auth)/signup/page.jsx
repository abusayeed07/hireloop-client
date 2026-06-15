"use client";

import "./signup.css";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient, signIn, signUp, useSession } from "@/lib/auth-client";
import toast from "react-hot-toast";

import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

import {
  Card,
  Separator,
  Button,
  Description,
  FieldError,
  Form,
  Input,
  Label,
  TextField,
} from "@heroui/react";

import {
  Eye,
  EyeSlash,
  Person,
  Envelope,
  Lock,
  Camera,
} from "@gravity-ui/icons";

export default function SignUpPage() {
  const router = useRouter();
  const { data: session } = useSession();

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [roleError, setRoleError] = useState("");

  // Redirect to home if already signed in
  useEffect(() => {
    if (session) {
      router.push("/");
    }
  }, [session, router]);

  // signup
  const onSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const role = formData.get("role");
    
    // Only validate role - Better Auth handles the rest
    if (!role) {
      setRoleError("Please select a role");
      toast.error("Please select a role");
      return;
    }
    
    setRoleError("");
    setIsLoading(true);

    try {
      const user = Object.fromEntries(formData.entries());

      const { data, error } = await authClient.signUp.email({
        email: user.email,
        password: user.password,
        name: user.name,
        image: user.image?.trim() || undefined,
        role: role,
      });

      console.log("DATA:", data);
      console.log("ERROR:", error);

      if (error) {
        toast.error(error.message || "Signup failed");
        return;
      }

      toast.success("Account created successfully");
      router.push("/signin");
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  // google signin
  const handleGoogleSignin = async () => {
    try {
      await signIn.social({
        provider: "google",
        callbackURL: "/",
      });
    } catch (error) {
      console.log(error);
      toast.error("Google sign in failed");
    }
  };

  // github signin
  const handleGithubSignin = async () => {
    try {
      await signIn.social({
        provider: "github",
        callbackURL: "/",
      });
    } catch (error) {
      console.log(error);
      toast.error("Github sign in failed");
    }
  };

  // If signed in, don't show signup form (will redirect via useEffect)
  if (session) {
    return null;
  }

  return (
    <div className="signup-container">
      {/* Animated Background */}
      <div className="animated-background">
        <div className="gradient-orb gradient-orb-1"></div>
        <div className="gradient-orb gradient-orb-2"></div>
        <div className="gradient-orb gradient-orb-3"></div>
        <div className="grid-overlay"></div>
      </div>

      {/* Content */}
      <div className="signup-content">
        {/* Header */}
        <div className="signup-header">
          <h1 className="signup-title">Create Account</h1>
          <p className="signup-subtitle">Start your journey today</p>
        </div>

        {/* Card */}
        <Card className="signup-card">
          <div className="signup-card-inner">
            {/* Form */}
            <Form onSubmit={onSubmit} className="signup-form">
              {/* Name Field */}
              <TextField
                isRequired
                name="name"
                type="text"
                className="custom-textfield"
              >
                <Label className="form-label">Full Name</Label>
                <div className="input-wrapper">
                  <Person className="input-icon" size={18} />
                  <Input
                    name="name"
                    placeholder="Enter your full name"
                    className="custom-input"
                  />
                </div>
                <FieldError />
              </TextField>

              {/* Image URL Field */}
              <TextField name="image" type="url" className="custom-textfield">
                <Label className="form-label">Profile Image URL</Label>
                <div className="input-wrapper">
                  <Camera className="input-icon" size={18} />
                  <Input
                    name="image"
                    placeholder="https://example.com/avatar.jpg"
                    className="custom-input"
                  />
                </div>
                <FieldError />
              </TextField>

              {/* Email Field */}
              <TextField
                isRequired
                name="email"
                type="email"
                className="custom-textfield"
                validate={(value) => {
                  if (!value) return "Email is required";
                  if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
                    return "Invalid email address";
                  }
                  return null;
                }}
              >
                <Label className="form-label">Email Address</Label>
                <div className="input-wrapper">
                  <Envelope className="input-icon" size={18} />
                  <Input
                    name="email"
                    placeholder="you@example.com"
                    className="custom-input"
                  />
                </div>
                <FieldError />
              </TextField>

              {/* Password Field */}
              <TextField
                isRequired
                name="password"
                type={showPassword ? "text" : "password"}
                className="custom-textfield"
                validate={(value) => {
                  if (!value) return "Password is required";
                  if (value.length < 8) return "Minimum 8 characters required";
                  if (!/[A-Z]/.test(value))
                    return "Include at least one uppercase letter";
                  if (!/[0-9]/.test(value))
                    return "Include at least one number";
                  return null;
                }}
              >
                <Label className="form-label">Password</Label>
                <div className="password-wrapper">
                  <div className="input-wrapper">
                    <Lock className="input-icon" size={18} />
                    <Input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      className="custom-input"
                    />
                  </div>
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <Description className="password-description">
                  Must contain 8+ characters, uppercase letter & number
                </Description>
                <FieldError />
              </TextField>

              {/* Role Field - Only validation needed */}
              <div className="flex flex-col gap-2">
                <Label className="form-label">
                  Select Role <span className="text-red-400">*</span>
                </Label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="role"
                      value="seeker"
                      defaultChecked
                      required
                      className="w-4 h-4 cursor-pointer accent-cyan-500"
                      onClick={() => setRoleError("")}
                    />
                    <span className="text-gray-300 text-sm group-hover:text-cyan-400 transition-colors">
                      Job Seeker
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="role"
                      value="recruiter"
                      className="w-4 h-4 cursor-pointer accent-cyan-500"
                      onClick={() => setRoleError("")}
                    />
                    <span className="text-gray-300 text-sm group-hover:text-cyan-400 transition-colors">
                      Job Recruiter
                    </span>
                  </label>
                </div>
                {roleError && (
                  <p className="text-red-400 text-xs mt-1">{roleError}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="submit-button"
                isLoading={isLoading}
                isDisabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </Form>

            {/* Divider */}
            <div className="divider-container">
              <Separator className="divider-line" />
              <span className="divider-text">OR CONTINUE WITH</span>
              <Separator className="divider-line" />
            </div>

            {/* Social Buttons */}
            <div className="social-buttons">
              <Button
                onClick={handleGoogleSignin}
                variant="bordered"
                className="social-button"
              >
                <FcGoogle size={20} />
                Google
              </Button>

              <Button
                onClick={handleGithubSignin}
                variant="bordered"
                className="social-button"
              >
                <FaGithub size={18} />
                GitHub
              </Button>
            </div>

            {/* Sign In Link */}
            <p className="signin-link">
              Already have an account?{" "}
              <Link href="/signin" className="signin-link-highlight">
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}