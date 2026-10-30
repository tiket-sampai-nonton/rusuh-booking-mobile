/**
 * HttpUserRepository — infrastructure/api (ARCHITECTURE §3, SECURITY; RBT-010).
 *
 * Implements `UserRepository` over the `HttpClient` port. Passwordless OTP +
 * profile. The FE only ever handles a MASKED NIK — a raw NIK is never logged or
 * stored here (SECURITY). Sign-in is optional (D8.5); these calls are only made
 * when the user chooses to authenticate.
 */

import type {
  AuthSession,
  UserProfile,
  UserRepository,
} from "@domain/repositories/user.repository";
import { assertOk, unwrap } from "@infrastructure/api/envelope";
import { toAuthSession, toUserProfile } from "@infrastructure/api/dto-mappers";
import type { HttpClient } from "@infrastructure/http/http-client";

export class HttpUserRepository implements UserRepository {
  constructor(private readonly http: HttpClient) {}

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
    return toAuthSession(unwrap<Parameters<typeof toAuthSession>[0]>(res));
  }

  async completeRegistration(input: {
    fullName: string;
    nik: string;
  }): Promise<UserProfile> {
    const res = await this.http.request({
      method: "PATCH",
      url: "me",
      body: input,
    });
    return toUserProfile(unwrap<Parameters<typeof toUserProfile>[0]>(res));
  }

  async getMe(): Promise<UserProfile> {
    const res = await this.http.request({ method: "GET", url: "me" });
    return toUserProfile(unwrap<Parameters<typeof toUserProfile>[0]>(res));
  }
}
