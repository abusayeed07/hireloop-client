"use client";

import React from "react";
import { MotionConfig, AnimatePresence, motion } from "framer-motion";
import { JellyBlobMascot, BlobSpeech } from 'feral-blob';
import 'feral-blob/blob.css';

/**
 * Role -> palette. Only body / outline / arm / belly-glow vars are
 * overridden — cheeks and eyes are left on feral-blob's defaults (pink
 * cheeks, dark eyes) so every skin matches the reference swatches, which
 * keep the same face across all four colors and only change the body.
 *
 * "guest" (Violet) is feral-blob's own built-in default palette (defined in
 * blob.css's :root), so it needs no overrides at all — passing an empty
 * object leaves it exactly as-is.
 */
const ROLE_PALETTES = {
  guest: {},
  seeker: {
    // Mint / green
    '--jelly-body-top': '#baffdf',
    '--jelly-body-mid': '#37cf93',
    '--jelly-body-deep': '#1fa876',
    '--jelly-body-rim': '#6de0ae',
    '--jelly-outline': '#178f61',
    '--jelly-outline-light': '#34b884',
    '--jelly-arm-light': '#a3f5cd',
    '--jelly-arm-mid': '#4bd39c',
    '--jelly-arm-deep': '#22a878',
    '--jelly-belly-glow': '#a8ffdb',
  },
  recruiter: {
    // Coral / red
    '--jelly-body-top': '#ffd0c2',
    '--jelly-body-mid': '#f2705a',
    '--jelly-body-deep': '#d94f3c',
    '--jelly-body-rim': '#f28b74',
    '--jelly-outline': '#c94430',
    '--jelly-outline-light': '#e8624a',
    '--jelly-arm-light': '#ffb8a3',
    '--jelly-arm-mid': '#f2836a',
    '--jelly-arm-deep': '#d9583f',
    '--jelly-belly-glow': '#ffb8a8',
  },
  admin: {
    // Gold
    '--jelly-body-top': '#ffe9a8',
    '--jelly-body-mid': '#f2b93f',
    '--jelly-body-deep': '#d99a1f',
    '--jelly-body-rim': '#f5c96a',
    '--jelly-outline': '#c98816',
    '--jelly-outline-light': '#e8a92f',
    '--jelly-arm-light': '#ffe08a',
    '--jelly-arm-mid': '#f2c15a',
    '--jelly-arm-deep': '#d99a2e',
    '--jelly-belly-glow': '#ffe6a0',
  },
};

/**
 * Feral Blob Wrapper - fixes the "only two keyframes" error, re-skins the
 * mascot per user role, and shows a BlobSpeech cloud ABOVE the mascot.
 *
 * NOTE: feral-blob's BlobSpeech bubble is designed with its tail pointing
 * DOWN by default (i.e. meant to sit above a character). We position the
 * bubble above the blob and rely on that default orientation directly —
 * no flip transform needed.
 */
const BlobWrapper = ({
  mood = "neutral",
  gaze = { x: 0, y: 0 },
  size = 80,
  onOverpoke,
  className = "",
  themeColors = null,
  speechText = null,
  speechMood = null,
}) => {
  const role = themeColors?.role || 'guest';
  const cssVars = ROLE_PALETTES[role] || ROLE_PALETTES.guest;
  const resolvedSpeechMood = speechMood || mood;

  // Only show speech if there's text
  const showSpeech = speechText && speechText.length > 0;

  return (
    <MotionConfig
      transition={{
        type: "keyframes",
        duration: 0.5,
        ease: "easeInOut"
      }}
      reducedMotion="user"
    >
      <div
        className={`relative ${className}`}
        style={{
          width: size,
          height: size,
          ...cssVars
        }}
      >
        {/* Speech Bubble - positioned ABOVE the blob. The default bubble
            shape already points its tail down toward the blob, so this
            works for both the small header avatar and the larger
            floating-button avatar without any extra transforms. */}
        <AnimatePresence>
          {showSpeech && (
            <motion.div
              key={speechText}
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.9 }}
              transition={{
                type: "keyframes",
                duration: 0.25,
                ease: "easeOut"
              }}
              className="absolute left-1/2 -translate-x-1/2 z-20"
              style={{
                bottom: 'calc(100% + 8px)',
                minWidth: '80px',
                maxWidth: size > 60 ? '240px' : '180px',
              }}
            >
              <div className="relative flex flex-col items-center">
                <BlobSpeech
                  mood={resolvedSpeechMood}
                  messages={{ [resolvedSpeechMood]: speechText }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <JellyBlobMascot
          mood={mood}
          gaze={gaze}
          size={size}
          onOverpoke={onOverpoke}
        />
      </div>
    </MotionConfig>
  );
};

export default BlobWrapper;