"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import "../signup/signup.css";

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

import { Eye, EyeSlash, Envelope, Lock } from "@gravity-ui/icons";
import { authClient, signIn, useSession } from "@/lib/auth-client";

import toast from "react-hot-toast";

export default function SigninPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect to home if already signed in
  useEffect(() => {
    if (session) {
      router.push("/");
    }
  }, [session, router]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const user = Object.fromEntries(formData.entries());

      const { error } = await authClient.signIn.email({
        email: user.email,
        password: user.password,
        callbackURL: "/",
      });

      if (error) {
        toast.error(error.message || "Sign in failed");
        return;
      }

      toast.success("Signed in successfully");
      router.push("/");
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignin = async () => {
    try {
      await signIn.social({
        provider: "google",
        callbackURL: "/",
      });
    } catch (error) {
      toast.error("Google sign in failed");
    }
  };

  const handleGithubSignin = async () => {
    try {
      await signIn.social({
        provider: "github",
        callbackURL: "/",
      });
    } catch (error) {
      toast.error("GitHub sign in failed");
    }
  };

  // Show loading while checking session (only one loading state)
  if (isPending) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If signed in, don't show signin form (will redirect via useEffect)
  if (session) {
    return null;
  }

  return (
    <div className="signup-container">
      <div className="animated-background">
        <div className="gradient-orb gradient-orb-1"></div>
        <div className="gradient-orb gradient-orb-2"></div>
        <div className="gradient-orb gradient-orb-3"></div>
        <div className="grid-overlay"></div>
      </div>

      <div className="signup-content">
        <div className="signup-header">
          <h1 className="signup-title">Welcome Back</h1>
          <p className="signup-subtitle">Sign in to your account</p>
        </div>

        <Card className="signup-card">
          <div className="signup-card-inner">
            <Form onSubmit={onSubmit} className="signup-form">
              {/* EMAIL field */}
              <TextField isRequired name="email" type="email">
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

              {/* PASSWORD field */}
              <TextField isRequired name="password">
                <Label className="form-label">Password</Label>
                <div className="password-wrapper">
                  <div className="input-wrapper">
                    <Lock className="input-icon" size={18} />
                    <Input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
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
                  Enter your account password
                </Description>
                <FieldError />
              </TextField>

              {/* Submit Button */}
              <Button
                type="submit"
                className="submit-button"
                isLoading={isLoading}
                isDisabled={isLoading}
              >
                {isLoading ? "Signing In..." : "Sign In"}
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
              Don't have an account?{" "}
              <Link href="/signup" className="signin-link-highlight">
                Create Account
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
