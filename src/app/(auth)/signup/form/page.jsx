"use client";

import "../signup.css";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

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
import { Phone } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

export default function SignUpFormPage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role");

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState(roleParam || "seeker");

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const redirectTo = searchParams.get("redirect") || "/";

  useEffect(() => {
    if (session) {
      router.push("/");
    }
  }, [session, router]);

  useEffect(() => {
    if (roleParam && !["seeker", "recruiter"].includes(roleParam)) {
      router.push("/signup");
    }
    if (roleParam) {
      setRole(roleParam);
    }
  }, [roleParam, router]);

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!role) {
      toast.error("Please select a role first");
      router.push("/signup");
      return;
    }

    const plan = role === "seeker" ? "seeker_free" : "recruiter_free";

    const userData = {
      email,
      password,
      name,
      image: image?.trim() || undefined,
      role: role,
      plan: plan,
      status: "active",
      callbackURL: "/signin",
    };

    if (phone?.trim()) {
      userData.phone = phone.trim();
    }

    await authClient.signUp.email(userData, {
      onRequest: () => {
        setIsLoading(true);
      },
      onSuccess: async (response) => {
        const roleLabel = role === "seeker" ? "Job Seeker" : "Recruiter";
        toast.success(`Account created successfully as ${roleLabel}!`);
        
        // ✅ LOG THE SIGNUP
        console.log('🔍🔍🔍 Signup successful!');
        console.log('📝 Response:', response);
        
        try {
          const userId = response?.data?.user?.id || response?.user?.id || response?.data?.id;
          console.log('📝 User ID:', userId);
          console.log('📝 Email:', email);
          console.log('📝 Name:', name);
          console.log('📝 Role:', role);
          
          const logResponse = await fetch(`${API_BASE_URL}/api/users/log-signup`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json' 
            },
            credentials: 'include',
            body: JSON.stringify({
              email,
              name,
              role,
              userId: userId
            })
          });
          
          console.log('📝 Log response status:', logResponse.status);
          
          const logData = await logResponse.json();
          console.log('📝 Log response data:', logData);
          
          if (logData.success) {
            console.log('✅ Signup logged successfully!');
          } else {
            console.error('❌ Failed to log signup:', logData);
          }
        } catch (logError) {
          console.error('❌ Failed to log signup:', logError);
          console.error('❌ Error details:', logError.message);
        }
        
        router.push("/");
      },
      onError: (ctx) => {
        console.error("🚨 Signup error details:", ctx.error);
        const errorMessage = ctx.error?.message || ctx.error?.error || "Signup failed";
        toast.error(errorMessage);
        setIsLoading(false);
      },
    });
  };

  const handleGoogleSignin = async () => {
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });
    } catch (error) {
      console.log(error);
      toast.error("Google sign in failed");
    }
  };

  const handleGithubSignin = async () => {
    try {
      await authClient.signIn.social({
        provider: "github",
        callbackURL: "/",
      });
    } catch (error) {
      console.log(error);
      toast.error("Github sign in failed");
    }
  };

  if (session) {
    return null;
  }

  if (!role) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="text-white">Redirecting...</div>
      </div>
    );
  }

  const roleConfig = {
    seeker: {
      title: "Job Seeker",
      icon: "🔍",
      description: "Find your dream job and build your career",
      buttonText: "Create Seeker Account",
      buttonGradient:
        "from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700",
      accentText: "text-cyan-400",
      borderColor: "border-cyan-500/20",
      bgGradient: "from-cyan-500/10 to-blue-600/10",
    },
    recruiter: {
      title: "Recruiter",
      icon: "💼",
      description: "Find the best talent for your company",
      buttonText: "Create Recruiter Account",
      buttonGradient:
        "from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700",
      accentText: "text-purple-400",
      borderColor: "border-purple-500/20",
      bgGradient: "from-purple-500/10 to-pink-600/10",
    },
  };

  const currentRole = roleConfig[role];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  return (
    <div className="signup-container min-h-screen w-full bg-[#09090b] flex items-center justify-center p-4 relative overflow-hidden">
      {/* 🔮 Animated Background */}
      <div className="animated-background absolute inset-0 pointer-events-none z-0">
        <div className="gradient-orb gradient-orb-1"></div>
        <div className="gradient-orb gradient-orb-2"></div>
        <div className="gradient-orb gradient-orb-3"></div>
        <div className="grid-overlay"></div>
      </div>

      {/* Content Container */}
      <div className="signup-content w-full max-w-xl mt-0 relative z-10">
        <div className="signup-header mb-6">
          <h1 className="signup-title text-2xl font-bold text-white">
            Create {currentRole.title} Account
          </h1>
          <p className="signup-subtitle text-zinc-400 text-sm mt-1">
            {currentRole.description}
          </p>
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <Card className="signup-card overflow-hidden border border-zinc-800/50 bg-zinc-900/40 backdrop-blur-xl shadow-2xl rounded-2xl p-6 md:p-8">
            <div className="signup-card-inner">
              
              {/* ✅ BACK BUTTON INSIDE FORM BOX */}
              <motion.div
                variants={itemVariants}
                className="mb-4 flex items-center gap-3"
              >
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors text-sm font-medium bg-white/[0.05] hover:bg-white/[0.1] px-3 py-1.5 rounded-lg border border-white/5"
                >
                  <ArrowLeft size={16} />
                  Back to roles
                </Link>
                <div className="flex-1 h-px bg-gradient-to-r from-zinc-800/50 to-transparent" />
              </motion.div>

              {/* Role Indicator */}
              <motion.div
                variants={itemVariants}
                className="mb-6 p-3 rounded-lg bg-white/[0.05] border border-white/[0.06] text-center"
              >
                <span className="text-sm text-zinc-400">
                  You are signing up as a{" "}
                  <span className={`${currentRole.accentText} font-semibold`}>
                    {currentRole.title}
                  </span>
                </span>
              </motion.div>

              <Form onSubmit={onSubmit} className="signup-form space-y-4">
                {/* Name Field */}
                <motion.div variants={itemVariants}>
                  <TextField
                    isRequired
                    name="name"
                    type="text"
                    className="w-full"
                  >
                    <Label className="text-xs font-medium text-zinc-400">
                      Full Name
                    </Label>
                    <div className="input-wrapper">
                      <Person className="input-icon" size={18} />
                      <Input
                        name="name"
                        placeholder="Enter your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="custom-input"
                      />
                    </div>
                    <FieldError />
                  </TextField>
                </motion.div>

                {/* Image URL Field */}
                <motion.div variants={itemVariants}>
                  <TextField name="image" type="url" className="w-full">
                    <Label className="text-xs font-medium text-zinc-400">
                      Profile Image URL{" "}
                      <span className="text-zinc-500">(Optional)</span>
                    </Label>
                    <div className="input-wrapper">
                      <Camera className="input-icon" size={18} />
                      <Input
                        name="image"
                        placeholder="https://example.com/avatar.jpg"
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        className="custom-input"
                      />
                    </div>
                    <FieldError />
                  </TextField>
                </motion.div>

                {/* Phone Number Field */}
                <motion.div variants={itemVariants}>
                  <TextField name="phone" type="tel" className="w-full">
                    <Label className="text-xs font-medium text-zinc-400">
                      Phone Number{" "}
                      <span className="text-zinc-500">(Optional)</span>
                    </Label>
                    <div className="input-wrapper">
                      <Phone className="input-icon" size={18} />
                      <Input
                        name="phone"
                        placeholder="+880 1XXX-XXXXXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="custom-input"
                      />
                    </div>
                    <Description className="text-[10px] text-zinc-500">
                      We'll only use this for account recovery and job alerts
                    </Description>
                    <FieldError />
                  </TextField>
                </motion.div>

                {/* Email Field */}
                <motion.div variants={itemVariants}>
                  <TextField
                    isRequired
                    name="email"
                    type="email"
                    className="w-full"
                    validate={(value) => {
                      if (!value) return "Email is required";
                      if (
                        !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)
                      ) {
                        return "Invalid email address";
                      }
                      return null;
                    }}
                  >
                    <Label className="text-xs font-medium text-zinc-400">
                      Email Address
                    </Label>
                    <div className="input-wrapper">
                      <Envelope className="input-icon" size={18} />
                      <Input
                        name="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="custom-input"
                      />
                    </div>
                    <FieldError />
                  </TextField>
                </motion.div>

                {/* Password Field */}
                <motion.div variants={itemVariants}>
                  <TextField
                    isRequired
                    name="password"
                    type={showPassword ? "text" : "password"}
                    className="w-full"
                    validate={(value) => {
                      if (!value) return "Password is required";
                      if (value.length < 8)
                        return "Minimum 8 characters required";
                      if (!/[A-Z]/.test(value))
                        return "Include at least one uppercase letter";
                      if (!/[0-9]/.test(value))
                        return "Include at least one number";
                      return null;
                    }}
                  >
                    <Label className="text-xs font-medium text-zinc-400">
                      Password
                    </Label>
                    <div className="password-wrapper">
                      <div className="input-wrapper">
                        <Lock className="input-icon" size={18} />
                        <Input
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a strong password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="custom-input"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="password-toggle"
                      >
                        {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <Description className="password-description text-[10px] text-zinc-500">
                      Must contain 8+ characters, uppercase letter & number
                    </Description>
                    <FieldError />
                  </TextField>
                </motion.div>

                {/* Submit Button */}
                <motion.div
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    className={`submit-button w-full bg-gradient-to-r ${currentRole.buttonGradient} text-white font-medium py-6 rounded-xl transition-all shadow-lg hover:shadow-xl mt-2`}
                    isLoading={isLoading}
                    isDisabled={isLoading}
                  >
                    {isLoading ? "Creating Account..." : currentRole.buttonText}
                  </Button>
                </motion.div>
              </Form>

              {/* Divider */}
              <motion.div variants={itemVariants} className="divider-container flex items-center gap-4 my-6">
                <Separator className="divider-line flex-1 bg-zinc-800" />
                <span className="divider-text text-xs text-zinc-500 whitespace-nowrap">
                  OR CONTINUE WITH
                </span>
                <Separator className="divider-line flex-1 bg-zinc-800" />
              </motion.div>

              {/* Social Buttons */}
              <motion.div variants={itemVariants} className="social-buttons flex gap-3">
                <motion.div
                  className="flex-1"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={handleGoogleSignin}
                    variant="bordered"
                    className="social-button w-full bg-zinc-900/50 border-zinc-800 text-zinc-300 hover:bg-zinc-800 transition-all"
                  >
                    <FcGoogle size={18} />
                    Google
                  </Button>
                </motion.div>

                <motion.div
                  className="flex-1"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={handleGithubSignin}
                    variant="bordered"
                    className="social-button w-full bg-zinc-900/50 border-zinc-800 text-zinc-300 hover:bg-zinc-800 transition-all"
                  >
                    <FaGithub size={16} />
                    GitHub
                  </Button>
                </motion.div>
              </motion.div>

              {/* Sign In Link */}
              <motion.p
                variants={itemVariants}
                className="signin-link text-center text-zinc-500 text-sm mt-6"
              >
                Already have an account?{" "}
                <Link
                  href={`/signin?redirect=${redirectTo}`}
                  className="signin-link-highlight text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                >
                  Sign in
                </Link>
              </motion.p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}