/**
 * Kaset Pro redeem codes (e.g. for subscribers migrating from the suspended legacy app).
 * A code grants Pro until a fixed expiry date. The server (play-rtdn-notifier /api/redeem) binds a code
 * to this install's random ID and limits how many installs can use it.
 *
 * Must not import QuotaService (QuotaService imports this module).
 */

import axios from 'axios';
import { createMMKV } from 'react-native-mmkv';
import { REDEEM_API_URL } from '../../constants/redeemInfo';

const storage = createMMKV({ id: 'redeem-storage' });

const KEYS = {
  INSTALL_ID: 'install_id',
  CODE: 'code',
  EXPIRES_AT: 'expires_at',
};

export type RedeemError =
  | 'bad_request'
  | 'rate_limited'
  | 'invalid'
  | 'revoked'
  | 'expired'
  | 'used'
  | 'network'
  | 'server_error';

export type RedeemResult = { ok: true; expiresAt: string } | { ok: false; error: RedeemError };

/** Server answers that mean the stored code must no longer grant Pro. */
const TERMINAL_ERRORS: RedeemError[] = ['invalid', 'revoked', 'expired', 'used'];

const listeners: Set<() => void> = new Set();

function notify(): void {
  listeners.forEach(cb => cb());
}

function randomHex(bytes: number): string {
  const values = new Uint8Array(bytes);
  const cryptoObj = (globalThis as { crypto?: { getRandomValues?: (a: Uint8Array) => Uint8Array } }).crypto;
  if (cryptoObj?.getRandomValues) {
    cryptoObj.getRandomValues(values);
  } else {
    for (let i = 0; i < bytes; i++) values[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(values, b => b.toString(16).padStart(2, '0')).join('');
}

/** Normalizes user input: uppercase, no spaces, adds dashes for "KASETXXXXXXXXXXXX". */
export function normalizeCode(input: string): string {
  const raw = input.toUpperCase().replaceAll(/[^A-Z0-9]/g, '');
  if (raw.startsWith('KASET') && raw.length === 17) {
    return `KASET-${raw.slice(5, 9)}-${raw.slice(9, 13)}-${raw.slice(13, 17)}`;
  }
  return input.trim().toUpperCase().replaceAll(/\s+/g, '');
}

async function callRedeem(code: string): Promise<RedeemResult> {
  try {
    const res = await axios.post(
      REDEEM_API_URL,
      { code, installId: RedeemService.getInstallId() },
      { timeout: 10000, validateStatus: () => true },
    );
    const data = res.data ?? {};
    if (res.status === 200 && data.ok && typeof data.expiresAt === 'string') {
      return { ok: true, expiresAt: data.expiresAt };
    }
    return { ok: false, error: (data.error as RedeemError) ?? 'server_error' };
  } catch {
    return { ok: false, error: 'network' };
  }
}

export const RedeemService = {
  /** Random per-install ID (not a hardware ID). Created on first use. */
  getInstallId(): string {
    let id = storage.getString(KEYS.INSTALL_ID);
    if (!id) {
      id = `k-${randomHex(16)}`;
      storage.set(KEYS.INSTALL_ID, id);
    }
    return id;
  },

  getCode(): string | undefined {
    return storage.getString(KEYS.CODE) || undefined;
  },

  getExpiresAt(): string | undefined {
    return storage.getString(KEYS.EXPIRES_AT) || undefined;
  },

  /** True while a redeemed code's expiry is in the future. */
  isActive(): boolean {
    const expiresAt = this.getExpiresAt();
    return !!expiresAt && Date.parse(expiresAt) > Date.now();
  },

  async redeem(input: string): Promise<RedeemResult> {
    const code = normalizeCode(input);
    const result = await callRedeem(code);
    if (result.ok) {
      storage.set(KEYS.CODE, code);
      storage.set(KEYS.EXPIRES_AT, result.expiresAt);
      notify();
    }
    return result;
  },

  /**
   * Re-checks the stored code with the server (e.g. on app start). Clears it if the server says it is
   * revoked/expired/invalid; keeps the local expiry when offline or rate limited.
   */
  async revalidate(): Promise<void> {
    const code = this.getCode();
    if (!code) return;
    const result = await callRedeem(code);
    if (result.ok) {
      storage.set(KEYS.EXPIRES_AT, result.expiresAt);
      notify();
    } else if (TERMINAL_ERRORS.includes(result.error)) {
      storage.remove(KEYS.CODE);
      storage.remove(KEYS.EXPIRES_AT);
      notify();
    }
  },

  addListener(cb: () => void): () => void {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },
};
