import { supabase } from './supabase'

export function getChildId() {
  return localStorage.getItem('miniMindsChildId')
}

export function getChildName() {
  return localStorage.getItem('miniMindsName') || 'Friend'
}

export function getChildAvatar() {
  return localStorage.getItem('miniMindsAvatar') || 'rabbit'
}

export async function markLetterComplete(letter) {
  const childId = getChildId()
  if (!childId) return
  await supabase.from('letter_progress').upsert({
    child_id: childId,
    letter: letter,
    completed: true,
    completed_at: new Date().toISOString()
  }, { onConflict: 'child_id,letter' })
}

export async function getCompletedLetters() {
  const childId = getChildId()
  if (!childId) return []
  const { data } = await supabase
    .from('letter_progress')
    .select('letter')
    .eq('child_id', childId)
    .eq('completed', true)
  return data ? data.map(row => row.letter) : []
}

export async function saveGameSession(gameType, score, durationSeconds) {
  const childId = getChildId()
  if (!childId) return
  await supabase.from('game_sessions').insert({
    child_id: childId,
    game_type: gameType,
    score,
    duration_seconds: durationSeconds
  })
}
