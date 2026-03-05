/**
 * Inflates achievement numbers based on actual database counts
 * Uses days since epoch to create consistent daily increments
 */

const BASE_DATE = new Date('2024-01-01').getTime()

export function inflateAchievements(actual: {
  listings: number
  transactions: number
  projects: number
  users: number
}) {
  const daysSinceBase = Math.floor((Date.now() - BASE_DATE) / (1000 * 60 * 60 * 24))
  
  return {
    listings: actual.listings + Math.floor(daysSinceBase * 0.15) + 220,
    transactions: actual.transactions + Math.floor(daysSinceBase * 0.15) + 75,
    projects: actual.projects + Math.floor(daysSinceBase * 0.2) + 100,
    users: actual.users + Math.floor(daysSinceBase * 3.2) + 850,
  }
}
