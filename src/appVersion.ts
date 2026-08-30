const VERSION_STORAGE_KEY = 'usopen_bracket_app_version';

export async function checkForAppUpdate(): Promise<void> {
  if (import.meta.env.DEV) return;

  try {
    const response = await fetch(
      `${import.meta.env.BASE_URL}version.json?check=${Date.now()}`,
      { cache: 'no-store' }
    );
    if (!response.ok) return;

    const data = (await response.json()) as { version?: string };
    const remoteVersion = data.version?.trim();
    if (!remoteVersion) return;

    const storedVersion = localStorage.getItem(VERSION_STORAGE_KEY);
    if (!storedVersion) {
      localStorage.setItem(VERSION_STORAGE_KEY, remoteVersion);
      return;
    }

    if (storedVersion === remoteVersion) return;

    localStorage.setItem(VERSION_STORAGE_KEY, remoteVersion);
    const url = new URL(import.meta.env.BASE_URL, window.location.origin);
    url.searchParams.set('_v', remoteVersion);
    window.location.replace(url.toString());
  } catch {
    // Offline or version file missing — keep running the cached app.
  }
}
