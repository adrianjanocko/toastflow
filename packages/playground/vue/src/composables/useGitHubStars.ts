import { onMounted, ref } from 'vue';

const CACHE_KEY = 'toastflow-github-stars';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CachedStars {
  count: number;
  fetchedAt: number;
}

export function useGitHubStars(owner: string, repo: string) {
  const stars = ref<number | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  function readCache(): CachedStars | null {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) {
        return null;
      }
      const parsed: CachedStars = JSON.parse(raw);
      if (Date.now() - parsed.fetchedAt > CACHE_TTL_MS) {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }

  function writeCache(count: number) {
    try {
      const entry: CachedStars = { count, fetchedAt: Date.now() };
      localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
    } catch {
      // storage full or unavailable
    }
  }

  async function fetchStars() {
    const cached = readCache();
    if (cached) {
      stars.value = cached.count;
      return;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: { Accept: 'application/vnd.github.v3+json' },
      });

      if (!response.ok) {
        error.value = `GitHub API responded with ${response.status}`;
        return;
      }

      const data = await response.json();
      const count = typeof data.stargazers_count === 'number' ? data.stargazers_count : 0;
      stars.value = count;
      writeCache(count);
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
      console.warn('[toastflow] Failed to fetch GitHub stars:', error.value);
    } finally {
      isLoading.value = false;
    }
  }

  onMounted(fetchStars);

  return { stars, isLoading, error };
}
