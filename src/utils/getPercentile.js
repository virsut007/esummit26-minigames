/**
 * getPercentile — maps a raw game score to a display tier.
 *
 * Currently uses static score thresholds (same for all games).
 * To wire up real backend data later, replace this function with an
 * API call that compares the score against the scores table percentile
 * distribution and returns the same shape: { label, tagline, tier }.
 */
export function getPercentile(score) {
  if (score >= 1500) return { label: 'TOP 1%',  tagline: 'Absolute Legend',    tier: 'top1'  }
  if (score >= 900)  return { label: 'TOP 2%',  tagline: 'Hall of Famer',       tier: 'top1'  }
  if (score >= 700)  return { label: 'TOP 5%',  tagline: 'Elite Player',        tier: 'top5'  }
  if (score >= 500)  return { label: 'TOP 10%', tagline: 'Pro Gamer',           tier: 'top10' }
  if (score >= 300)  return { label: 'TOP 25%', tagline: 'Rising Star',         tier: 'top25' }
  if (score >= 100)  return { label: 'TOP 50%', tagline: 'Getting Warmed Up',   tier: 'other' }
  return               { label: 'NEWCOMER',  tagline: 'Every Legend Starts Here', tier: 'other' }
}
