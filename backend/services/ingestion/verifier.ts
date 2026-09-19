/**
 * Handle Verification and Ownership Verification Service
 * Validates existence and verifies account ownership on LeetCode & Codeforces.
 */

export interface HandleVerificationResult {
  platform: "leetcode" | "codeforces";
  handle: string;
  exists: boolean;
  verifiedOwnership: boolean;
  profile?: {
    username: string;
    realName?: string;
    ranking?: number;
    rating?: number;
    rank?: string;
    avatar?: string;
    aboutMe?: string;
    totalSolved?: number;
  };
  error?: string;
  message: string;
}

/**
 * Generate a unique verification token for profile ownership confirmation
 */
export function generateVerificationToken(identifier: string): string {
  const hash = Math.abs(
    identifier.split("").reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)
  ).toString(16).slice(0, 6);
  return `blindspot-verify-${hash}`;
}

/**
 * Verify LeetCode Profile Existence & Ownership via GraphQL and Public API
 */
export async function verifyLeetCodeHandle(
  username: string,
  verificationToken?: string
): Promise<HandleVerificationResult> {
  const cleanUsername = username.trim();
  if (!cleanUsername) {
    return {
      platform: "leetcode",
      handle: username,
      exists: false,
      verifiedOwnership: false,
      message: "LeetCode username cannot be empty.",
    };
  }

  // 1. Probe LeetCode GraphQL
  try {
    const query = `
      query userPublicProfile($username: String!) {
        matchedUser(username: $username) {
          username
          profile {
            realName
            aboutMe
            ranking
            userAvatar
          }
          submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
            }
          }
        }
      }
    `;

    const res = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0",
      },
      body: JSON.stringify({ query, variables: { username: cleanUsername } }),
      signal: AbortSignal.timeout(5000),
    });

    if (res.ok) {
      const json: any = await res.json();
      const user = json.data?.matchedUser;

      if (user && user.username) {
        const profile = user.profile || {};
        const acStats = user.submitStatsGlobal?.acSubmissionNum || [];
        const totalSolved = acStats.find((s: any) => s.difficulty === "All")?.count || 0;

        const aboutMe = profile.aboutMe || "";
        const realName = profile.realName || "";

        let verifiedOwnership = false;
        if (verificationToken && verificationToken.trim()) {
          const token = verificationToken.trim().toLowerCase();
          verifiedOwnership =
            aboutMe.toLowerCase().includes(token) || realName.toLowerCase().includes(token);
        } else {
          verifiedOwnership = true;
        }

        return {
          platform: "leetcode",
          handle: user.username,
          exists: true,
          verifiedOwnership,
          profile: {
            username: user.username,
            realName: profile.realName,
            ranking: profile.ranking,
            avatar: profile.userAvatar,
            aboutMe: profile.aboutMe,
            totalSolved,
          },
          message: verifiedOwnership
            ? `Verified LeetCode profile @${user.username} successfully.`
            : `LeetCode profile found, but verification code '${verificationToken}' was not found in your bio/summary. Please add it to your bio on leetcode.com and try again.`,
        };
      }
    }
  } catch (err) {
    console.warn(`[LeetCode Verification GraphQL Notice]:`, (err as Error).message);
  }

  // 2. Fallback probe via alfa-leetcode-api
  try {
    const url = `https://alfa-leetcode-api.onrender.com/userProfile/${encodeURIComponent(cleanUsername)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      const json: any = await res.json();
      if (json && (json.username || json.totalSolved !== undefined)) {
        const about = (json.about || "").toLowerCase();
        const realName = (json.realName || json.name || "").toLowerCase();
        let verifiedOwnership = false;
        if (verificationToken && verificationToken.trim()) {
          const token = verificationToken.trim().toLowerCase();
          verifiedOwnership = about.includes(token) || realName.includes(token);
        } else {
          verifiedOwnership = true;
        }

        return {
          platform: "leetcode",
          handle: cleanUsername,
          exists: true,
          verifiedOwnership,
          profile: {
            username: cleanUsername,
            realName: json.name || json.realName,
            ranking: json.ranking,
            avatar: json.avatar,
            aboutMe: json.about,
            totalSolved: json.totalSolved || 0,
          },
          message: verifiedOwnership
            ? `Verified LeetCode profile @${cleanUsername}.`
            : `LeetCode profile found, but verification code '${verificationToken}' was not found in your bio. Please add it to your bio on leetcode.com and try again.`,
        };
      }
    }
  } catch (err) {
    console.warn(`[LeetCode Verification alfa-api Notice]:`, (err as Error).message);
  }

  return {
    platform: "leetcode",
    handle: cleanUsername,
    exists: false,
    verifiedOwnership: false,
    error: `No LeetCode profile exists with username @${cleanUsername}. Please check spelling.`,
    message: `LeetCode user @${cleanUsername} not found.`,
  };
}

/**
 * Verify Codeforces Profile Existence & Ownership via official API
 */
export async function verifyCodeforcesHandle(
  handle: string,
  verificationToken?: string
): Promise<HandleVerificationResult> {
  const cleanHandle = handle.trim();
  if (!cleanHandle) {
    return {
      platform: "codeforces",
      handle,
      exists: false,
      verifiedOwnership: false,
      message: "Codeforces handle cannot be empty.",
    };
  }

  const url = `https://codeforces.com/api/user.info?handles=${encodeURIComponent(cleanHandle)}`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(5000),
    });

    if (res.ok) {
      const json: any = await res.json();
      if (json.status === "OK" && Array.isArray(json.result) && json.result.length > 0) {
        const user = json.result[0];

        let verifiedOwnership = false;
        if (verificationToken && verificationToken.trim()) {
          const token = verificationToken.trim().toLowerCase();
          const firstName = (user.firstName || "").toLowerCase();
          const lastName = (user.lastName || "").toLowerCase();
          const org = (user.organization || "").toLowerCase();
          const city = (user.city || "").toLowerCase();
          const country = (user.country || "").toLowerCase();

          verifiedOwnership =
            firstName.includes(token) ||
            lastName.includes(token) ||
            org.includes(token) ||
            city.includes(token) ||
            country.includes(token);
        } else {
          verifiedOwnership = true;
        }

        return {
          platform: "codeforces",
          handle: user.handle,
          exists: true,
          verifiedOwnership,
          profile: {
            username: user.handle,
            rating: user.rating || 0,
            rank: user.rank || "unrated",
            avatar: user.avatar || user.titlePhoto,
            realName: [user.firstName, user.lastName].filter(Boolean).join(" "),
          },
          message: verifiedOwnership
            ? `Verified Codeforces handle @${user.handle} (${user.rank || "unrated"}, rating: ${user.rating || 0}).`
            : `Codeforces profile found, but verification code '${verificationToken}' was not found in your profile fields (First/Last name or Organization on codeforces.com). Please add it and try again.`,
        };
      }
    }
  } catch (err) {
    console.warn(`[Codeforces Verification API Error]:`, (err as Error).message);
  }

  return {
    platform: "codeforces",
    handle: cleanHandle,
    exists: false,
    verifiedOwnership: false,
    error: `Codeforces handle @${cleanHandle} not found. Please verify the handle on codeforces.com.`,
    message: `Codeforces handle @${cleanHandle} not found.`,
  };
}
