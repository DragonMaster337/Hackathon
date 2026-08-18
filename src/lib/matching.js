/**
 * Matching engine.
 *
 * This is the seam the AI plugs into. Today `scoreOpportunity` is a
 * deterministic, explainable scorer that runs on-device: zero latency, zero
 * cost, works offline, and gives us a baseline to measure the AI against.
 *
 * The AI swap is `scoreOpportunities` only. Everything upstream (the feed,
 * the detail screen, the application record) consumes a MatchResult and does
 * not care how it was produced. To go live with AI:
 *
 *   1. Implement scoreWithAI() below against an edge function that calls the
 *      model with the profile + a batch of opportunities.
 *   2. Flip USE_AI to true.
 *
 * The MatchResult shape is deliberately explanation-first. A number alone is
 * not useful to a student - "you are missing SQL and Power BI" is. Keeping
 * `matched` / `missing` in the contract means the AI must also justify its
 * score, not just emit one.
 *
 * @typedef {Object} MatchResult
 * @property {number}   score    0-100
 * @property {string[]} matched  required skills the student already has
 * @property {string[]} missing  required skills the student lacks
 * @property {string[]} bonus    nice-to-have skills the student has
 * @property {string}   summary  one-line human-readable explanation
 * @property {string}   band     'strong' | 'partial' | 'weak'
 */

const USE_AI = false;

// How much each signal contributes to the final score.
const WEIGHTS = {
  requiredSkills: 60,
  niceToHave: 10,
  fieldOfStudy: 15,
  experience: 10,
  location: 5,
};

const norm = (s) => String(s || '').trim().toLowerCase();

/** Case/whitespace-insensitive intersection of two skill lists. */
function overlap(a = [], b = []) {
  const bSet = new Set(b.map(norm));
  return a.filter((s) => bSet.has(norm(s)));
}

function bandFor(score) {
  if (score >= 70) return 'strong';
  if (score >= 40) return 'partial';
  return 'weak';
}

/**
 * Score one opportunity against one student profile.
 * @returns {MatchResult}
 */
export function scoreOpportunity(profile, opportunity) {
  const studentSkills = profile?.skills || [];
  const required = opportunity?.required_skills || [];
  const nice = opportunity?.nice_to_have_skills || [];

  const matched = overlap(required, studentSkills);
  const missing = required.filter(
    (s) => !matched.some((m) => norm(m) === norm(s))
  );
  const bonus = overlap(nice, studentSkills);

  let score = 0;

  // 1. Required skills - the dominant signal.
  if (required.length === 0) {
    score += WEIGHTS.requiredSkills * 0.5; // no stated requirements: neutral
  } else {
    score += WEIGHTS.requiredSkills * (matched.length / required.length);
  }

  // 2. Nice-to-have skills.
  if (nice.length > 0) {
    score += WEIGHTS.niceToHave * (bonus.length / nice.length);
  }

  // 3. Field of study alignment.
  const oppField = norm(opportunity?.field_of_study);
  const studentField = norm(profile?.field_of_study);
  if (!oppField) {
    score += WEIGHTS.fieldOfStudy * 0.5;
  } else if (studentField && (oppField.includes(studentField) || studentField.includes(oppField))) {
    score += WEIGHTS.fieldOfStudy;
  }

  // 4. Experience level. Entry/graduate roles are the target, so a student
  //    with little experience is a *good* fit, not a bad one.
  const level = norm(opportunity?.experience_level);
  const years = Number(profile?.years_experience || 0);
  if (level === 'entry' || level === 'graduate') {
    score += WEIGHTS.experience;
  } else if (level === 'junior' && years >= 1) {
    score += WEIGHTS.experience;
  } else if (level === 'mid' && years >= 3) {
    score += WEIGHTS.experience;
  } else {
    score += WEIGHTS.experience * 0.3;
  }

  // 5. Location / remote.
  if (opportunity?.is_remote) {
    score += WEIGHTS.location;
  } else {
    const oppLoc = norm(opportunity?.location);
    const studentLoc = norm(profile?.location);
    if (oppLoc && studentLoc && (oppLoc.includes(studentLoc) || studentLoc.includes(oppLoc))) {
      score += WEIGHTS.location;
    }
  }

  const final = Math.max(0, Math.min(100, Math.round(score)));

  return {
    score: final,
    matched,
    missing,
    bonus,
    band: bandFor(final),
    summary: buildSummary(final, matched, missing),
  };
}

function buildSummary(score, matched, missing) {
  if (missing.length === 0 && matched.length > 0) {
    return `You have all ${matched.length} required skills.`;
  }
  if (score >= 70) {
    return `Strong fit - ${matched.length} of ${matched.length + missing.length} skills matched.`;
  }
  if (missing.length > 0) {
    const show = missing.slice(0, 2).join(', ');
    const more = missing.length > 2 ? ` +${missing.length - 2} more` : '';
    return `Missing: ${show}${more}`;
  }
  return 'Partial match based on your profile.';
}

/**
 * Score and rank a list of opportunities. This is the function the AI
 * replaces - the only place that needs to change.
 *
 * @returns {Promise<Array<{opportunity: Object, match: MatchResult}>>}
 */
export async function scoreOpportunities(profile, opportunities = []) {
  if (USE_AI) {
    try {
      return await scoreWithAI(profile, opportunities);
    } catch (err) {
      // Never let a model outage break the feed - fall back to local scoring.
      console.warn('AI scoring failed, using local scorer:', err?.message);
    }
  }

  return opportunities
    .map((opportunity) => ({ opportunity, match: scoreOpportunity(profile, opportunity) }))
    .sort((a, b) => b.match.score - a.match.score);
}

/**
 * Placeholder for the AI-backed scorer.
 *
 * Intended shape: POST profile + opportunities to a Supabase edge function
 * that calls the model and returns the same MatchResult contract, so nothing
 * downstream changes. Kept here so the integration point is explicit rather
 * than something we retrofit later.
 */
async function scoreWithAI(profile, opportunities) {
  throw new Error('AI scoring not implemented yet');
}

/** Skills the student is missing across a set of opportunities, most-wanted first. */
export function skillGaps(profile, opportunities = []) {
  const counts = new Map();
  opportunities.forEach((opp) => {
    scoreOpportunity(profile, opp).missing.forEach((skill) => {
      const key = norm(skill);
      counts.set(key, { name: skill, count: (counts.get(key)?.count || 0) + 1 });
    });
  });
  return [...counts.values()].sort((a, b) => b.count - a.count);
}

export const MATCH_BANDS = {
  strong: { label: 'Strong match', color: 'matchStrong' },
  partial: { label: 'Partial match', color: 'matchPartial' },
  weak: { label: 'Low match', color: 'matchWeak' },
};
