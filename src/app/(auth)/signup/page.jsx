"use client";

import "./signup.css";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

import { authClient, signUp } from "@/lib/auth-client";

import toast from "react-hot-toast";

export default function SignUpPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] =
    useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  // signup
  const onSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);

    try {
      const formData = new FormData(
        e.currentTarget
      );

      const user = Object.fromEntries(
        formData.entries()
      );

      const { data, error } =
        await signUp.email({
          email: user.email,
          password: user.password,
          name: user.name,
          image:
            user.image?.trim() || undefined,
        });

      console.log("DATA:", data);
      console.log("ERROR:", error);

      if (error) {
        toast.error(
          error.message || "Signup failed"
        );

        return;
      }

      toast.success(
        "Account created successfully"
      );

      router.push("/");
    } catch (error) {
      console.log(error);

      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  // google signin
  const handleGoogleSignin =
    async () => {
      try {
        await authClient.signIn.social({
          provider: "google",
          callbackURL: "/",
        });
      } catch (error) {
        console.log(error);

        toast.error(
          "Google sign in failed"
        );
      }
    };

  // github signin
  const handleGithubSignin =
    async () => {
      try {
        await authClient.signIn.social({
          provider: "github",
          callbackURL: "/",
        });
      } catch (error) {
        console.log(error);

        toast.error(
          "Github sign in failed"
        );
      }
    };

  return (
    <div className="signup-container">
      {/* background */}
      <div className="animated-background">
        <div className="gradient-orb gradient-orb-1"></div>

        <div className="gradient-orb gradient-orb-2"></div>

        <div className="gradient-orb gradient-orb-3"></div>

        <div className="grid-overlay"></div>
      </div>

      {/* content */}
      <div className="signup-content">
        {/* header */}
        <div className="signup-header">
          <h1 className="signup-title">
            Create Account
          </h1>

          <p className="signup-subtitle">
            Start your journey today
          </p>
        </div>

        {/* card */}
        <Card className="signup-card">
          <div className="signup-card-inner">
            {/* form */}
            <Form
              onSubmit={onSubmit}
              className="signup-form"
            >
              {/* name */}
              <TextField
                isRequired
                name="name"
                type="text"
              >
                <Label className="form-label">
                  Name
                </Label>

                <div className="input-container">
                  <Person
                    className="input-icon"
                    size={16}
                  />

                  <Input
                    name="name"
                    placeholder="Enter your name"
                    className={{
                      input:
                        "custom-input",
                      inputWrapper:
                        "custom-input-wrapper",
                    }}
                  />
                </div>

                <FieldError />
              </TextField>

              {/* image */}
              <TextField
                name="image"
                type="url"
              >
                <Label className="form-label">
                  Image URL
                </Label>

                <div className="input-container">
                  <Camera
                    className="input-icon"
                    size={16}
                  />

                  <Input
                    name="image"
                    placeholder="https://example.com"
                    className={{
                      input:
                        "custom-input",
                      inputWrapper:
                        "custom-input-wrapper",
                    }}
                  />
                </div>

                <FieldError />
              </TextField>

              {/* email */}
              <TextField
                isRequired
                name="email"
                type="email"
                validate={(value) => {
                  if (!value) {
                    return "Email is required";
                  }

                  if (
                    !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(
                      value
                    )
                  ) {
                    return "Invalid email";
                  }

                  return null;
                }}
              >
                <Label className="form-label">
                  Email
                </Label>

                <div className="input-container">
                  <Envelope
                    className="input-icon"
                    size={16}
                  />

                  <Input
                    name="email"
                    placeholder="you@example.com"
                    className={{
                      input:
                        "custom-input",
                      inputWrapper:
                        "custom-input-wrapper",
                    }}
                  />
                </div>

                <FieldError />
              </TextField>

              {/* password */}
              <TextField
                isRequired
                name="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                validate={(value) => {
                  if (!value) {
                    return "Password required";
                  }

                  if (value.length < 8) {
                    return "Minimum 8 characters";
                  }

                  if (!/[A-Z]/.test(value)) {
                    return "Add uppercase letter";
                  }

                  if (!/[0-9]/.test(value)) {
                    return "Add one number";
                  }

                  return null;
                }}
              >
                <Label className="form-label">
                  Password
                </Label>

                <div className="password-wrapper">
                  <div className="input-container">
                    <Lock
                      className="input-icon"
                      size={16}
                    />

                    <Input
                      name="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      placeholder="Choose password"
                      className={{
                        input:
                          "custom-input",
                        inputWrapper:
                          "custom-input-wrapper",
                      }}
                    />
                  </div>

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                  >
                    {showPassword ? (
                      <EyeSlash size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>

                <Description className="password-description">
                  Must contain uppercase &
                  number
                </Description>

                <FieldError />
              </TextField>

              {/* button */}
              <Button
                type="submit"
                className="submit-button"
                isLoading={isLoading}
                isDisabled={isLoading}
              >
                {isLoading
                  ? "Creating..."
                  : "Create Account"}
              </Button>
            </Form>

            {/* divider */}
            <div className="divider-container">
              <Separator className="divider-line" />

              <span className="divider-text">
                OR CONTINUE WITH
              </span>

              <Separator className="divider-line" />
            </div>

            {/* socials */}
            <div className="social-buttons">
              <Button
                onClick={
                  handleGoogleSignin
                }
                variant="bordered"
                className="social-button"
              >
                <FcGoogle className="text-lg" />
                Google
              </Button>

              <Button
                onClick={
                  handleGithubSignin
                }
                variant="bordered"
                className="social-button"
              >
                <FaGithub className="text-lg" />
                GitHub
              </Button>
            </div>

            {/* signin */}
            <p className="signin-link">
              Already have an account?{" "}
              <Link
                href="/signin"
                className="signin-link-highlight"
              >
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}