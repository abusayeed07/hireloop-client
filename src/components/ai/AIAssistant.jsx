"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";

import { motion, AnimatePresence } from "framer-motion";

import {
  X,
  Send,
  Sparkles,
  Minimize2,
  Maximize2,
  HelpCircle,
  Search,
  Users,
  User,
  Star,
  BarChart,
  UsersRound,
  Briefcase,
  FileText,
  Compass,
  Moon,
  Sun,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

import { authClient } from "@/lib/auth-client";
import AIAssistantFloatingButton from "./AIAssistantFloatingButton";
import BlobWrapper from "./BlobWrapper";
import { MessageWithAvatar, getBotTheme } from "./MessageWithAvatar";

// ============================================================
// SESSION - Removed chat history storage
// ============================================================

// ============================================================
// FAQ RESPONSES
// ============================================================

const FAQ_RESPONSES = {
  "how to apply": {
    response:
      "📝 To apply for a job:\n\n1. Browse jobs from the 'Browse Jobs' page\n2. Click on a job you're interested in\n3. Click the 'Apply Now' button\n4. Fill out the application form\n5. Upload your resume\n6. Submit your application!\n\nNeed help? I'm here to guide you!",
    action: "/browse-jobs",
  },

  "where is browse jobs": {
    response:
      "🔍 You can find the 'Browse Jobs' page in the main navigation menu.\n\nI'll take you there:",
    action: "/browse-jobs",
  },

  "how to post a job": {
    response:
      "📢 To post a job:\n\n1. Go to your Dashboard\n2. Click on 'Post a Job'\n3. Fill in all the job details\n4. Click 'Post Job'\n5. Your job will be live!\n\nNote: You need a company profile first.",
    action: "/dashboard/recruiter/post-job",
  },

  dashboard: {
    response:
      "📊 Your dashboard is your central hub.\n\nYou can:\n• View applications\n• Post jobs\n• Manage your company\n• Track application statuses\n\nI'll take you to your dashboard:",
    action: "/dashboard",
  },

  "company profile": {
    response:
      "🏢 To set up your company profile:\n\n1. Go to your Dashboard\n2. Open Company Settings\n3. Fill in your company details\n4. Upload your company logo\n5. Save your profile\n\nYou need a company profile to post jobs!",
    action: "/dashboard/recruiter/company",
  },

  "application status": {
    response:
      "📊 To check your application status:\n\n1. Go to your Dashboard\n2. Click 'My Applications'\n3. You'll see your current application statuses.\n\nI'll take you there:",
    action: "/dashboard/applications",
  },

  pricing: {
    response:
      "💰 Our pricing plans:\n\n• Free Plan - Post up to 3 jobs\n• Growth Plan - Post up to 10 jobs\n• Enterprise Plan - Post up to 50 jobs\n\nI'll take you to pricing:",
    action: "/pricing",
  },

  help: {
    response:
      "🆘 I'm here to help!\n\nYou can ask me about:\n• Finding jobs\n• Job categories\n• Applying for jobs\n• Posting jobs\n• Application status\n• Company profile\n• Pricing\n• Dashboard navigation\n\nTry asking:\n\n\"Show me education jobs\"\n\"Find marketing jobs\"\n\"Give me sales jobs\"",
    action: null,
  },

  hello: {
    response:
      "👋 Hello there!\n\nI'm your HireLoop AI assistant. I can help you find jobs, navigate the platform, and more.\n\nWhat would you like to know?",
    action: null,
  },

  hi: {
    response:
      "👋 Hi! Welcome to HireLoop!\n\nTry asking me:\n• Show me education jobs\n• Find marketing jobs\n• Give me sales jobs\n• Find technology jobs",
    action: null,
  },

  default: {
    response:
      "🤔 I'm not sure about that specific question.\n\nI can help with:\n• Finding jobs\n• Job categories\n• Applying for jobs\n• Posting jobs\n• Application status\n• Company profiles\n• Pricing\n\nTry something like:\n\n\"Show me education jobs\"",
    action: null,
  },
};

// ============================================================
// ROLE BASED RESPONSES
// ============================================================

const getRoleBasedResponses = (userRole, query, user) => {
  const lowerQuery = query.toLowerCase().trim();

  if (userRole === "admin") {
    const adminResponses = {
      analytics: `📊 **Admin Analytics Dashboard**

Here's what you can monitor:

- 📈 Total users
- 💼 Active job postings
- 📝 Application statistics
- 🏢 Company registrations
- 📊 Revenue and growth metrics`,

      "manage users": `👥 **User Management**

As an admin, you can:

- View all users
- Manage user accounts
- Review reported content
- Handle disputes
- Approve company profiles`,

      reports: `📋 **Reports & Insights**

Generate reports for:

- Monthly active users
- Job posting trends
- Application conversion rates
- Company performance
- Revenue reports`,

      moderate: `🛡️ **Content Moderation**

You can moderate:

- Job postings
- Company profiles
- User reports
- Inappropriate content`,
    };

    for (const [key, value] of Object.entries(adminResponses)) {
      if (lowerQuery.includes(key)) {
        return {
          response: value,
          action: "/dashboard/admin",
        };
      }
    }
  }

  if (userRole === "seeker" || userRole === "user") {
    const seekerResponses = {
      apply: `📝 Ready to apply?

1. Browse jobs
2. Click on a job
3. Click 'Apply Now'
4. Fill in your details
5. Upload your resume
6. Submit!`,

      resume: `📄 Resume tips:

- Keep it concise
- Highlight relevant skills
- Showcase achievements
- Use keywords from the job description`,

      interview: `🎯 Interview tips:

- Research the company
- Practice common questions
- Prepare your own questions
- Be confident!`,
    };

    for (const [key, value] of Object.entries(seekerResponses)) {
      if (lowerQuery.includes(key)) {
        return {
          response: value,
          action: null,
        };
      }
    }
  }

  if (userRole === "recruiter") {
    const recruiterResponses = {
      "post job": `📢 To post a job:

1. Go to Dashboard
2. Click 'Post a Job'
3. Fill in job details
4. Click 'Post Job'
5. Review applications!`,

      "find talent": `🔍 Looking for talent?

- Search by skills
- Filter by location
- Review applications
- Use AI-powered matching`,

      applications: `📊 You have applications waiting!

1. Review candidates
2. Shortlist candidates
3. Schedule interviews
4. Make offers`,
    };

    for (const [key, value] of Object.entries(recruiterResponses)) {
      if (lowerQuery.includes(key)) {
        return {
          response: value,
          action: null,
        };
      }
    }
  }

  if (!user) {
    const guestResponses = {
      benefit: `🌟 **Why Join HireLoop?**

**Job Seekers:**
🎯 AI matching
📝 Easy applications
📊 Track applications

**Recruiters:**
👥 Find top talent
🤖 Smart filtering
⚡ Faster hiring`,

      "create account": `📝 **Get started:**

1. Click 'Sign Up'
2. Choose your role
3. Complete your profile
4. Start browsing or posting!`,

      login: `🔑 **To sign in:**

1. Click 'Sign In'
2. Enter your email and password
3. Or use Google/GitHub`,
    };

    for (const [key, value] of Object.entries(guestResponses)) {
      if (lowerQuery.includes(key)) {
        return {
          response: value,
          action: null,
        };
      }
    }
  }

  return null;
};

// ============================================================
// JOB CATEGORIES
// ============================================================

const JOB_CATEGORIES = {
  design: [
    "design", "ui", "ux", "graphic", "creative", "product design",
    "visual", "ui/ux", "web design", "app design", "art",
    "illustrator", "photoshop", "figma", "sketch", "adobe",
  ],
  technology: [
    "technology", "tech", "software", "developer", "engineer",
    "programming", "coding", "it", "devops", "data science", "ai",
    "machine learning", "frontend", "backend", "full stack", "cloud",
    "aws", "azure", "python", "java", "javascript", "react", "node",
    "docker", "kubernetes", "sql", "database", "security", "c++",
    "c#", "ruby", "php", "html", "css",
  ],
  marketing: [
    "marketing", "seo", "social media", "content marketing",
    "digital marketing", "brand", "branding", "advertising",
    "campaign", "growth", "email marketing", "public relations", "pr",
  ],
  finance: [
    "finance", "accounting", "investment", "banking", "financial",
    "audit", "tax", "insurance", "underwriting", "claims",
    "accountant", "budget", "forecasting",
  ],
  healthcare: [
    "healthcare", "health", "medical", "nursing", "wellness",
    "hospital", "doctor", "clinic", "patient", "laboratory", "medicine",
  ],
  manufacturing: [
    "manufacturing", "production", "quality", "mechanical",
    "electrical", "industrial", "supply chain", "textile", "steel",
    "maintenance", "safety", "operations", "plant", "factory", "warehouse",
  ],
  "human resources": [
    "human resources", "human resource", "hr", "recruitment",
    "recruiter", "talent acquisition", "training", "employee relations",
    "employee", "hiring", "benefits", "compensation", "onboarding",
  ],
  sales: [
    "sales", "sales representative", "sales manager", "b2b", "b2c",
    "account management", "business development", "retail", "store",
    "client", "customer", "lead generation", "territory",
  ],
  education: [
    "education", "educational", "teacher", "teaching", "tutor",
    "tutoring", "lecturer", "professor", "instructor", "academic",
    "school", "college", "university", "training", "curriculum",
  ],
};

// ============================================================
// CATEGORY DISPLAY NAMES
// ============================================================

const CATEGORY_DISPLAY_NAMES = {
  design: "Design",
  technology: "Technology",
  marketing: "Marketing",
  finance: "Finance",
  healthcare: "Healthcare",
  manufacturing: "Manufacturing",
  "human resources": "Human Resources",
  sales: "Sales",
  education: "Education",
};

// ============================================================
// NORMALIZE TEXT
// ============================================================

const normalizeText = (value) => {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
};

// ============================================================
// FIND CATEGORY
// ============================================================

const findMatchingCategory = (query) => {
  const lowerQuery = normalizeText(query);

  const exactCategoryNames = Object.keys(JOB_CATEGORIES)
    .sort((a, b) => b.length - a.length);

  for (const category of exactCategoryNames) {
    if (
      lowerQuery === category ||
      lowerQuery.includes(`${category} jobs`) ||
      lowerQuery.includes(`${category} job`) ||
      lowerQuery.includes(`${category} positions`) ||
      lowerQuery.includes(`${category} opportunities`) ||
      lowerQuery.includes(`${category} roles`)
    ) {
      return { category, keyword: category };
    }
  }

  let bestMatch = null;
  let bestKeyword = "";

  for (const [category, keywords] of Object.entries(JOB_CATEGORIES)) {
    for (const keyword of keywords) {
      const normalizedKeyword = normalizeText(keyword);
      if (!normalizedKeyword) continue;

      const keywordRegex = new RegExp(
        `(^|\\s|[^a-z0-9+#])${normalizedKeyword.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        )}($|\\s|[^a-z0-9+#])`,
        "i"
      );

      if (keywordRegex.test(lowerQuery)) {
        if (normalizedKeyword.length > bestKeyword.length) {
          bestKeyword = normalizedKeyword;
          bestMatch = category;
        }
      }
    }
  }

  if (bestMatch) {
    return { category: bestMatch, keyword: bestKeyword };
  }

  return null;
};

// ============================================================
// HANDLE JOB CATEGORY COMMAND
// ============================================================

const handleJobCategoryCommand = (query) => {
  const match = findMatchingCategory(query);

  if (match) {
    return {
      category: match.category,
      searchTerm: match.keyword,
      displayTerm: CATEGORY_DISPLAY_NAMES[match.category],
    };
  }

  const jobPatterns = [
    /(?:show|find|get|see|look for|search for|i want|give me)\s+(?:me\s+)?(.+?)\s+(?:jobs?|positions?|opportunities?|roles?)/i,
    /(.+?)\s+(?:jobs?|positions?|opportunities?|roles?)(?:\s+please)?$/i,
    /(?:show|find|get|see|give me)\s+(?:me\s+)?(.+)/i,
  ];

  for (const pattern of jobPatterns) {
    const result = query.match(pattern);
    if (!result?.[1]) continue;

    const phrase = result[1].trim();
    const phraseMatch = findMatchingCategory(phrase);

    if (phraseMatch) {
      return {
        category: phraseMatch.category,
        searchTerm: phraseMatch.keyword,
        displayTerm: CATEGORY_DISPLAY_NAMES[phraseMatch.category],
      };
    }
  }

  return null;
};

// ============================================================
// GENERIC JOB / CATEGORY REQUEST DETECTOR
// ============================================================

const GENERIC_JOBS_REGEX =
  /\b(jobs?|categor(?:y|ies)|positions?|openings?|opportunit(?:y|ies)|roles?)\b/i;

// ============================================================
// POKE LINES
// ============================================================

const POKE_LINES = ["Ow, stop!", "Hmm… really?", "Hey!", "Enough!"];

// ============================================================
// AUTO MESSAGES
// ============================================================

const AUTO_MESSAGES = [
  "Need any help? 🤗",
  "I'm here if you need me! ✨",
  "Looking for something? 🔍",
  "Don't be shy, ask me anything! 😊",
  "Still here, ready to help! 💪",
];

const SLEEP_MESSAGE = "💤 Taking a nap... Wake me when you need me! 😴";

// ============================================================
// TIMING
// ============================================================

const IDLE_DELAY_MS = 20000;
const AUTO_MESSAGE_INTERVAL_MS = 30000;
const SLEEP_AFTER_MS = 150000;
const SPEECH_VISIBLE_MS = 4000;
const POKE_SPEECH_VISIBLE_MS = 3000;

// ============================================================
// MAIN COMPONENT
// ============================================================

const AIAssistant = () => {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const userRole = user?.role || "guest";
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
  const pokeCountRef = useRef(0);
  const pokeSpeechTimeoutRef = useRef(null);
  const pokeMoodResetTimeoutRef = useRef(null);
  const autoMessageTimeoutRef = useRef(null);
  const sleepTimeoutRef = useRef(null);
  const speechHideTimeoutRef = useRef(null);
  const autoMessageIndexRef = useRef(0);

  const [pokeSpeech, setPokeSpeech] = useState(null);
  const [autoSpeech, setAutoSpeech] = useState(null);
  const [isSleeping, setIsSleeping] = useState(false);

  // ==========================================================
  // INITIAL MESSAGE
  // ==========================================================

  const getInitialMessage = useCallback(() => {
    const themeText = theme === 'dark' ? '🌙 Dark mode is active' : '☀️ Light mode is active';
    
    if (userRole === "admin") {
      return {
        id: 1,
        type: "bot",
        text: `👑 Welcome, ${user?.name || "Admin"}! 🚀

I'm your admin assistant.

I can help you:
- 📊 View platform analytics
- 👥 Manage users and companies
- 📋 Generate reports
- 🛡️ Moderate content
- 🔍 Find jobs by category
- 🌓 Switch theme (say "dark mode" or "light mode")

${themeText}

What would you like to manage today?`,
        timestamp: new Date(),
      };
    }

    if (userRole === "seeker") {
      return {
        id: 1,
        type: "bot",
        text: `👋 Welcome back, ${user?.name || "Job Seeker"}! 🎉

I'm your career assistant.

I can help you:
- 🔍 Find your dream job
- 📝 Apply to positions
- 📊 Track applications
- 💡 Get career advice
- 🔎 Search jobs by category
- 🌓 Switch theme (say "dark mode" or "light mode")

${themeText}

Try:
"Show me education jobs"
"Find marketing jobs"
"Give me sales jobs"`,
        timestamp: new Date(),
      };
    }

    if (userRole === "recruiter") {
      return {
        id: 1,
        type: "bot",
        text: `👋 Welcome, ${user?.name || "Recruiter"}! 🏢

I'm your hiring assistant.

I can help you:
- 📢 Post job openings
- 👥 Find top talent
- 📊 Review applications
- 🤝 Manage hiring
- 🔍 Search candidates by skills
- 🌓 Switch theme (say "dark mode" or "light mode")

${themeText}`,
        timestamp: new Date(),
      };
    }

    return {
      id: 1,
      type: "bot",
      text: `👋 Welcome to HireLoop! 🚀

I'm your AI assistant.

I can help you:
- 🌟 Explore job opportunities
- 📝 Learn how to apply
- 💼 Discover recruiter features
- 🔑 Get started with an account
- 🔎 Find jobs by category
- 🌓 Switch theme (say "dark mode" or "light mode")

${themeText}

Try:
"Show me education jobs"
"Find marketing jobs"
"Give me sales jobs"`,
      timestamp: new Date(),
    };
  }, [userRole, user, theme]);

  // ==========================================================
  // LOAD CHAT - No storage, always starts fresh
  // ==========================================================

  useEffect(() => {
    setIsMounted(true);
    // Always start with fresh initial message
    setMessages([getInitialMessage()]);
  }, [getInitialMessage]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        // Scroll to bottom when opened
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isMinimized]);

  useEffect(() => {
    if (pokeSpeech) {
      setBlobMood("angry");
      return;
    }
    if (isTyping) {
      setBlobMood("hmm");
      return;
    }
    if (isSleeping) {
      setBlobMood("neutral");
      return;
    }
    if (messages.length > 5) {
      setBlobMood("happy");
      return;
    }
    setBlobMood("neutral");
  }, [isTyping, messages.length, isSleeping, pokeSpeech]);

  useEffect(() => {
    const handleMouseMove = (event) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 30;
      const y = (event.clientY / window.innerHeight - 0.5) * 20;
      setBlobGaze({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // ==========================================================
  // FIND RESPONSE - Added theme switching
  // ==========================================================

  const findBestResponse = useCallback(
    (query) => {
      const lowerQuery = normalizeText(query);

      // ✅ THEME SWITCHING COMMANDS
      if (lowerQuery.includes("dark mode") || lowerQuery.includes("dark theme")) {
        setTheme("dark");
        return {
          response: "🌙 Switched to **Dark Mode**! The interface is now darker and easier on the eyes. 💙",
          action: null,
        };
      }

      if (lowerQuery.includes("light mode") || lowerQuery.includes("light theme")) {
        setTheme("light");
        return {
          response: "☀️ Switched to **Light Mode**! Everything is now bright and clean. ✨",
          action: null,
        };
      }

      // ✅ JOB CATEGORY FIRST (specific category match)
      const jobCommand = handleJobCategoryCommand(query);

      if (jobCommand) {
        const displayCategory =
          jobCommand.displayTerm ||
          CATEGORY_DISPLAY_NAMES[jobCommand.category];

        const action = `/browse-jobs?category=${encodeURIComponent(
          displayCategory
        )}`;

        return {
          response: `🔍 I'll find ${displayCategory} jobs for you!

Redirecting you to browse jobs with the "${displayCategory}" category filter...`,
          action,
          isJobSearch: true,
          category: displayCategory,
        };
      }

      // ✅ ROLE RESPONSE
      const roleResponse = getRoleBasedResponses(userRole, query, user);
      if (roleResponse) return roleResponse;

      // ✅ FAQ
      for (const [key, value] of Object.entries(FAQ_RESPONSES)) {
        if (lowerQuery.includes(key)) return value;
      }

      // ✅ KEYWORDS
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
        if (lowerQuery.includes(word)) return FAQ_RESPONSES[key];
      }

      // ✅ GENERIC JOB / CATEGORY REQUEST
      if (GENERIC_JOBS_REGEX.test(lowerQuery)) {
        return {
          response:
            "🔍 Sure! Which category are you interested in? Tap one below, or just type it:",
          action: null,
          showCategories: true,
        };
      }

      return FAQ_RESPONSES.default;
    },
    [userRole, user, setTheme]
  );

  // ==========================================================
  // WAKE UP
  // ==========================================================

  const wakeUp = useCallback(() => {
    setIsSleeping(false);
    clearTimeout(autoMessageTimeoutRef.current);
    clearTimeout(sleepTimeoutRef.current);
    clearTimeout(speechHideTimeoutRef.current);
    setAutoSpeech(null);
    autoMessageIndexRef.current = 0;
  }, []);

  // ==========================================================
  // HANDLE SEND
  // ==========================================================

  const processMessage = useCallback(
    (messageText) => {
      if (!messageText.trim() || isTyping) return;

      if (isSleeping) wakeUp();

      const userMessage = {
        id: Date.now(),
        type: "user",
        text: messageText.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsTyping(true);
      setBlobMood("hmm");

      const delay = 800 + Math.random() * 800;

      setTimeout(() => {
        const response = findBestResponse(messageText);

        const botMessage = {
          id: Date.now() + 1,
          type: "bot",
          text: response.response,
          timestamp: new Date(),
          action: response.action,
          isJobSearch: response.isJobSearch || false,
          showCategories: response.showCategories || false,
        };

        setMessages((prev) => [...prev, botMessage]);
        setIsTyping(false);
        setBlobMood("happy");

        // Scroll to bottom after new message
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);

        if (response.isJobSearch && response.action) {
          setTimeout(() => {
            setIsOpen(false);
            router.push(response.action);
          }, 1800);
        }
      }, delay);
    },
    [isTyping, isSleeping, wakeUp, findBestResponse, router]
  );

  const handleSendMessage = () => {
    processMessage(input);
  };

  const handleSuggestionClick = (suggestion) => {
    processMessage(suggestion);
  };

  const handleActionClick = (path) => {
    setIsOpen(false);
    router.push(path);
  };

  // ==========================================================
  // POKE
  // ==========================================================

  const handleOverpoke = useCallback(() => {
    if (isSleeping) wakeUp();

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
  }, [isSleeping, wakeUp]);

  useEffect(() => {
    return () => {
      clearTimeout(pokeSpeechTimeoutRef.current);
      clearTimeout(pokeMoodResetTimeoutRef.current);
    };
  }, []);

  // ==========================================================
  // AUTO MESSAGE
  // ==========================================================

  const goToSleep = useCallback(() => {
    if (isOpen) return;

    clearTimeout(autoMessageTimeoutRef.current);

    setIsSleeping(true);
    setAutoSpeech(SLEEP_MESSAGE);

    clearTimeout(speechHideTimeoutRef.current);
    speechHideTimeoutRef.current = setTimeout(() => {
      setAutoSpeech(null);
    }, SPEECH_VISIBLE_MS);
  }, [isOpen]);

  const showNextAutoMessage = useCallback(() => {
    if (isOpen || isSleeping) return;

    const message =
      AUTO_MESSAGES[autoMessageIndexRef.current % AUTO_MESSAGES.length];
    autoMessageIndexRef.current += 1;

    setAutoSpeech(message);
    setBlobMood("happy");

    clearTimeout(speechHideTimeoutRef.current);
    speechHideTimeoutRef.current = setTimeout(() => {
      setAutoSpeech(null);
      setBlobMood("neutral");

      autoMessageTimeoutRef.current = setTimeout(() => {
        showNextAutoMessage();
      }, AUTO_MESSAGE_INTERVAL_MS);
    }, SPEECH_VISIBLE_MS);
  }, [isOpen, isSleeping]);

  const startIdleTimer = useCallback(() => {
    clearTimeout(autoMessageTimeoutRef.current);
    clearTimeout(sleepTimeoutRef.current);
    clearTimeout(speechHideTimeoutRef.current);

    setAutoSpeech(null);
    setIsSleeping(false);
    autoMessageIndexRef.current = 0;

    if (isOpen) return;

    autoMessageTimeoutRef.current = setTimeout(() => {
      showNextAutoMessage();
    }, IDLE_DELAY_MS);

    sleepTimeoutRef.current = setTimeout(() => {
      goToSleep();
    }, SLEEP_AFTER_MS);
  }, [isOpen, showNextAutoMessage, goToSleep]);

  useEffect(() => {
    if (isOpen) {
      clearTimeout(autoMessageTimeoutRef.current);
      clearTimeout(sleepTimeoutRef.current);
      clearTimeout(speechHideTimeoutRef.current);
      setAutoSpeech(null);
      setIsSleeping(false);
      autoMessageIndexRef.current = 0;
      return;
    }

    startIdleTimer();

    return () => {
      clearTimeout(autoMessageTimeoutRef.current);
      clearTimeout(sleepTimeoutRef.current);
      clearTimeout(speechHideTimeoutRef.current);
    };
  }, [isOpen, startIdleTimer]);

  const getSpeechText = () => {
    if (pokeSpeech) return pokeSpeech;
    if (autoSpeech) return autoSpeech;
    return null;
  };

  const getSpeechMood = () => {
    if (pokeSpeech) return "angry";
    if (autoSpeech) return "happy";
    return null;
  };

  if (!isMounted) return null;

  return (
    <>
      {/* ====================================================
          FLOATING BUTTON
      ==================================================== */}

      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="relative">
            <div className="absolute inset-[-8px] rounded-full bg-gradient-to-r from-blue-500/30 to-purple-500/30 blur-xl animate-pulse" />

            <button
              type="button"
              onClick={() => {
                if (isSleeping) {
                  wakeUp();
                  startIdleTimer();
                  return;
                }
                setIsOpen(true);
              }}
              className="relative cursor-pointer hover:scale-105 transition-transform duration-300"
              aria-label={
                isSleeping ? "Wake up assistant" : "Open AI assistant"
              }
            >
              <div className="relative w-16 h-16 md:w-20 md:h-20">
                <BlobWrapper
                  mood={isSleeping ? "neutral" : blobMood}
                  gaze={blobGaze}
                  size={80}
                  themeColors={botTheme}
                  onOverpoke={handleOverpoke}
                  speechText={getSpeechText()}
                  speechMood={getSpeechMood()}
                  speechAlign="right"
                />
              </div>
            </button>
          </div>
        </div>
      )}

      {/* ====================================================
          CHAT WINDOW
      ==================================================== */}

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
            className={`fixed bottom-6 right-6 z-50 bg-white dark:bg-[#121214] border border-zinc-200/50 dark:border-zinc-800 rounded-2xl shadow-2xl shadow-blue-500/10 ${
              isMinimized
                ? "p-4 overflow-visible"
                : "flex flex-col overflow-visible"
            }`}
          >
            <div className="relative overflow-visible flex items-center justify-between p-4 border-b border-zinc-200/50 dark:border-zinc-800 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 shrink-0 ml-1 overflow-visible">
                  <BlobWrapper
                    mood={blobMood}
                    gaze={blobGaze}
                    size={40}
                    themeColors={botTheme}
                    onOverpoke={handleOverpoke}
                    speechText={pokeSpeech}
                    speechMood="angry"
                    speechAlign="left"
                  />
                </div>

                <div>
                  <h3 className="text-zinc-900 dark:text-white font-semibold text-sm flex items-center gap-1">
                    HireSync
                    <Sparkles className="w-3 h-3 text-yellow-400" />
                  </h3>

                  <p className="text-xs text-zinc-500">
                    {isTyping
                      ? "Thinking..."
                      : isSleeping
                      ? "💤 Sleeping..."
                      : "Online • Ready to help"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                  aria-label={isMinimized ? "Maximize" : "Minimize"}
                >
                  {isMinimized ? (
                    <Maximize2 className="w-4 h-4" />
                  ) : (
                    <Minimize2 className="w-4 h-4" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setIsMinimized(false);
                    autoMessageIndexRef.current = 0;

                    setTimeout(() => {
                      startIdleTimer();
                    }, 300);
                  }}
                  className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                  aria-label="Close assistant"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto overflow-x-visible p-4 space-y-3 bg-zinc-50/80 dark:bg-gradient-to-b dark:from-[#0d0d0e] dark:to-[#121214]">
                  {messages.map((message) => (
                    <React.Fragment key={message.id}>
                      <MessageWithAvatar
                        message={message.text}
                        isUser={message.type === "user"}
                        user={user}
                        botMood={blobMood}
                        botGaze={blobGaze}
                        timestamp={message.timestamp}
                        onActionClick={handleActionClick}
                        showRole={true}
                      />

                      {/* CATEGORY SUGGESTION CHIPS */}
                      {message.type === "bot" && message.showCategories && (
                        <div className="flex flex-wrap gap-2 pl-10 -mt-1">
                          {Object.entries(CATEGORY_DISPLAY_NAMES).map(
                            ([key, label]) => (
                              <button
                                key={key}
                                type="button"
                                onClick={() =>
                                  handleSuggestionClick(
                                    `Show me ${label} jobs`
                                  )
                                }
                                className="suggestion-button"
                              >
                                <Compass className="w-3 h-3 text-blue-400" />
                                {label}
                              </button>
                            )
                          )}
                        </div>
                      )}
                    </React.Fragment>
                  ))}

                  {isTyping && (
                    <div className="flex justify-start gap-2">
                      <div className="relative w-8 h-8 shrink-0">
                        <BlobWrapper
                          mood="hmm"
                          gaze={blobGaze}
                          size={32}
                          themeColors={botTheme}
                        />
                      </div>

                      <div className="bg-zinc-200 dark:bg-zinc-800/50 border border-zinc-300/50 dark:border-zinc-700/50 rounded-2xl p-3">
                        <div className="flex gap-1">
                          <span
                            className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0ms" }}
                          />
                          <span
                            className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                            style={{ animationDelay: "200ms" }}
                          />
                          <span
                            className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"
                            style={{ animationDelay: "400ms" }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {messages.length <= 3 && (
                  <div className="px-4 pb-2 flex flex-wrap gap-2 max-h-28 overflow-y-auto">
                    {userRole === "admin" && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleSuggestionClick("Analytics")}
                          className="suggestion-button"
                        >
                          <BarChart className="w-3 h-3 text-purple-400" />
                          Analytics
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleSuggestionClick("Manage users")
                          }
                          className="suggestion-button"
                        >
                          <UsersRound className="w-3 h-3 text-blue-400" />
                          Manage Users
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSuggestionClick("Reports")}
                          className="suggestion-button"
                        >
                          <FileText className="w-3 h-3 text-green-400" />
                          Reports
                        </button>
                      </>
                    )}

                    {userRole === "seeker" && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleSuggestionClick("Find jobs")}
                          className="suggestion-button"
                        >
                          <Search className="w-3 h-3 text-blue-400" />
                          Find jobs
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleSuggestionClick("How to apply?")
                          }
                          className="suggestion-button"
                        >
                          <FileText className="w-3 h-3 text-green-400" />
                          How to apply?
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleSuggestionClick("Show me design jobs")
                          }
                          className="suggestion-button"
                        >
                          <Compass className="w-3 h-3 text-cyan-400" />
                          Design
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleSuggestionClick("Find technology jobs")
                          }
                          className="suggestion-button"
                        >
                          <Compass className="w-3 h-3 text-purple-400" />
                          Technology
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleSuggestionClick("Find marketing jobs")
                          }
                          className="suggestion-button"
                        >
                          <Compass className="w-3 h-3 text-pink-400" />
                          Marketing
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleSuggestionClick("Show me sales jobs")
                          }
                          className="suggestion-button"
                        >
                          <Compass className="w-3 h-3 text-yellow-400" />
                          Sales
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleSuggestionClick(
                              "Show me human resources jobs"
                            )
                          }
                          className="suggestion-button"
                        >
                          <Users className="w-3 h-3 text-green-400" />
                          HR
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleSuggestionClick("Show me education jobs")
                          }
                          className="suggestion-button"
                        >
                          <Compass className="w-3 h-3 text-blue-400" />
                          Education
                        </button>
                      </>
                    )}

                    {userRole === "recruiter" && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleSuggestionClick("Post a job")}
                          className="suggestion-button"
                        >
                          <Briefcase className="w-3 h-3 text-purple-400" />
                          Post a job
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleSuggestionClick("Find talent")
                          }
                          className="suggestion-button"
                        >
                          <Users className="w-3 h-3 text-green-400" />
                          Find talent
                        </button>
                      </>
                    )}

                    {!user && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleSuggestionClick("Benefits")}
                          className="suggestion-button"
                        >
                          <Star className="w-3 h-3 text-yellow-400" />
                          Benefits
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleSuggestionClick("Create account")
                          }
                          className="suggestion-button"
                        >
                          <User className="w-3 h-3 text-blue-400" />
                          Sign up
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      onClick={() => handleSuggestionClick("Help")}
                      className="suggestion-button"
                    >
                      <HelpCircle className="w-3 h-3 text-red-400" />
                      Help
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSuggestionClick("Dark mode")}
                      className="suggestion-button"
                    >
                      <Moon className="w-3 h-3 text-purple-400" />
                      Dark Mode
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSuggestionClick("Light mode")}
                      className="suggestion-button"
                    >
                      <Sun className="w-3 h-3 text-yellow-400" />
                      Light Mode
                    </button>
                  </div>
                )}

                <div className="p-4 border-t border-zinc-200/50 dark:border-zinc-800 bg-zinc-50/80 dark:bg-[#0d0d0e] rounded-b-2xl">
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex gap-2"
                  >
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                      placeholder={
                        isSleeping
                          ? "💤 Wake me up by typing..."
                          : "Ask me or search jobs..."
                      }
                      className="flex-1 min-w-0 bg-white dark:bg-zinc-800/50 border border-zinc-300/50 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none focus:border-blue-500/50 transition-colors text-sm"
                    />

                    <button
                      type="submit"
                      disabled={!input.trim() || isTyping}
                      className="shrink-0 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl px-4 py-2.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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

      <style jsx>{`
        .suggestion-button {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.375rem 0.75rem;
          background: rgba(39, 39, 42, 0.3);
          color: rgb(212, 212, 216);
          font-size: 0.75rem;
          line-height: 1rem;
          border-radius: 9999px;
          border: 1px solid rgba(63, 63, 70, 0.3);
          transition: all 150ms ease;
          cursor: pointer;
        }

        .suggestion-button:hover {
          background: rgba(63, 63, 70, 0.4);
          color: white;
        }

        .dark .suggestion-button {
          background: rgba(39, 39, 42, 0.5);
          border-color: rgba(63, 63, 70, 0.5);
        }

        .dark .suggestion-button:hover {
          background: rgba(63, 63, 70, 0.6);
        }

        .light .suggestion-button {
          background: rgba(220, 220, 225, 0.5);
          border-color: rgba(200, 200, 205, 0.5);
          color: rgb(50, 50, 55);
        }

        .light .suggestion-button:hover {
          background: rgba(200, 200, 205, 0.6);
          color: rgb(20, 20, 25);
        }
      `}</style>
    </>
  );
};

export default AIAssistant;