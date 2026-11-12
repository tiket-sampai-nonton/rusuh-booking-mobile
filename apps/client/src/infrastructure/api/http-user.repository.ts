/**
 * HttpUserRepository — infrastructure/api (ARCHITECTURE §3, SECURITY; RBT-010).
 *
 * Implements `UserRepository` over the `HttpClient` port. Passwordless OTP +
 * profile. Account-profile calls retain only masked identity; the separate
 * checkout-only endpoint projection returns full email/NIK for transient form
 * state and must never be persisted or logged (SECURITY). Sign-in is optional.
 */

import type {
  AuthSession,
  CheckoutUserDetails,
  UserProfile,
  UserRepository,
} from "@domain/repositories/user.repository";
import type { TokenStorage } from "@domain/auth/token-storage.port";
import { assertOk, unwrap } from "@infrastructure/api/envelope";
import {
  toAuthSession,
  toCheckoutUserDetails,
  toUserProfile,
} from "@infrastructure/api/dto-mappers";
import type { HttpClient } from "@infrastructure/http/http-client";

export class HttpUserRepository implements UserRepository {
  constructor(
    private readonly http: HttpClient,
    private readonly tokenStorage?: TokenStorage,
    private readonly refreshTokenStorage?: TokenStorage,
  ) {}

  private async authHeaders(): Promise<
    Readonly<Record<string, string>> | undefined
  > {
    const token = await this.tokenStorage?.load();
    return token ? { Authorization: `Bearer ${token}` } : undefined;
  }

  async requestOtp(email: string): Promise<void> {
    const res = await this.http.request({
      method: "POST",
      url: "auth/otp/request",
      body: { email },
    });
    assertOk(res);
  }

  async verifyOtp(email: string, code: string): Promise<AuthSession> {
    const res = await this.http.request({
      method: "POST",
      url: "auth/otp/verify",
      body: { email, code },
    });
    const data = unwrap<
      Parameters<typeof toAuthSession>[0] & { refreshToken: string }
    >(res);
    if (data.refreshToken)
      await this.refreshTokenStorage?.save(data.refreshToken);
    return toAuthSession(data);
  }

  async completeRegistration(input: {
    fullName: string;
    nik: string;
  }): Promise<UserProfile> {
    const res = await this.http.request({
      method: "PATCH",
      url: "me",
      headers: await this.authHeaders(),
      body: input,
    });
    return toUserProfile(unwrap<Parameters<typeof toUserProfile>[0]>(res));
  }

  async getMe(): Promise<UserProfile> {
    const res = await this.http.request({
      method: "GET",
      url: "me",
      headers: await this.authHeaders(),
    });
    return toUserProfile(unwrap<Parameters<typeof toUserProfile>[0]>(res));
  }

  async getCheckoutDetails(): Promise<CheckoutUserDetails> {
    const res = await this.http.request({
      method: "GET",
      url: "me",
      headers: await this.authHeaders(),
    });
    return toCheckoutUserDetails(
      unwrap<Parameters<typeof toCheckoutUserDetails>[0]>(res),
    );
  }

  async logout(): Promise<void> {
    const refreshToken = await this.refreshTokenStorage?.load();
    if (refreshToken) {
      const res = await this.http.request({
        method: "POST",
        url: "auth/logout",
        body: { refreshToken },
      });
      assertOk(res);
    }
    await this.refreshTokenStorage?.clear();
    await this.tokenStorage?.clear();
  }
}
