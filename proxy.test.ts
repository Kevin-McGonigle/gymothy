import {
  getRedirectUrl,
  unstable_doesMiddlewareMatch,
} from "next/experimental/testing/server";
import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { config, proxy } from "./proxy";

const BASE_URL = "http://localhost:3000";

function createRequest(path: string, sessionCookie?: string): NextRequest {
  const url = new URL(path, BASE_URL);
  const request = new NextRequest(url);
  if (sessionCookie) {
    request.cookies.set("better-auth.session_token", sessionCookie);
  }
  return request;
}

describe("proxy", () => {
  describe("config matcher", () => {
    it("matches /routines", () => {
      expect(unstable_doesMiddlewareMatch({ config, url: "/routines" })).toBe(
        true,
      );
    });

    it("matches /routines/:id", () => {
      expect(
        unstable_doesMiddlewareMatch({ config, url: "/routines/abc-123" }),
      ).toBe(true);
    });

    it("matches /workout/new", () => {
      expect(
        unstable_doesMiddlewareMatch({ config, url: "/workout/new" }),
      ).toBe(true);
    });

    it("matches /workout/:id", () => {
      expect(
        unstable_doesMiddlewareMatch({ config, url: "/workout/abc-123" }),
      ).toBe(true);
    });

    it("matches /settings", () => {
      expect(unstable_doesMiddlewareMatch({ config, url: "/settings" })).toBe(
        true,
      );
    });

    it("matches /settings/:path", () => {
      expect(
        unstable_doesMiddlewareMatch({ config, url: "/settings/account" }),
      ).toBe(true);
    });

    it("matches /login", () => {
      expect(unstable_doesMiddlewareMatch({ config, url: "/login" })).toBe(
        true,
      );
    });

    it("matches /signup", () => {
      expect(unstable_doesMiddlewareMatch({ config, url: "/signup" })).toBe(
        true,
      );
    });

    it("does not match /", () => {
      expect(unstable_doesMiddlewareMatch({ config, url: "/" })).toBe(false);
    });

    it("does not match /history", () => {
      expect(unstable_doesMiddlewareMatch({ config, url: "/history" })).toBe(
        false,
      );
    });

    it("does not match /exercises", () => {
      expect(unstable_doesMiddlewareMatch({ config, url: "/exercises" })).toBe(
        false,
      );
    });

    it("does not match /api/auth paths", () => {
      expect(
        unstable_doesMiddlewareMatch({ config, url: "/api/auth/session" }),
      ).toBe(false);
    });
  });

  describe("unauthenticated", () => {
    it("redirects protected route to /login", () => {
      const response = proxy(createRequest("/routines"));
      expect(getRedirectUrl(response)).toBe(`${BASE_URL}/login`);
    });

    it("redirects /workout/new to /login", () => {
      const response = proxy(createRequest("/workout/new"));
      expect(getRedirectUrl(response)).toBe(`${BASE_URL}/login`);
    });

    it("redirects /settings to /login", () => {
      const response = proxy(createRequest("/settings"));
      expect(getRedirectUrl(response)).toBe(`${BASE_URL}/login`);
    });

    it("redirects nested protected paths to /login", () => {
      expect(getRedirectUrl(proxy(createRequest("/routines/abc-123")))).toBe(
        `${BASE_URL}/login`,
      );
      expect(getRedirectUrl(proxy(createRequest("/settings/account")))).toBe(
        `${BASE_URL}/login`,
      );
    });

    it("allows /login through", () => {
      const response = proxy(createRequest("/login"));
      expect(getRedirectUrl(response)).toBeNull();
    });

    it("allows /signup through", () => {
      const response = proxy(createRequest("/signup"));
      expect(getRedirectUrl(response)).toBeNull();
    });
  });

  describe("authenticated", () => {
    const SESSION = "fake-session-token";

    it("redirects /login to /", () => {
      const response = proxy(createRequest("/login", SESSION));
      expect(getRedirectUrl(response)).toBe(`${BASE_URL}/`);
    });

    it("redirects /signup to /", () => {
      const response = proxy(createRequest("/signup", SESSION));
      expect(getRedirectUrl(response)).toBe(`${BASE_URL}/`);
    });

    it("allows /routines through", () => {
      const response = proxy(createRequest("/routines", SESSION));
      expect(getRedirectUrl(response)).toBeNull();
    });

    it("allows /workout/new through", () => {
      const response = proxy(createRequest("/workout/new", SESSION));
      expect(getRedirectUrl(response)).toBeNull();
    });

    it("allows /settings through", () => {
      const response = proxy(createRequest("/settings", SESSION));
      expect(getRedirectUrl(response)).toBeNull();
    });

    it("allows nested protected paths through", () => {
      expect(
        getRedirectUrl(proxy(createRequest("/routines/abc-123", SESSION))),
      ).toBeNull();
      expect(
        getRedirectUrl(proxy(createRequest("/settings/account", SESSION))),
      ).toBeNull();
    });
  });
});
