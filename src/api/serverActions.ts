/**
 * API abstraction layer.
 * Cards: from backend when API_BASE_URL is set, else mock.
 * Progress / bookmarks / user: auth-aware helpers using JWT.
 */

import { CardFromAPI } from '../types';
import { mockCards } from '../data/mockData';
import { API_BASE_URL } from './config';

// Cards / feed ----------------------------------------------------------------

export interface FetchCardsResult {
  success: boolean;
  data?: CardFromAPI[];
  error?: string;
}

export interface FeedMeta {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface FetchFeedResult {
  success: boolean;
  items?: CardFromAPI[];
  meta?: FeedMeta;
  error?: string;
}

/** Fetches first page of feed cards from backend or falls back to mock. */
export const fetchCards = async (token?: string | null): Promise<FetchCardsResult> => {
  try {
    if (API_BASE_URL) {
      // Prefer paginated feed endpoint; fall back to /api/cards if shape is different.
      const url = `${API_BASE_URL}/api/cards/feed?limit=10&offset=0`;
      console.log('[fetchCards] Using backend feed:', url);
      if (!token) {
        console.log('[fetchCards] No auth token, skipping backend feed and using mock/local cards');
        return { success: true, data: mockCards };
      }
      const headers: Record<string, string> = {};
      headers.Authorization = `Bearer ${token}`;
      console.log(`Token`);
      console.log(`Bearer ${token}`);
      console.log('[fetchCards] Request headers (sanitized):', {
        hasAuth: Boolean(headers.Authorization),
      });
      const res = await fetch(url, { headers });
      console.log('[fetchCards] Response status:', res.status, res.statusText);
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        console.log('[fetchCards] Error response body:', text);
        const msg = text || res.statusText || 'Failed to fetch content';
        return { success: false, error: msg };
      }
      const data = await res.json();

      // Support both feed shape ({ items: Card[] }) and debug shape (Card[])
      const items: CardFromAPI[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.items)
          ? data.items
          : [];

      console.log('[fetchCards] Success, cards count:', items.length);
      return { success: true, data: items };
    }
    console.log('[fetchCards] No BACKEND_URL set, using mock cards:', mockCards.length);
    return { success: true, data: mockCards };
  } catch (e) {
    const errMsg = e instanceof Error ? e.message : 'Failed to fetch content';
    console.log('[fetchCards] Error:', errMsg, e);
    return {
      success: false,
      error: errMsg,
    };
  }
};

/** Raw access to paginated feed endpoint. Not yet used by UI but available. */
export const fetchFeed = async (
  limit = 10,
  offset = 0,
  token?: string | null
): Promise<FetchFeedResult> => {
  if (!API_BASE_URL) {
    return {
      success: true,
      items: mockCards,
      meta: {
        total: mockCards.length,
        limit: mockCards.length,
        offset: 0,
        hasMore: false,
      },
    };
  }
  try {
    // Always request a single page of 10 cards.
    const pageSize = 10;
    const url = `${API_BASE_URL}/api/cards/feed?limit=${pageSize}&offset=${Math.max(
      offset,
      0
    )}`;
    console.log('[fetchFeed] Fetching:', url);
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(res.statusText);
    const data = await res.json();
    const items: CardFromAPI[] = Array.isArray(data?.items)
      ? data.items
      : Array.isArray(data)
        ? data
        : [];
    const meta: FeedMeta = {
      total: typeof data?.total === 'number' ? data.total : items.length,
      limit: typeof data?.limit === 'number' ? data.limit : pageSize,
      offset: typeof data?.offset === 'number' ? data.offset : offset,
      hasMore: Boolean(data?.hasMore),
    };
    return { success: true, items, meta };
  } catch (e) {
    const errMsg = e instanceof Error ? e.message : 'Failed to fetch feed';
    console.log('[fetchFeed] Error:', errMsg, e);
    return { success: false, error: errMsg };
  }
};

/** Cards by category (backend pagination). Currently unused by UI; available for future use. */
export const fetchCardsByCategory = async (
  category: string,
  limit = 10,
  offset = 0,
  token?: string | null
): Promise<FetchFeedResult> => {
  if (!API_BASE_URL) {
    const filtered = mockCards.filter((c) => c.category === category);
    return {
      success: true,
      items: filtered,
      meta: {
        total: filtered.length,
        limit: filtered.length,
        offset: 0,
        hasMore: false,
      },
    };
  }
  try {
    const url = `${API_BASE_URL}/api/cards/category/${encodeURIComponent(
      category
    )}?limit=${Math.min(Math.max(limit, 1), 100)}&offset=${Math.max(offset, 0)}`;
    console.log('[fetchCardsByCategory] Fetching:', url);
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(res.statusText);
    const data = await res.json();
    const items: CardFromAPI[] = Array.isArray(data?.items)
      ? data.items
      : Array.isArray(data)
        ? data
        : [];
    const meta: FeedMeta = {
      total: typeof data?.total === 'number' ? data.total : items.length,
      limit: typeof data?.limit === 'number' ? data.limit : limit,
      offset: typeof data?.offset === 'number' ? data.offset : offset,
      hasMore: Boolean(data?.hasMore),
    };
    return { success: true, items, meta };
  } catch (e) {
    const errMsg = e instanceof Error ? e.message : 'Failed to fetch category cards';
    console.log('[fetchCardsByCategory] Error:', errMsg, e);
    return { success: false, error: errMsg };
  }
};

/** Completed cards by category for current user. GET /api/cards/category/:category/completed */
export const fetchCompletedCardsByCategory = async (
  category: string,
  limit = 10,
  offset = 0,
  token?: string | null
): Promise<FetchFeedResult> => {
  if (!API_BASE_URL) {
    const filtered = mockCards.filter((c) => c.category === category);
    return {
      success: true,
      items: filtered,
      meta: {
        total: filtered.length,
        limit: filtered.length,
        offset: 0,
        hasMore: false,
      },
    };
  }
  if (!token) {
    return { success: false, error: 'Authentication required' };
  }
  try {
    const url = `${API_BASE_URL}/api/cards/category/${encodeURIComponent(
      category
    )}/completed?limit=${Math.min(Math.max(limit, 1), 100)}&offset=${Math.max(offset, 0)}`;
    console.log('[fetchCompletedCardsByCategory] Fetching:', url);
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(res.statusText);
    const data = await res.json();
    const items: CardFromAPI[] = Array.isArray(data?.items)
      ? data.items
      : Array.isArray(data)
        ? data
        : [];
    const meta: FeedMeta = {
      total: typeof data?.total === 'number' ? data.total : items.length,
      limit: typeof data?.limit === 'number' ? data.limit : limit,
      offset: typeof data?.offset === 'number' ? data.offset : offset,
      hasMore: Boolean(data?.hasMore),
    };
    return { success: true, items, meta };
  } catch (e) {
    const errMsg = e instanceof Error ? e.message : 'Failed to fetch completed category cards';
    console.log('[fetchCompletedCardsByCategory] Error:', errMsg, e);
    return { success: false, error: errMsg };
  }
};

// Progress / bookmarks --------------------------------------------------------

export interface ProgressPayload {
  learnedCardIds: string[];
  savedCardIds: string[];
  finishedDetailCardIds: string[];
  detailOpenedCardIds: string[];
  stats: {
    cardsLearned: number;
    streakDays: number;
    lastLearningDate: string | null;
    topicsFollowed: number;
  };
  lastLearningDate: string | null;
}

export interface FetchProgressResult {
  success: boolean;
  data?: ProgressPayload;
  error?: string;
}

/** Fetches progress for current user. If unauthenticated or offline, returns success with undefined data. */
export const fetchProgress = async (
  token?: string | null
): Promise<FetchProgressResult> => {
  if (!API_BASE_URL) {
    console.log('[fetchProgress] No BACKEND_URL, skip progress fetch');
    return { success: true, data: undefined };
  }
  try {
    const url = `${API_BASE_URL}/api/progress`;
    console.log('[fetchProgress] Fetching:', url);
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(res.statusText);
    const data = await res.json();
    return {
      success: true,
      data: {
        learnedCardIds: data.learnedCardIds ?? [],
        savedCardIds: data.savedCardIds ?? [],
        finishedDetailCardIds: data.finishedDetailCardIds ?? [],
        detailOpenedCardIds: data.detailOpenedCardIds ?? [],
        stats:
          data.stats ??
          {
            cardsLearned: 0,
            streakDays: 0,
            lastLearningDate: null,
            topicsFollowed: 0,
          },
        lastLearningDate: data.lastLearningDate ?? null,
      },
    };
  } catch (e) {
    console.log('[fetchProgress] Error, treating as offline/local only', e);
    return { success: true, data: undefined }; // offline: keep local
  }
};

export interface PatchProgressResult {
  success: boolean;
  error?: string;
}

/** PATCH progress for current user (auth optional – no-op when missing). */
export const patchProgress = async (
  payload: Partial<ProgressPayload>,
  token?: string | null
): Promise<PatchProgressResult> => {
  if (!API_BASE_URL) return { success: true };
  if (!token) {
    // Allow local-only experience when user is not logged in.
    return { success: true };
  }
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
    const res = await fetch(`${API_BASE_URL}/api/progress`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(res.statusText);
    return { success: true };
  } catch (e) {
    const errMsg =
      e instanceof Error ? e.message : 'Failed to sync progress';
    console.log('[patchProgress] Error:', errMsg, e);
    return { success: false, error: errMsg };
  }
};

export interface MarkCardFinishedResult {
  success: boolean;
  data?: ProgressPayload;
  error?: string;
}

/** POST /api/progress/card-finished – marks a card as finished and updates progress. */
export const markCardFinished = async (
  cardId: string,
  token?: string | null
): Promise<MarkCardFinishedResult> => {
  if (!API_BASE_URL) return { success: true };
  if (!token) {
    // Local-only guest user; keep using in-memory progress.
    return { success: true };
  }
  try {
    const res = await fetch(`${API_BASE_URL}/api/progress/learned`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ cardId }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      const message = text || res.statusText || 'Failed to mark card finished';
      return { success: false, error: message };
    }
    const data = await res.json();
    return {
      success: true,
      data: {
        learnedCardIds: data.learnedCardIds ?? [],
        savedCardIds: data.savedCardIds ?? [],
        finishedDetailCardIds: data.finishedDetailCardIds ?? [],
        detailOpenedCardIds: data.detailOpenedCardIds ?? [],
        stats:
          data.stats ??
          {
            cardsLearned: 0,
            streakDays: 0,
            lastLearningDate: null,
            topicsFollowed: 0,
          },
        lastLearningDate: data.lastLearningDate ?? null,
      },
    };
  } catch (e) {
    const errMsg =
      e instanceof Error ? e.message : 'Failed to mark card finished';
    console.log('[markCardFinished] Error:', errMsg, e);
    return { success: false, error: errMsg };
  }
};

export interface BookmarkMutationResult {
  success: boolean;
  savedCardIds?: string[];
  error?: string;
}

/** POST /api/cards/bookmarks – add bookmark for a card. */
export const addBookmark = async (
  cardId: string,
  token?: string | null
): Promise<BookmarkMutationResult> => {
  if (!API_BASE_URL) return { success: true };
  if (!token) return { success: true };
  try {
    const res = await fetch(`${API_BASE_URL}/api/cards/bookmarks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ cardId }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      const message = text || res.statusText || 'Failed to add bookmark';
      return { success: false, error: message };
    }
    const data = await res.json();
    return {
      success: true,
      savedCardIds: data.savedCardIds ?? [],
    };
  } catch (e) {
    const errMsg =
      e instanceof Error ? e.message : 'Failed to add bookmark';
    console.log('[addBookmark] Error:', errMsg, e);
    return { success: false, error: errMsg };
  }
};

/** DELETE /api/cards/bookmarks – remove bookmark for a card. */
export const removeBookmark = async (
  cardId: string,
  token?: string | null
): Promise<BookmarkMutationResult> => {
  if (!API_BASE_URL) return { success: true };
  if (!token) return { success: true };
  try {
    const res = await fetch(`${API_BASE_URL}/api/cards/bookmarks`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ cardId }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      const message =
        text || res.statusText || 'Failed to remove bookmark';
      return { success: false, error: message };
    }
    const data = await res.json();
    return {
      success: true,
      savedCardIds: data.savedCardIds ?? [],
    };
  } catch (e) {
    const errMsg =
      e instanceof Error ? e.message : 'Failed to remove bookmark';
    console.log('[removeBookmark] Error:', errMsg, e);
    return { success: false, error: errMsg };
  }
};

export interface FetchBookmarksResult {
  success: boolean;
  data?: CardFromAPI[];
  error?: string;
}

/** Paginated bookmarks API response: items + total, limit, offset, hasMore. */
export interface BookmarksPage {
  items: CardFromAPI[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface GetBookmarksResult {
  success: boolean;
  data?: BookmarksPage;
  error?: string;
}

/** GET /api/cards/bookmarks?limit=&offset= – returns paginated bookmarked cards. */
export const getBookmarks = async (
  limit = 10,
  offset = 0,
  token?: string | null
): Promise<GetBookmarksResult> => {
  if (!API_BASE_URL) {
    return { success: true, data: { items: [], total: 0, limit, offset, hasMore: false } };
  }
  if (!token) {
    return { success: true, data: { items: [], total: 0, limit, offset, hasMore: false } };
  }
  try {
    const url = `${API_BASE_URL}/api/cards/bookmarks?limit=${Math.max(0, limit)}&offset=${Math.max(0, offset)}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(res.statusText);
    const data = await res.json();
    const items: CardFromAPI[] = Array.isArray(data?.items) ? data.items : [];
    const total = typeof data?.total === 'number' ? data.total : items.length;
    const pageLimit = typeof data?.limit === 'number' ? data.limit : limit;
    const pageOffset = typeof data?.offset === 'number' ? data.offset : offset;
    const hasMore = data?.hasMore === true;
    return {
      success: true,
      data: {
        items,
        total,
        limit: pageLimit,
        offset: pageOffset,
        hasMore,
      },
    };
  } catch (e) {
    const errMsg =
      e instanceof Error ? e.message : 'Failed to fetch bookmarks';
    console.log('[getBookmarks] Error:', errMsg, e);
    return { success: false, error: errMsg };
  }
};

/** GET /api/cards/bookmarks – returns full card objects for savedCardIds (first page only; use getBookmarks for pagination). */
export const fetchBookmarkedCards = async (
  token?: string | null
): Promise<FetchBookmarksResult> => {
  const res = await getBookmarks(100, 0, token);
  if (!res.success || !res.data) {
    return { success: res.success, data: undefined, error: res.error };
  }
  return { success: true, data: res.data.items };
};

// Stats by category -----------------------------------------------------------

export interface CategoryStatsByCategory {
  total: number;
  completed: number;
}

export interface StatsOverview {
  streak: number;
  consumed: number;
  topic: number;
}

export interface CategoryStatsResponse {
  overview?: StatsOverview;
  categories: Record<string, CategoryStatsByCategory>;
}

export interface FetchCategoryStatsResult {
  success: boolean;
  data?: CategoryStatsResponse;
  error?: string;
}

/** GET /api/progress/user-progress-stats – overview (streak, consumed) and per-category totals/completed. */
export const fetchCategoryStats = async (
  token?: string | null
): Promise<FetchCategoryStatsResult> => {
  if (!API_BASE_URL) return { success: true, data: undefined };
  if (!token) return { success: false, error: 'Authentication required' };
  try {
    const url = `${API_BASE_URL}/api/progress/user-progress-stats`;
    console.log('[fetchCategoryStats] Fetching:', url);
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error(res.statusText);
    const data = (await res.json()) as CategoryStatsResponse;
    return { success: true, data };
  } catch (e) {
    const errMsg =
      e instanceof Error ? e.message : 'Failed to fetch category stats';
    console.log('[fetchCategoryStats] Error:', errMsg, e);
    return { success: false, error: errMsg };
  }
};

// User ------------------------------------------------------------------------

export interface UserProfile {
  _id: string;
  email: string;
  name?: string;
  language?: string;
  preferences?: string[];
}

export interface FetchUserResult {
  success: boolean;
  data?: UserProfile;
  error?: string;
}

/** GET /api/users/me – current user profile. */
export const getCurrentUser = async (
  token?: string | null
): Promise<FetchUserResult> => {
  if (!API_BASE_URL) return { success: true, data: undefined };
  if (!token) return { success: true, data: undefined };
  try {
    const res = await fetch(`${API_BASE_URL}/api/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error(res.statusText);
    const data = (await res.json()) as UserProfile;
    return { success: true, data };
  } catch (e) {
    const errMsg =
      e instanceof Error ? e.message : 'Failed to fetch current user';
    console.log('[getCurrentUser] Error:', errMsg, e);
    return { success: false, error: errMsg };
  }
};

/** PATCH /api/users/me – update current user (name / age / language / preferences). */
export const updateCurrentUser = async (
  payload: { name?: string; age?: number; language?: string; preferences?: string[] },
  token?: string | null
): Promise<FetchUserResult> => {
  if (!API_BASE_URL) return { success: true, data: undefined };
  if (!token) return { success: true, data: undefined };
  try {
    const res = await fetch(`${API_BASE_URL}/api/users/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(res.statusText);
    const data = (await res.json()) as UserProfile;
    return { success: true, data };
  } catch (e) {
    const errMsg =
      e instanceof Error ? e.message : 'Failed to update current user';
    console.log('[updateCurrentUser] Error:', errMsg, e);
    return { success: false, error: errMsg };
  }
};

export interface DeleteAccountResult {
  success: boolean;
  error?: string;
}

/**
 * Calls backend to delete the current user account.
 * On success or when no backend / no token, caller should still logout locally.
 */
export const deleteAccount = async (
  token?: string | null
): Promise<DeleteAccountResult> => {
  if (!API_BASE_URL) {
    console.log(
      '[deleteAccount] No BACKEND_URL set, account delete is local only'
    );
    return { success: true };
  }
  if (!token) {
    // Treat as local-only delete when unauthenticated.
    return { success: true };
  }
  try {
    const res = await fetch(`${API_BASE_URL}/api/users/me`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error(res.statusText || 'Delete account failed');
    return { success: true };
  } catch (e) {
    const errMsg =
      e instanceof Error ? e.message : 'Failed to delete account';
    console.log('[deleteAccount] Error:', errMsg, e);
    return { success: false, error: errMsg };
  }
};

// Auth / health ---------------------------------------------------------------

export interface AppleLoginResult {
  success: boolean;
  token?: string | null;
  email?: string | null;
  error?: string;
}

/**
 * Login/signup with Apple on the backend.
 * Expects backend route: POST /api/users/apple-login { identityToken, email? } -> { token, user: { email } }.
 */
export const loginWithApple = async (
  identityToken: string,
  email?: string | null
): Promise<AppleLoginResult> => {
  if (!API_BASE_URL) {
    console.log(
      '[loginWithApple] No BACKEND_URL set, treating login as local only'
    );
    return { success: true, token: null, email: email ?? null };
  }
  try {
    const res = await fetch(`${API_BASE_URL}/api/users/apple-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identityToken, email }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      const message = text || res.statusText || 'Apple login failed';
      return { success: false, error: message };
    }
    const data = await res.json();
    const token = data.token ?? null;
    const userEmail = data.user?.email ?? email ?? null;
    return { success: true, token, email: userEmail };
  } catch (e) {
    const errMsg =
      e instanceof Error ? e.message : 'Failed to login with Apple';
    console.log('[loginWithApple] Error:', errMsg, e);
    return { success: false, error: errMsg };
  }
};

export interface HealthResult {
  success: boolean;
  status?: string;
  service?: string;
  error?: string;
}

/** GET /api/health – simple health check. */
export const getHealth = async (): Promise<HealthResult> => {
  if (!API_BASE_URL) return { success: true, status: 'ok', service: 'local' };
  try {
    const res = await fetch(`${API_BASE_URL}/api/health`);
    if (!res.ok) throw new Error(res.statusText);
    const data = await res.json();
    return {
      success: true,
      status: data.status,
      service: data.service,
    };
  } catch (e) {
    const errMsg =
      e instanceof Error ? e.message : 'Failed to fetch health';
    console.log('[getHealth] Error:', errMsg, e);
    return { success: false, error: errMsg };
  }
};

export interface TestResult {
  success: boolean;
  payload?: any;
  error?: string;
}

/** GET /api/test – backend test endpoint. */
export const getTestPayload = async (): Promise<TestResult> => {
  if (!API_BASE_URL) return { success: true, payload: { ok: true } };
  try {
    const res = await fetch(`${API_BASE_URL}/api/test`);
    if (!res.ok) throw new Error(res.statusText);
    const data = await res.json();
    return { success: true, payload: data };
  } catch (e) {
    const errMsg =
      e instanceof Error ? e.message : 'Failed to fetch test payload';
    console.log('[getTestPayload] Error:', errMsg, e);
    return { success: false, error: errMsg };
  }
};
