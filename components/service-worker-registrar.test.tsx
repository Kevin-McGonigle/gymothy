import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ServiceWorkerRegistrar } from "./service-worker-registrar";

describe("ServiceWorkerRegistrar", () => {
  const registerMock = vi.fn(() =>
    Promise.resolve({} as ServiceWorkerRegistration),
  );

  beforeEach(() => {
    Object.defineProperty(navigator, "serviceWorker", {
      value: { register: registerMock },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    registerMock.mockClear();
  });

  it("renders nothing", () => {
    const { container } = render(<ServiceWorkerRegistrar />);
    expect(container.innerHTML).toBe("");
  });

  it("registers the service worker on mount", async () => {
    render(<ServiceWorkerRegistrar />);

    await vi.waitFor(() => {
      expect(registerMock).toHaveBeenCalledWith("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      });
    });
  });

  it("does not throw when serviceWorker is unavailable", () => {
    Object.defineProperty(navigator, "serviceWorker", {
      value: undefined,
      writable: true,
      configurable: true,
    });

    expect(() => render(<ServiceWorkerRegistrar />)).not.toThrow();
  });
});
