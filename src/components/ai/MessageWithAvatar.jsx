"use client";

import React from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import Image from "next/image";
import BlobWrapper from "./BlobWrapper";

const BOT_ROLE_THEMES = {
  admin: { role: 'admin', label: 'Admin' },
  recruiter: { role: 'recruiter', label: 'Recruiter' },
  seeker: { role: 'seeker', label: 'Seeker' },
  guest: { role: 'guest', label: 'Guest' }
};

const getBotTheme = (role) => {
  return BOT_ROLE_THEMES[role] || BOT_ROLE_THEMES.guest;
};

const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const UserAvatar = ({ user, size = 32 }) => {
  const hasImage = user?.image && user.image !== '';
  const initials = getInitials(user?.name);

  return (
    <div className="relative flex-shrink-0">
      <div 
        className="rounded-full overflow-hidden border-2 border-white/10"
        style={{ width: size, height: size }}
      >
        {hasImage ? (
          <Image
            src={user.image}
            alt={user?.name || 'User'}
            width={size}
            height={size}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-700">
            <span className="text-white font-semibold" style={{ fontSize: size * 0.4 }}>
              {initials}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const BotAvatar = ({ 
  mood = "neutral", 
  gaze = { x: 0, y: 0 }, 
  size = 32,
  userRole = "guest"
}) => {
  const theme = getBotTheme(userRole);
  
  return (
    <div className="relative flex-shrink-0">
      <div style={{ width: size, height: size }}>
        <BlobWrapper
          mood={mood}
          gaze={gaze}
          size={size}
          themeColors={theme}
        />
      </div>
    </div>
  );
};

const MessageWithAvatar = ({ 
  message, 
  isUser = false, 
  user = null, 
  botMood = "neutral",
  botGaze = { x: 0, y: 0 },
  onActionClick,
  timestamp,
  showRole = false
}) => {
  const role = user?.role || 'guest';

  const formatTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} gap-2 items-end`}
    >
      {/* Bot Avatar - Left side */}
      {!isUser && (
        <div className="flex-shrink-0 self-end pb-1">
          <BotAvatar 
            mood={botMood} 
            gaze={botGaze}
            size={28}
            userRole={role}
          />
        </div>
      )}

      {/* Message Bubble */}
      <div className={`max-w-[75%] ${isUser ? "order-1" : ""}`}>
        <div
          className={`rounded-2xl p-3 ${
            isUser
              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
              : "bg-zinc-800/50 border border-zinc-700/50 text-zinc-200"
          }`}
        >
          <div className="text-sm whitespace-pre-wrap leading-relaxed">
            {message}
          </div>
          
          {!isUser && message.action && (
            <button
              onClick={() => onActionClick?.(message.action)}
              className="mt-2 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
            >
              <Zap className="w-3 h-3" /> Go There
            </button>
          )}
          
          {/* Timestamp - color depends on bubble background so it
              stays readable: light/translucent white on the user's
              blue-purple gradient, muted zinc on the bot's dark bubble. */}
          <p
            className={`text-[10px] mt-1.5 text-right ${
              isUser ? "text-white/70" : "text-zinc-500"
            }`}
          >
            {formatTime(timestamp)}
          </p>
        </div>
      </div>

      {/* User Avatar - Right side */}
      {isUser && (
        <div className="flex-shrink-0 self-end pb-1">
          <UserAvatar user={user} size={28} />
        </div>
      )}
    </motion.div>
  );
};

export { MessageWithAvatar, UserAvatar, BotAvatar, getBotTheme, BOT_ROLE_THEMES };