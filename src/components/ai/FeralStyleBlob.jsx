"use client";

import React, { useState, useEffect } from "react";

/**
 * Feral Blob Avatar - Exact replica of feral-blob but pure CSS!
 * No Framer Motion, no animation errors!
 * 
 * Features (identical to feral-blob):
 * - Cute blob character with arms
 * - Moods: neutral, happy, sad, angry, hmm, sideEye, excited
 * - Eyes follow cursor (gaze tracking)
 * - Poke interaction with messages
 * - Pulsing rings
 * - Status indicator
 * - Theme colors (default, violet, mint, coral, gold)
 * - Lightweight and performant
 */
const FeralBlobAvatar = ({ 
  mood = "neutral", 
  size = 80, 
  onPoke,
  showStatus = true,
  className = "",
  theme = "default", // default | violet | mint | coral | gold
  pokeMessages = [],
  gaze = { x: 0, y: 0 }
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isPoked, setIsPoked] = useState(false);
  const [currentMood, setCurrentMood] = useState(mood);
  const [showBubble, setShowBubble] = useState(false);
  const [bubbleMessage, setBubbleMessage] = useState("");

  // Default poke messages (like feral-blob)
  const defaultMessages = [
    "👋 Hey there!",
    "😄 That tickles!",
    "🤭 Stop it!",
    "😊 Hi!",
    "✨ Poke me again!",
    "🙈 Oops!",
    "💕 I like you!",
    "🤗 Hug me!",
    "😏 What's up?",
    "🎉 You're awesome!",
  ];

  const messages = pokeMessages.length > 0 ? pokeMessages : defaultMessages;

  useEffect(() => {
    setCurrentMood(mood);
  }, [mood]);

  // Gaze tracking - follows mouse like feral-blob
  useEffect(() => {
    const handleMouseMove = (e) => {
      const blob = document.getElementById('feral-avatar');
      if (blob) {
        const rect = blob.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / 15;
        const y = (e.clientY - rect.top - rect.height / 2) / 15;
        setMousePosition({ x, y });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Theme colors (matches feral-blob's CSS custom properties)
  const getThemeColors = () => {
    const themes = {
      default: {
        body: 'from-blue-400 to-purple-500',
        ring: 'border-blue-400/30',
        status: 'bg-green-400',
        shadow: 'shadow-blue-500/20',
        bubbleBg: 'from-blue-500/20 to-purple-500/20',
        bubbleBorder: 'border-blue-400/30'
      },
      violet: {
        body: 'from-violet-400 to-purple-600',
        ring: 'border-violet-400/30',
        status: 'bg-violet-400',
        shadow: 'shadow-violet-500/20',
        bubbleBg: 'from-violet-500/20 to-purple-500/20',
        bubbleBorder: 'border-violet-400/30'
      },
      mint: {
        body: 'from-emerald-300 to-teal-500',
        ring: 'border-emerald-400/30',
        status: 'bg-emerald-400',
        shadow: 'shadow-emerald-500/20',
        bubbleBg: 'from-emerald-500/20 to-teal-500/20',
        bubbleBorder: 'border-emerald-400/30'
      },
      coral: {
        body: 'from-rose-400 to-orange-500',
        ring: 'border-rose-400/30',
        status: 'bg-rose-400',
        shadow: 'shadow-rose-500/20',
        bubbleBg: 'from-rose-500/20 to-orange-500/20',
        bubbleBorder: 'border-rose-400/30'
      },
      gold: {
        body: 'from-amber-400 to-yellow-600',
        ring: 'border-amber-400/30',
        status: 'bg-amber-400',
        shadow: 'shadow-amber-500/20',
        bubbleBg: 'from-amber-500/20 to-yellow-500/20',
        bubbleBorder: 'border-amber-400/30'
      }
    };
    return themes[theme] || themes.default;
  };

  // Mood-based expressions (matches feral-blob)
  const getExpression = () => {
    switch(currentMood) {
      case 'happy': return {
        eyes: '◕‿◕',
        mouth: '◡',
        blush: '💕',
        armPosition: 'wave'
      };
      case 'sad': return {
        eyes: '◕﹏◕',
        mouth: '︵',
        blush: '',
        armPosition: 'down'
      };
      case 'angry': return {
        eyes: 'ಠ_ಠ',
        mouth: '︶',
        blush: '💢',
        armPosition: 'cross'
      };
      case 'excited': return {
        eyes: '✧‿✧',
        mouth: '◡',
        blush: '✨',
        armPosition: 'up'
      };
      case 'hmm': return {
        eyes: '◕‿◕',
        mouth: '•ᴗ•',
        blush: '',
        armPosition: 'chin'
      };
      case 'sideEye': return {
        eyes: '◔_◔',
        mouth: '◡',
        blush: '',
        armPosition: 'hip'
      };
      case 'password': return {
        eyes: '●‿●',
        mouth: '◡',
        blush: '',
        armPosition: 'wave'
      };
      default: return {
        eyes: '◕‿◕',
        mouth: '◡',
        blush: '',
        armPosition: 'neutral'
      };
    }
  };

  const colors = getThemeColors();
  const expression = getExpression();
  const blobSize = size || 80;

  // Handle poke interaction
  const handlePoke = () => {
    setIsPoked(true);
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setBubbleMessage(randomMessage);
    setShowBubble(true);
    
    // Random mood change on poke
    const moods = ['happy', 'excited', 'hmm', 'sideEye', 'neutral'];
    const randomMood = moods[Math.floor(Math.random() * moods.length)];
    setCurrentMood(randomMood);
    
    if (onPoke) {
      onPoke(randomMessage);
    }
    
    setTimeout(() => {
      setShowBubble(false);
      setIsPoked(false);
      if (!onPoke) {
        setCurrentMood('neutral');
      }
    }, 2000);
  };

  // Arm positions
  const getArmStyle = () => {
    switch(expression.armPosition) {
      case 'wave':
        return {
          transform: `rotate(${isPoked ? -30 : -15}deg)`,
          animation: 'armWave 1s ease-in-out infinite'
        };
      case 'up':
        return {
          transform: `rotate(${isPoked ? -45 : -25}deg)`,
          animation: 'armRaise 0.5s ease-in-out infinite alternate'
        };
      case 'chin':
        return {
          transform: 'rotate(-10deg) scale(0.9)',
        };
      case 'hip':
        return {
          transform: 'rotate(20deg)',
        };
      case 'cross':
        return {
          transform: `rotate(${isPoked ? 30 : 15}deg)`,
        };
      default:
        return {
          transform: `rotate(${isPoked ? -10 : 0}deg)`,
        };
    }
  };

  return (
    <div 
      id="feral-avatar"
      className={`relative flex-shrink-0 cursor-pointer ${className}`}
      style={{ 
        width: blobSize, 
        height: blobSize,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handlePoke}
    >
      {/* Outer glow */}
      <div className={`absolute inset-[-12px] rounded-full bg-gradient-to-r ${colors.body} opacity-20 blur-xl transition-opacity duration-300 ${
        isHovered ? 'opacity-50' : 'opacity-20'
      }`} />

      {/* Speech Bubble - at bottom */}
      {showBubble && (
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 z-20 animate-bubble-pop">
          <div className={`relative bg-gradient-to-r ${colors.bubbleBg} backdrop-blur-sm border ${colors.bubbleBorder} rounded-2xl px-4 py-2 shadow-xl whitespace-nowrap`}>
            <p className="text-white text-xs font-medium">
              {bubbleMessage}
            </p>
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-white/20" />
          </div>
        </div>
      )}

      {/* Main Blob - morphing shape like feral-blob */}
      <div
        className={`absolute inset-0 rounded-full bg-gradient-to-br ${colors.body} animate-blob-morph`}
        style={{
          transform: `translate(${mousePosition.x * 0.3}px, ${mousePosition.y * 0.3}px) scale(${isPoked ? 0.85 : isHovered ? 1.05 : 1})`,
          boxShadow: `inset 0 -20px 60px rgba(0,0,0,0.15), 0 10px 40px rgba(0,0,0,0.2)`,
          transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        {/* Inner highlight */}
        <div className="absolute inset-[15%] rounded-full bg-white/10 blur-sm" />
        
        {/* Arms - like feral-blob */}
        <div className="absolute -left-2 -top-2 w-6 h-6">
          <div 
            className="w-full h-full rounded-full bg-gradient-to-br from-white/20 to-transparent"
            style={getArmStyle()}
          />
        </div>
        <div className="absolute -right-2 -top-2 w-6 h-6">
          <div 
            className="w-full h-full rounded-full bg-gradient-to-br from-white/20 to-transparent"
            style={{...getArmStyle(), transform: `scaleX(-1) ${getArmStyle().transform}`}}
          />
        </div>

        {/* Eyes - gaze tracking like feral-blob */}
        <div className="flex gap-3 z-10" style={{ fontSize: blobSize > 60 ? '20px' : '14px' }}>
          <span 
            className="transition-all duration-300"
            style={{
              transform: `translate(${mousePosition.x * 0.3}px, ${mousePosition.y * 0.3}px)`
            }}
          >
            {expression.eyes.split('')[0]}
          </span>
          <span 
            className="transition-all duration-300"
            style={{
              transform: `translate(${mousePosition.x * 0.3}px, ${mousePosition.y * 0.3}px)`
            }}
          >
            {expression.eyes.split('')[2] || expression.eyes[2] || '◕'}
          </span>
        </div>
        
        {/* Mouth */}
        <div className="z-10 mt-0.5" style={{ fontSize: blobSize > 60 ? '16px' : '12px' }}>
          {expression.mouth}
        </div>

        {/* Blush / Sparkle accent */}
        {expression.blush && (
          <div className="absolute -top-2 -right-1 text-lg animate-pulse">
            {expression.blush}
          </div>
        )}
      </div>

      {/* Pulsing Rings - like feral-blob */}
      <div className={`absolute inset-[-6px] rounded-full border-2 ${colors.ring} animate-ring-pulse`} />
      <div className={`absolute inset-[-12px] rounded-full border-2 ${colors.ring} animate-ring-pulse-delayed`} />
      <div className={`absolute inset-[-18px] rounded-full border border-white/5 ${colors.ring} animate-ring-pulse-slow`} />

      {/* Status dot */}
      {showStatus && (
        <div
          className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#121214] ${colors.status} animate-status-pulse shadow-lg ${colors.shadow}`}
        />
      )}

      {/* Poke hint */}
      {isHovered && !showBubble && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-xl whitespace-nowrap border border-white/10 animate-fade-in">
          👆 Poke me!
        </div>
      )}

      {/* CSS Keyframes - Pure CSS animations, NO Framer Motion! */}
      <style jsx>{`
        @keyframes blobMorph {
          0% {
            border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
          }
          25% {
            border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
          }
          50% {
            border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
          }
          75% {
            border-radius: 50% 30% 60% 70% / 60% 40% 70% 30%;
          }
          100% {
            border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
          }
        }
        .animate-blob-morph {
          animation: blobMorph 5s ease-in-out infinite;
        }

        @keyframes ringPulse {
          0% {
            transform: scale(1);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.2);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 0.5;
          }
        }
        .animate-ring-pulse {
          animation: ringPulse 2s ease-in-out infinite;
        }
        .animate-ring-pulse-delayed {
          animation: ringPulse 3s ease-in-out infinite 0.5s;
        }
        .animate-ring-pulse-slow {
          animation: ringPulse 4s ease-in-out infinite 1s;
        }

        @keyframes statusPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.3);
            opacity: 0.8;
          }
        }
        .animate-status-pulse {
          animation: statusPulse 2s ease-in-out infinite;
        }

        @keyframes armWave {
          0%, 100% {
            transform: rotate(-15deg);
          }
          50% {
            transform: rotate(-30deg);
          }
        }

        @keyframes armRaise {
          0% {
            transform: rotate(-25deg);
          }
          100% {
            transform: rotate(-45deg);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(-50%) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) scale(1);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out forwards;
        }

        @keyframes bubblePop {
          0% {
            opacity: 0;
            transform: translateX(-50%) scale(0.5) translateY(-10px);
          }
          50% {
            transform: translateX(-50%) scale(1.1) translateY(5px);
          }
          100% {
            opacity: 1;
            transform: translateX(-50%) scale(1) translateY(0);
          }
        }
        .animate-bubble-pop {
          animation: bubblePop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default FeralBlobAvatar;