"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Send,
  Sparkles,
  MessageCircle,
  Minimize2,
  Maximize2,
  HelpCircle,
  Search,
  Users,
  Star,
  BarChart,
  UsersRound,
  Briefcase,
  FileText,
  Compass,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import AIAssistantFloatingButton from "./AIAssistantFloatingButton";
import BlobWrapper from "./BlobWrapper";
import { MessageWithAvatar, getBotTheme } from "./MessageWithAvatar";

// ✅ FAQ_RESPONSES
const FAQ_RESPONSES = {
  "how to apply": {
    response: "📝 To apply for a job:\n1. Browse jobs from the 'Browse Jobs' page\n2. Click on a job you're interested in\n3. Click the 'Apply Now' button\n4. Fill out the application form with your details\n5. Upload your resume (required)\n6. Submit your application!\n\nNeed help? I'm here to guide you!",
    action: "/browse-jobs",
  },
  "where is browse jobs": {
    response: "🔍 You can find the 'Browse Jobs' page in the main navigation menu at the top of the page. Look for the 'Browse Jobs' link or click here to go there:",
    action: "/browse-jobs",
  },
  "how to post a job": {
    response: "📢 To post a job:\n1. Go to your Dashboard\n2. Click on 'Post a Job'\n3. Fill in all the job details (title, description, requirements, etc.)\n4. Click 'Post Job'\n5. Your job will be live for applicants to see!\n\nNote: You need to have a company profile first.",
    action: "/dashboard/recruiter/post-job",
  },
  "dashboard": {
    response: "📊 Your dashboard is your central hub. You can:\n• View your applications\n• Post new jobs\n• Manage your company profile\n• Track application statuses\n\nClick here to go to your dashboard:",
    action: "/dashboard",
  },
  "company profile": {
    response: "🏢 To set up your company profile:\n1. Go to your Dashboard\n2. Click on 'Company Settings' or 'Create Company'\n3. Fill in your company details\n4. Upload your company logo\n5. Save your profile\n\nYou need a company profile to post jobs!",
    action: "/dashboard/recruiter/company",
  },
  "application status": {
    response: "📊 To check your application status:\n1. Go to your Dashboard\n2. Click on 'My Applications'\n3. You'll see all your applications with their current status:\n   • Pending - Waiting for review\n   • Under Review - Recruiter is reviewing\n   • Shortlisted - You've been shortlisted!\n   • Interview - Interview scheduled\n   • Hired - Congratulations! 🎉\n   • Rejected - Not selected this time",
    action: "/dashboard/applications",
  },
  "pricing": {
    response: "💰 Our pricing plans:\n• Free Plan - Post up to 3 jobs\n• Growth Plan - Post up to 10 jobs\n• Enterprise Plan - Post up to 50 jobs\n\nClick here to view detailed pricing:",
    action: "/pricing",
  },
  "help": {
    response: "🆘 I'm here to help! You can ask me about:\n• How to apply for jobs\n• How to post a job\n• How to check application status\n• Company profile setup\n• Pricing plans\n• Dashboard navigation\n• Or anything else about the platform!\n\nJust type your question and I'll do my best to help! 😊",
    action: null,
  },
  "hello": {
    response: "👋 Hello there! I'm your AI assistant. I can help you with:\n• Navigating the platform\n• Applying for jobs\n• Posting jobs\n• Checking application status\n• And much more!\n\nWhat would you like to know?",
    action: null,
  },
  "hi": {
    response: "👋 Hi! Welcome to HireLoop! I'm your AI assistant. How can I help you today?\n\nTry asking me:\n• 'How to apply?'\n• 'Where is browse jobs?'\n• 'How to post a job?'\n• 'Check my application status'",
    action: null,
  },
  "default": {
    response: "🤔 I'm not sure about that specific question, but I can help with:\n• How to apply for jobs\n• How to post a job\n• Dashboard navigation\n• Application status\n• Company profile setup\n• Pricing plans\n\nCould you rephrase your question?",
    action: null,
  },
};

// 🎯 Role-based responses (including Admin)
const getRoleBasedResponses = (userRole, query, user) => {
  const lowerQuery = query.toLowerCase().trim();
  
  if (userRole === 'admin') {
    const adminResponses = {
      "analytics": `📊 **Admin Analytics Dashboard**\n\nHere's what you can monitor:\n• 📈 Total users\n• 💼 Active job postings\n• 📝 Application statistics\n• 🏢 Company registrations\n• 📊 Revenue and growth metrics\n\nNeed specific analytics? I can help you find them!`,
      "manage users": `👥 **User Management**\n\nAs an admin, you can:\n• View all users\n• Manage user accounts\n• Review reported content\n• Handle disputes\n• Approve company profiles`,
      "reports": `📋 **Reports & Insights**\n\nGenerate reports for:\n• Monthly active users\n• Job posting trends\n• Application conversion rates\n• Company performance\n• Revenue reports`,
      "moderate": `🛡️ **Content Moderation**\n\nYou can moderate:\n• Job postings (approve/reject)\n• Company profiles\n• User reports\n• Inappropriate content`,
    };
    
    for (const [key, value] of Object.entries(adminResponses)) {
      if (lowerQuery.includes(key)) {
        return { response: value, action: "/dashboard/admin" };
      }
    }
  }
  
  if (userRole === 'seeker' || userRole === 'user') {
    const seekerResponses = {
      "find job": `🔍 Let me help you find your dream job! Categories:\n\n🎨 Design • 💻 Technology • 📈 Marketing • 💰 Finance\n🏥 Healthcare • 🏭 Manufacturing • 👥 HR • 📊 Sales\n\nWhich category interests you?`,
      "apply": `📝 Ready to apply? Here's how:\n1. Browse jobs\n2. Click on a job\n3. Click 'Apply Now'\n4. Fill in your details\n5. Upload your resume\n6. Submit!`,
      "resume": `📄 Resume tips:\n• Keep it concise (1-2 pages)\n• Highlight relevant skills\n• Showcase achievements\n• Use keywords from the job description`,
      "interview": `🎯 Interview tips:\n• Research the company\n• Practice common questions\n• Prepare your own questions\n• Be confident!`,
    };
    
    for (const [key, value] of Object.entries(seekerResponses)) {
      if (lowerQuery.includes(key)) {
        return { response: value, action: null };
      }
    }
  }
  
  if (userRole === 'recruiter') {
    const recruiterResponses = {
      "post job": `📢 To post a job:\n1. Go to Dashboard\n2. Click 'Post a Job'\n3. Fill in job details\n4. Click 'Post Job'\n5. Review applications!`,
      "find talent": `🔍 Looking for talent? Try:\n• Search by skills\n• Filter by location\n• Review applications\n• Use AI-powered matching`,
      "applications": `📊 You have applications waiting!\n1. Review each application\n2. Shortlist candidates\n3. Schedule interviews\n4. Make offers`,
    };
    
    for (const [key, value] of Object.entries(recruiterResponses)) {
      if (lowerQuery.includes(key)) {
        return { response: value, action: null };
      }
    }
  }
  
  if (!user) {
    const guestResponses = {
      "benefit": `🌟 **Why Join HireLoop?**\n\n**Job Seekers:** 🎯 AI matching • 📝 One-click apply • 📊 Track applications\n\n**Recruiters:** 👥 Top talent • 🤖 Smart filtering • ⚡ Fast hiring`,
      "create account": `📝 **Get started:**\n1. Click 'Sign Up'\n2. Choose your role\n3. Complete your profile\n4. Start browsing/posting!`,
      "login": `🔑 To sign in:\n1. Click 'Sign In'\n2. Enter email & password\n3. Or use Google/GitHub`,
    };
    
    for (const [key, value] of Object.entries(guestResponses)) {
      if (lowerQuery.includes(key)) {
        return { response: value, action: null };
      }
    }
  }
  
  return null;
};

// 🥊 Lines shown when the floating blob gets overpoked. onOverpoke fires once
// per rapid-poke *burst* (feral-blob's own internal poke-limit detector) —
// there's no per-single-tap event exposed, so this escalates per burst, not
// per individual poke.
const POKE_LINES = ["Ow, stop!", "Hmm… really?", "hey!", "Enough!"];

// 💤 Line shown when the floating blob (chat closed) has been idle a while.
const IDLE_LINE = "Going somewhere?";
const IDLE_DELAY_MS = 25000;       // how long with no activity before it speaks
const IDLE_REPEAT_DELAY_MS = 60000; // longer gap before it's willing to nag again
const IDLE_SPEECH_VISIBLE_MS = 4000;
const POKE_SPEECH_VISIBLE_MS = 2200;

// 🎯 Main AI Assistant Component
const AIAssistant = () => {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const userRole = user?.role || 'guest';

  // Get the theme based on user role
  const botTheme = getBotTheme(userRole);

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [blobMood, setBlobMood] = useState("neutral");
  const [blobGaze, setBlobGaze] = useState({ x: 0, y: 0 });
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // --- Poke escalation state ---
  const pokeCountRef = useRef(0);
  const [pokeSpeech, setPokeSpeech] = useState(null); // string | null
  const pokeSpeechTimeoutRef = useRef(null);
  const pokeMoodResetTimeoutRef = useRef(null);

  // --- Idle nudge state (floating button only, i.e. chat closed) ---
  const [idleSpeech, setIdleSpeech] = useState(null); // string | null
  const idleTriggerTimeoutRef = useRef(null);
  const idleHideTimeoutRef = useRef(null);
  const hasShownIdleOnceRef = useRef(false);

  // Initial message based on role
  const getInitialMessage = () => {
    if (userRole === 'admin') {
      return {
        id: 1,
        type: "bot",
        text: `👑 Welcome, ${user?.name || 'Admin'}! 🚀\n\nI'm your admin assistant. I can help you:\n• 📊 View platform analytics\n• 👥 Manage users and companies\n• 📋 Generate reports\n• 🛡️ Moderate content\n\nWhat would you like to manage today?`,
        timestamp: new Date(),
      };
    } else if (userRole === 'seeker') {
      return {
        id: 1,
        type: "bot",
        text: `👋 Welcome back, ${user?.name || 'Job Seeker'}! 🎉\n\nI'm your career assistant. I can help you:\n• 🔍 Find your dream job\n• 📝 Apply to positions\n• 📊 Track your applications\n• 💡 Get career advice\n\nWhat would you like to do today?`,
        timestamp: new Date(),
      };
    } else if (userRole === 'recruiter') {
      return {
        id: 1,
        type: "bot",
        text: `👋 Welcome, ${user?.name || 'Recruiter'}! 🏢\n\nI'm your hiring assistant. I can help you:\n• 📢 Post job openings\n• 👥 Find top talent\n• 📊 Review applications\n• 🤝 Manage hiring\n\nHow can I help you find the perfect candidate?`,
        timestamp: new Date(),
      };
    } else {
      return {
        id: 1,
        type: "bot",
        text: `👋 Welcome to HireLoop! 🚀\n\nI'm your AI assistant. I can help you:\n• 🌟 Explore job opportunities\n• 📝 Learn how to apply\n• 💼 Discover recruiter features\n• 🔑 Get started with an account\n\nWhat brings you here today?`,
        timestamp: new Date(),
      };
    }
  };

  useEffect(() => {
    setIsMounted(true);
    setMessages([getInitialMessage()]);
  }, [userRole, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, isMinimized]);

  // Update blob mood based on state
  useEffect(() => {
    if (isTyping) {
      setBlobMood("hmm");
    } else if (messages.length > 5) {
      setBlobMood("happy");
    } else {
      setBlobMood("neutral");
    }
  }, [isTyping, messages.length]);

  // Update blob gaze to follow mouse
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setBlobGaze({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const findBestResponse = (query) => {
    const lowerQuery = query.toLowerCase().trim();
    
    const roleResponse = getRoleBasedResponses(userRole, query, user);
    if (roleResponse) return roleResponse;
    
    for (const [key, value] of Object.entries(FAQ_RESPONSES)) {
      if (lowerQuery.includes(key)) {
        return value;
      }
    }
    
    const keywords = {
      apply: "how to apply",
      browse: "where is browse jobs",
      post: "how to post a job",
      dashboard: "dashboard",
      status: "application status",
      pricing: "pricing",
      help: "help",
      hello: "hello",
      hi: "hi",
    };

    for (const [word, key] of Object.entries(keywords)) {
      if (lowerQuery.includes(word)) {
        return FAQ_RESPONSES[key];
      }
    }

    return FAQ_RESPONSES.default;
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = {
      id: messages.length + 1,
      type: "user",
      text: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    setBlobMood("hmm");

    setTimeout(() => {
      const response = findBestResponse(userMessage.text);
      const botMessage = {
        id: messages.length + 2,
        type: "bot",
        text: response.response,
        timestamp: new Date(),
        action: response.action,
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
      setBlobMood("happy");
    }, 800 + Math.random() * 800);
  };

  const handleSuggestionClick = (suggestion) => {
    const userMessage = {
      id: messages.length + 1,
      type: "user",
      text: suggestion,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);
    setBlobMood("hmm");

    setTimeout(() => {
      const response = findBestResponse(suggestion);
      const botMessage = {
        id: messages.length + 2,
        type: "bot",
        text: response.response,
        timestamp: new Date(),
        action: response.action,
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
      setBlobMood("happy");
    }, 800 + Math.random() * 800);
  };

  const handleActionClick = (path) => {
    setIsOpen(false);
    router.push(path);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // --- Poke escalation: cycles through POKE_LINES on each overpoke burst ---
  const handleOverpoke = useCallback(() => {
    const line = POKE_LINES[pokeCountRef.current % POKE_LINES.length];
    pokeCountRef.current += 1;

    clearTimeout(pokeSpeechTimeoutRef.current);
    clearTimeout(pokeMoodResetTimeoutRef.current);

    setBlobMood("angry");
    setPokeSpeech(line);

    pokeSpeechTimeoutRef.current = setTimeout(() => {
      setPokeSpeech(null);
    }, POKE_SPEECH_VISIBLE_MS);

    pokeMoodResetTimeoutRef.current = setTimeout(() => {
      setBlobMood("neutral");
    }, POKE_SPEECH_VISIBLE_MS);
  }, []);

  useEffect(() => {
    return () => {
      clearTimeout(pokeSpeechTimeoutRef.current);
      clearTimeout(pokeMoodResetTimeoutRef.current);
    };
  }, []);

  // --- Idle nudge: only while the floating button is showing (chat closed) ---
  useEffect(() => {
    // Chat is open — no idle nagging, and clear anything pending.
    if (isOpen) {
      clearTimeout(idleTriggerTimeoutRef.current);
      clearTimeout(idleHideTimeoutRef.current);
      setIdleSpeech(null);
      return;
    }

    const scheduleIdleTrigger = (delay) => {
      clearTimeout(idleTriggerTimeoutRef.current);
      idleTriggerTimeoutRef.current = setTimeout(() => {
        setIdleSpeech(IDLE_LINE);
        hasShownIdleOnceRef.current = true;

        clearTimeout(idleHideTimeoutRef.current);
        idleHideTimeoutRef.current = setTimeout(() => {
          setIdleSpeech(null);
          // Willing to nag again, but only after a longer quiet stretch.
          scheduleIdleTrigger(IDLE_REPEAT_DELAY_MS);
        }, IDLE_SPEECH_VISIBLE_MS);
      }, delay);
    };

    const resetIdleTimer = () => {
      // Any real activity cancels a pending nag and restarts the wait.
      if (!idleSpeech) {
        scheduleIdleTrigger(
          hasShownIdleOnceRef.current ? IDLE_REPEAT_DELAY_MS : IDLE_DELAY_MS
        );
      }
    };

    const activityEvents = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];
    activityEvents.forEach((evt) => window.addEventListener(evt, resetIdleTimer, { passive: true }));

    // Start the first countdown immediately.
    scheduleIdleTrigger(IDLE_DELAY_MS);

    return () => {
      activityEvents.forEach((evt) => window.removeEventListener(evt, resetIdleTimer));
      clearTimeout(idleTriggerTimeoutRef.current);
      clearTimeout(idleHideTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isMounted) return null;

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 group">
          <div className="relative">
            <div className="absolute inset-[-8px] rounded-full bg-gradient-to-r from-blue-500/30 to-purple-500/30 blur-xl animate-pulse" />
            <div
              onClick={() => setIsOpen(true)}
              className="cursor-pointer hover:scale-105 transition-transform duration-300"
            >
              <div className="relative w-16 h-16 md:w-20 md:h-20">
                <BlobWrapper
                  mood={blobMood}
                  gaze={blobGaze}
                  size={80}
                  themeColors={botTheme}
                  onOverpoke={handleOverpoke}
                  speechText={pokeSpeech || idleSpeech}
                  speechMood={pokeSpeech ? "angry" : "neutral"}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ 
              scale: 1, 
              opacity: 1, 
              y: 0,
              width: isMinimized ? "auto" : "400px",
              height: isMinimized ? "auto" : "550px",
            }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 20 }}
            className={`fixed bottom-6 right-6 z-50 bg-[#121214] border border-zinc-800 rounded-2xl shadow-2xl shadow-blue-500/10 overflow-hidden ${
              isMinimized ? "p-4" : "flex flex-col"
            }`}
          >
            {/* Header */}
            <div className="pl-12 flex items-center justify-between p-4 border-b border-zinc-800 bg-gradient-to-r from-blue-600/10 to-purple-600/10">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10">
                  <BlobWrapper
                    mood={blobMood}
                    gaze={blobGaze}
                    size={40}
                    themeColors={botTheme}
                    onOverpoke={handleOverpoke}
                    speechText={pokeSpeech}
                    speechMood="angry"
                  />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm flex items-center gap-1">
                    HireSync
                    <Sparkles className="w-3 h-3 text-yellow-400" />
                  </h3>
                  <p className="text-xs text-zinc-500">
                    {isTyping ? "Thinking..." : "Online • Ready to help"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages with Avatars */}
            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-[#0d0d0e] to-[#121214]">
                  {messages.map((message) => (
                    <MessageWithAvatar
                      key={message.id}
                      message={message.text}
                      isUser={message.type === "user"}
                      user={user}
                      botMood={blobMood}
                      botGaze={blobGaze}
                      timestamp={message.timestamp}
                      onActionClick={handleActionClick}
                      showRole={true}
                    />
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start gap-2">
                      <div className="relative w-8 h-8">
                        <BlobWrapper
                          mood="hmm"
                          gaze={blobGaze}
                          size={32}
                          themeColors={botTheme}
                        />
                      </div>
                      <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-2xl p-3">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                          <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Suggestions */}
                {messages.length <= 3 && (
                  <div className="px-4 pb-2 flex flex-wrap gap-2">
                    {userRole === 'admin' && (
                      <>
                        <button onClick={() => handleSuggestionClick("Analytics")} className="px-3 py-1.5 bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-300 text-xs rounded-full border border-zinc-700/50 transition-colors flex items-center gap-1.5">
                          <BarChart className="w-3 h-3 text-purple-400" /> Analytics
                        </button>
                        <button onClick={() => handleSuggestionClick("Manage users")} className="px-3 py-1.5 bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-300 text-xs rounded-full border border-zinc-700/50 transition-colors flex items-center gap-1.5">
                          <UsersRound className="w-3 h-3 text-blue-400" /> Manage Users
                        </button>
                        <button onClick={() => handleSuggestionClick("Reports")} className="px-3 py-1.5 bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-300 text-xs rounded-full border border-zinc-700/50 transition-colors flex items-center gap-1.5">
                          <FileText className="w-3 h-3 text-green-400" /> Reports
                        </button>
                      </>
                    )}
                    {userRole === 'seeker' && (
                      <>
                        <button onClick={() => handleSuggestionClick("Find jobs")} className="px-3 py-1.5 bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-300 text-xs rounded-full border border-zinc-700/50 transition-colors flex items-center gap-1.5">
                          <Search className="w-3 h-3 text-blue-400" /> Find jobs
                        </button>
                        <button onClick={() => handleSuggestionClick("How to apply?")} className="px-3 py-1.5 bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-300 text-xs rounded-full border border-zinc-700/50 transition-colors flex items-center gap-1.5">
                          <FileText className="w-3 h-3 text-green-400" /> How to apply?
                        </button>
                      </>
                    )}
                    {userRole === 'recruiter' && (
                      <>
                        <button onClick={() => handleSuggestionClick("Post a job")} className="px-3 py-1.5 bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-300 text-xs rounded-full border border-zinc-700/50 transition-colors flex items-center gap-1.5">
                          <Briefcase className="w-3 h-3 text-purple-400" /> Post a job
                        </button>
                        <button onClick={() => handleSuggestionClick("Find talent")} className="px-3 py-1.5 bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-300 text-xs rounded-full border border-zinc-700/50 transition-colors flex items-center gap-1.5">
                          <Users className="w-3 h-3 text-green-400" /> Find talent
                        </button>
                      </>
                    )}
                    {!user && (
                      <>
                        <button onClick={() => handleSuggestionClick("Benefits")} className="px-3 py-1.5 bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-300 text-xs rounded-full border border-zinc-700/50 transition-colors flex items-center gap-1.5">
                          <Star className="w-3 h-3 text-yellow-400" /> Benefits
                        </button>
                        <button onClick={() => handleSuggestionClick("Create account")} className="px-3 py-1.5 bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-300 text-xs rounded-full border border-zinc-700/50 transition-colors flex items-center gap-1.5">
                          <User className="w-3 h-3 text-blue-400" /> Sign up
                        </button>
                      </>
                    )}
                    <button onClick={() => handleSuggestionClick("Help")} className="px-3 py-1.5 bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-300 text-xs rounded-full border border-zinc-700/50 transition-colors flex items-center gap-1.5">
                      <HelpCircle className="w-3 h-3 text-red-400" /> Help
                    </button>
                  </div>
                )}

                {/* Input Area */}
                <div className="p-4 border-t border-zinc-800 bg-[#0d0d0e]">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex gap-2"
                  >
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask me anything..."
                      className="flex-1 bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-2.5 text-white placeholder:text-zinc-500 outline-none focus:border-blue-500/50 transition-colors text-sm"
                    />
                    <button
                      type="submit"
                      disabled={!input.trim() || isTyping}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl px-4 py-2.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIAssistant;