import { cookies } from 'next/headers';
import { AuthClient, TransactionStore } from '@auth0/nextjs-auth0/server';
import { AbstractSessionStore } from '@auth0/nextjs-auth0/server';
import * as jose from 'jose';

// Create a simple session store implementation
class SimpleSessionStore extends AbstractSessionStore {
  constructor(secret: string) {
    super({
      secret,
      rolling: true,
      absoluteDuration: 7 * 24 * 60 * 60, // 7 days
      inactivityDuration: 24 * 60 * 60, // 24 hours
    });
  }

  private async getDerivedKey() {
    const encoder = new TextEncoder();
    const keyMaterial = encoder.encode(this.secret);

    const key = await crypto.subtle.importKey(
      'raw',
      keyMaterial,
      'HKDF',
      false,
      ['deriveBits']
    );

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'HKDF',
        hash: 'SHA-256',
        salt: encoder.encode('auth0-session'),
        info: encoder.encode(''),
      },
      key,
      256
    );

    return new Uint8Array(derivedBits);
  }

  async get(reqCookies: any) {
    try {
      const cookie = reqCookies.get(this.sessionCookieName);
      if (!cookie?.value) return null;

      const secretKey = await this.getDerivedKey();
      const { payload } = await jose.jwtDecrypt(cookie.value, secretKey);
      return payload as any;
    } catch {
      return null;
    }
  }

  async set(reqCookies: any, resCookies: any, session: any) {
    const secretKey = await this.getDerivedKey();
    const maxAge = this.calculateMaxAge(session.internal?.createdAt || this.epoch());

    const token = await new jose.EncryptJWT(session as any)
      .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
      .setIssuedAt()
      .setExpirationTime(`${maxAge}s`)
      .encrypt(secretKey);

    resCookies.set(this.sessionCookieName, token, {
      ...this.cookieConfig,
      maxAge,
    });
  }

  async delete(reqCookies: any, resCookies: any) {
    resCookies.delete(this.sessionCookieName);
  }
}

const transactionStore = new TransactionStore({
  secret: process.env.AUTH0_SECRET!,
});

const sessionStore = new SimpleSessionStore(process.env.AUTH0_SECRET!);

const auth0 = new AuthClient({
  secret: process.env.AUTH0_SECRET!,
  domain: process.env.AUTH0_ISSUER_BASE_URL!.replace('https://', ''),
  clientId: process.env.AUTH0_CLIENT_ID!,
  clientSecret: process.env.AUTH0_CLIENT_SECRET!,
  appBaseUrl: process.env.AUTH0_BASE_URL!,
  routes: {
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    callback: '/api/auth/callback',
    profile: '/api/auth/me',
    accessToken: '/api/auth/access-token',
    backChannelLogout: '/api/auth/backchannel-logout',
    connectAccount: '/api/auth/connect-account',
  },
  transactionStore,
  sessionStore,
});

export async function getSession() {
  try {
    const cookieStore = await cookies();
    const session = await sessionStore.get(cookieStore as any);
    return session;
  } catch (error) {
    return null;
  }
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session;
}
