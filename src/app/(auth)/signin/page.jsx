// frontend/src/app/(auth)/signin/page.jsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { User, Lock, Rocket, Ban } from "lucide-react";
import "../signup/signup.css";
import { Eye, EyeSlash, Envelope, Lock as LockIcon } from "@gravity-ui/icons";
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

import { authClient } from "@/lib/auth-client";
import toast from "react-hot-toast";
import LoadingPage from "@/app/loading";

export default function SigninPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);

  const redirectPath = searchParams.get('redirect') || '/browse-jobs';
  const errorParam = searchParams.get('error');

  useEffect(() => {
    if (errorParam) {
      toast.error(`${errorParam} sign in failed. Please try again.`);
    }
  }, [errorParam]);

  // ✅ Check for suspended session on load
  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await authClient.getSession();
        if (session?.user) {
          // ✅ Check if user is suspended
          if (session.user.status === 'suspended') {
            toast.error('Your account has been suspended. Please contact support.');
            await authClient.signOut();
            setIsRedirecting(false);
            return;
          }
          
          setIsRedirecting(true);
          router.push(redirectPath);
        }
      } catch (err) {
        console.log("No active session");
      }
    };
    checkSession();
  }, [router, redirectPath]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await authClient.signIn.email({
        email: email,
        password: password,
        rememberMe: true,
      });

      if (result?.error) {
        // ✅ Check if error indicates suspension
        if (result.error.message?.toLowerCase().includes('suspended')) {
          toast.error('Your account has been suspended. Please contact support.');
          setError('Account suspended. Please contact support.');
        } else {
          setError(result.error.message || "Sign in failed");
          toast.error(result.error.message || "Sign in failed");
        }
        setIsLoading(false);
        return;
      }

      // ✅ After successful sign-in, check if user is suspended
      const session = await authClient.getSession();
      if (session?.user?.status === 'suspended') {
        toast.error('Your account has been suspended. Please contact support.');
        await authClient.signOut();
        setError('Account suspended. Please contact support.');
        setIsLoading(false);
        return;
      }

      toast.success("Signed in successfully");
      setIsRedirecting(true);
      router.push(redirectPath);

    } catch (err) {
      setError(err.message || "An unexpected error occurred");
      toast.error(err.message || "An unexpected error occurred");
      setIsLoading(false);
    }
  };

  // ✅ Social signin handler with suspension check
  const handleSocialSignin = async (provider) => {
    try {
      console.log(`🔄 Signing in with ${provider}...`);
      
      setIsLoading(true);
      
      const result = await authClient.signIn.social({
        provider: provider,
        callbackURL: `${window.location.origin}/browse-jobs`,
      });
      
      console.log(`📦 ${provider} sign in initiated:`, result);
      
    } catch (err) {
      console.error(`❌ ${provider} sign in failed:`, err);
      toast.error(`${provider} sign in failed: ${err.message || "Please try again"}`);
      setIsLoading(false);
    }
  };

  if (isRedirecting || isLoading) {
    return (
      <LoadingPage 
        title={isRedirecting ? "Redirecting..." : "Signing In..."}
        message={isRedirecting ? "Taking you to your dashboard" : "Please wait while we sign you in"}
        customStats={[
          { icon: User, label: "Verifying credentials", animate: "spin" },
          { icon: Lock, label: "Setting up session", animate: "pulse" },
          { icon: Rocket, label: "Preparing dashboard", animate: "bounce" },
        ]}
        customColor="from-blue-400 via-cyan-400 to-teal-400"
      />
    );
  }

  return (
    <div className="signup-container">
      <div className="animated-background">
        <div className="gradient-orb gradient-orb-1"></div>
        <div className="gradient-orb gradient-orb-2"></div>
        <div className="gradient-orb gradient-orb-3"></div>
        <div className="grid-overlay"></div>
      </div>
      <div className="signup-content pt-15">
        <div className="signup-header">
          <h1 className="signup-title">Welcome Back</h1>
          <p className="signup-subtitle">Sign in to your account</p>
        </div>

        <Card className="signup-card">
          <div className="signup-card-inner">
            {error && (
              <div className={`mb-4 p-3 border rounded-lg text-sm text-center ${
                error.toLowerCase().includes('suspended') 
                  ? 'bg-red-500/10 border-red-500/20 text-red-500'
                  : 'bg-red-500/10 border-red-500/20 text-red-500'
              }`}>
                {error}
              </div>
            )}

            <Form onSubmit={onSubmit} className="signup-form">
              <TextField isRequired name="email" type="email">
                <Label className="form-label">Email Address</Label>
                <div className="input-wrapper">
                  <Envelope className="input-icon" size={18} />
                  <Input
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="custom-input"
                  />
                </div>
                <FieldError />
              </TextField>

              <TextField isRequired name="password">
                <Label className="form-label">Password</Label>
                <div className="password-wrapper">
                  <div className="input-wrapper">
                    <LockIcon className="input-icon" size={18} />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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

              <div className="text-right">
                <Link
                  href="/forget-password"
                  className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Forget password?
                </Link>
              </div>

              <Button
                type="submit"
                className="submit-button"
                isLoading={isLoading}
                isDisabled={isLoading}
              >
                Sign In
              </Button>
            </Form>

            <div className="divider-container">
              <Separator className="divider-line" />
              <span className="divider-text">OR CONTINUE WITH</span>
              <Separator className="divider-line" />
            </div>

            <div className="social-buttons">
              <Button 
                onClick={() => handleSocialSignin("google")} 
                variant="bordered" 
                className="social-button"
                isDisabled={isLoading}
              >
                <FcGoogle size={20} />
                Google
              </Button>
              <Button 
                onClick={() => handleSocialSignin("github")} 
                variant="bordered" 
                className="social-button"
                isDisabled={isLoading}
              >
                <FaGithub size={18} />
                GitHub
              </Button>
            </div>

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