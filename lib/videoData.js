export const videos = [
  {
    id: 'vid1',
    youtubeId: '0MF9QOCrddQ',
    title: 'Khan Academy Kids Video 1',
    category: 'Learning',
  },
  {
    id: 'vid2',
    youtubeId: '92wP5T6ouTM',
    title: 'Khan Academy Kids Video 2',
    category: 'Learning',
  },
  {
    id: 'vid3',
    youtubeId: 'OChZeYlQTyo',
    title: 'Khan Academy Kids Video 3',
    category: 'Learning',
  },
  {
    id: 'vid4',
    youtubeId: 'ZS_Au46ub3Y',
    title: 'Khan Academy Kids Video 4',
    category: 'Learning',
  },
  {
    id: 'vid5',
    youtubeId: 'fD0cAKEhXbA',
    title: 'Khan Academy Kids Video 5',
    category: 'Learning',
  },
]

export function getVideo(id) {
  return videos.find(v => v.id === id) ?? null
}
