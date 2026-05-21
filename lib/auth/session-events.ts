export const SESSION_EXPIRED_EVENT = 'session:expired';
export const SESSION_CLEARED_EVENT = 'session:cleared';

export function emitSessionExpired() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
}

export function emitSessionCleared() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(SESSION_CLEARED_EVENT));
}
