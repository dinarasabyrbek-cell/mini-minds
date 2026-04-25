export const numbers = [
  { number: 1,  word: 'one',       emoji: '🌟' },
  { number: 2,  word: 'two',       emoji: '🐰' },
  { number: 3,  word: 'three',     emoji: '🍎' },
  { number: 4,  word: 'four',      emoji: '🌸' },
  { number: 5,  word: 'five',      emoji: '⭐' },
  { number: 6,  word: 'six',       emoji: '🦋' },
  { number: 7,  word: 'seven',     emoji: '🌈' },
  { number: 8,  word: 'eight',     emoji: '🍓' },
  { number: 9,  word: 'nine',      emoji: '🐣' },
  { number: 10, word: 'ten',       emoji: '🎈' },
  { number: 11, word: 'eleven',    emoji: '🌻' },
  { number: 12, word: 'twelve',    emoji: '🍕' },
  { number: 13, word: 'thirteen',  emoji: '🐸' },
  { number: 14, word: 'fourteen',  emoji: '🌺' },
  { number: 15, word: 'fifteen',   emoji: '🍦' },
  { number: 16, word: 'sixteen',   emoji: '🚂' },
  { number: 17, word: 'seventeen', emoji: '🦀' },
  { number: 18, word: 'eighteen',  emoji: '🎵' },
  { number: 19, word: 'nineteen',  emoji: '🦜' },
  { number: 20, word: 'twenty',    emoji: '🎉' },
]

export function speakNumber(number, word) {
  if (typeof window === 'undefined') return
  const u = new SpeechSynthesisUtterance(`${number}... ${number} is ${word}`)
  u.rate = 0.8
  u.pitch = 1.2
  u.volume = 1
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(u)
}
