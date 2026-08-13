"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Bot, Sparkles } from "lucide-react";

const AIAssistantFloatingButton = ({ onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full p-4 shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 group"
    >
      <div className="relative">
        <Bot className="w-6 h-6" />
        <motion.div
          className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-900"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-[#121214] border border-zinc-800 rounded-lg px-3 py-1.5 whitespace-nowrap"
          >
            <span className="text-white text-xs flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-yellow-400" />
              Ask HireSync
            </span>
          </motion.div>
        )}
      </div>
    </motion.button>
  );
};

export default AIAssistantFloatingButton;