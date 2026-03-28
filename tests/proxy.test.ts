import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { auth } from "@/lib/auth";
import { proxy } from "../proxy";

vi.mock("next/headers", () => ({
  headers: vi.fn(),
}));

vi.mock("next/server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/server")>();
  return {
    ...actual,
    NextResponse: {
      ...actual.NextResponse,
      redirect: vi.fn((url) => ({
        status: 307,
        url: url.toString(),
        headers: new Headers({ location: url.toString() }),
      })),
      next: vi.fn(() => ({ status: 200 })),
    },
  };
});

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

describe("proxy middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should redirect unauthenticated users to landing page and forward headers", async () => {
    const request = new NextRequest("http://localhost:3000/history");
    const testHeaders = new Headers({ cookie: "session-id=123" });
    (headers as any).mockResolvedValue(testHeaders);
    (auth.api.getSession as any).mockResolvedValue(null);

    const response = await proxy(request);

    expect(auth.api.getSession).toHaveBeenCalledWith({
      headers: testHeaders,
    });
    expect(NextResponse.redirect).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: "/" }),
    );
    expect(response.status).toBe(307);
  });

  it("should handle getSession errors and redirect to landing page", async () => {
    const request = new NextRequest("http://localhost:3000/history");
    (headers as any).mockResolvedValue(new Headers());
    (auth.api.getSession as any).mockRejectedValue(new Error("Auth Down"));

    const response = await proxy(request);

    expect(NextResponse.redirect).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: "/" }),
    );
    expect(response.status).toBe(307);
  });

  it("should allow authenticated users to proceed", async () => {
    const request = new NextRequest("http://localhost:3000/history");
    (headers as any).mockResolvedValue(new Headers());
    (auth.api.getSession as any).mockResolvedValue({ user: { id: "1" } });

    const response = await proxy(request);

    expect(NextResponse.next).toHaveBeenCalled();
    expect(response.status).toBe(200);
  });
});
