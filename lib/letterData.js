export const letters = [
  { letter: 'A', word: 'Apple',     emoji: '🍎', phonetic: 'ah' },
  { letter: 'B', word: 'Ball',      emoji: '⚽', phonetic: 'buh' },
  { letter: 'C', word: 'Cat',       emoji: '🐱', phonetic: 'kuh' },
  { letter: 'D', word: 'Dog',       emoji: '🐶', phonetic: 'duh' },
  { letter: 'E', word: 'Elephant',  emoji: '🐘', phonetic: 'eh' },
  { letter: 'F', word: 'Fish',      emoji: '🐟', phonetic: 'fuh' },
  { letter: 'G', word: 'Grapes',    emoji: '🍇', phonetic: 'guh' },
  { letter: 'H', word: 'Hat',       emoji: '🎩', phonetic: 'huh' },
  { letter: 'I', word: 'Ice Cream', emoji: '🍦', phonetic: 'ih' },
  { letter: 'J', word: 'Jellyfish', emoji: '🪼', phonetic: 'juh' },
  { letter: 'K', word: 'Kite',      emoji: '🪁', phonetic: 'kuh' },
  { letter: 'L', word: 'Lion',      emoji: '🦁', phonetic: 'luh' },
  { letter: 'M', word: 'Moon',      emoji: '🌙', phonetic: 'muh' },
  { letter: 'N', word: 'Nest',      emoji: '🪺', phonetic: 'nuh' },
  { letter: 'O', word: 'Orange',    emoji: '🍊', phonetic: 'oh' },
  { letter: 'P', word: 'Penguin',   emoji: '🐧', phonetic: 'puh' },
  { letter: 'Q', word: 'Queen',     emoji: '👑', phonetic: 'kwuh' },
  { letter: 'R', word: 'Rabbit',    emoji: '🐰', phonetic: 'ruh' },
  { letter: 'S', word: 'Sun',       emoji: '☀️', phonetic: 'suh' },
  { letter: 'T', word: 'Train',     emoji: '🚂', phonetic: 'tuh' },
  { letter: 'U', word: 'Umbrella',  emoji: '☂️', phonetic: 'uh' },
  { letter: 'V', word: 'Violin',    emoji: '🎻', phonetic: 'vuh' },
  { letter: 'W', word: 'Whale',     emoji: '🐳', phonetic: 'wuh' },
  { letter: 'X', word: 'Xylophone', emoji: '🎵', phonetic: 'ks' },
  { letter: 'Y', word: 'Yak',       emoji: '🐃', phonetic: 'yuh' },
  { letter: 'Z', word: 'Zebra',     emoji: '🦓', phonetic: 'zuh' },
]

import { speak } from './elevenlabs'

export async function speakLetter(letter, word) {
  await speak(`${letter}... ${letter} is for ${word}`)
}
