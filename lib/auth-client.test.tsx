import { renderHook } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";

// Mock config before importing auth-client
vi.mock("./config", () => ({
  config: {
    auth: {
      url: "http://localhost:3000",
      secret: "mock_secret_at_least_32_characters_long",
    },
    db: {
      url: "file:local.db",
    },
  },
}));

// Define the mock session data
const mockSession = {
  data: {
    user: {
      id: "user_123",
      email: "test@example.com",
      name: "Test User",
      emailVerified: true,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    session: {
      id: "session_123",
      userId: "user_123",
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      token: "mock_token",
      createdAt: new Date(),
      updatedAt: new Date(),
      ipAddress: "127.0.0.1",
      userAgent: "vitest",
    },
  },
  isPending: false,
  error: null,
};

// Set up MSW server to test behavioral contract
const server = setupServer(
  http.get("http://localhost:3000/api/auth/get-session", () => {
    return HttpResponse.json(mockSession.data);
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

vi.mock("better-auth/react", () => {
  const original = vi.importActual("better-auth/react");
  return {
    ...original,
    createAuthClient: vi.fn((_config) => {
      return {
        useSession: vi.fn(() => ({
          data: mockSession.data,
          isPending: false,
          error: null,
        })),
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
      };
    }),
  };
});

import { createAuthClient } from "better-auth/react";
import { authClient, signIn, signOut, signUp, useSession } from "./auth-client";
import { config } from "./config";

describe("authClient", () => {
  it("should be initialized with baseURL from config", () => {
    expect(createAuthClient).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: config.auth.url,
      }),
    );
  });

  it("should be defined", () => {
    expect(authClient).toBeDefined();
  });

  it("should export useSession hook with reactive state", async () => {
    expect(useSession).toBeDefined();
    expect(typeof useSession).toBe("function");

    const { result } = renderHook(() => useSession());

    expect(result.current.isPending).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.data?.user.name).toBe("Test User");
    expect(result.current.data?.user.email).toBe("test@example.com");
  });

  it("should export authentication methods", () => {
    expect(signIn).toBeDefined();
    expect(typeof signIn).toBe("function");
    expect(signUp).toBeDefined();
    expect(typeof signUp).toBe("function");
    expect(signOut).toBeDefined();
    expect(typeof signOut).toBe("function");
  });
});
