import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/font/google", () => ({
  Figtree: () => ({
    variable: "--font-sans",
    className: "mock-figtree",
  }),
}));

vi.mock("@/components/service-worker-registrar", () => ({
  ServiceWorkerRegistrar: () => <div data-testid="sw-registrar" />,
}));

import RootLayout from "./layout";

describe("RootLayout", () => {
  it("renders children", () => {
    render(
      <RootLayout>
        <div data-testid="child">Hello</div>
      </RootLayout>,
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("includes the ServiceWorkerRegistrar", () => {
    render(
      <RootLayout>
        <div>Content</div>
      </RootLayout>,
    );
    expect(screen.getByTestId("sw-registrar")).toBeInTheDocument();
  });
});
