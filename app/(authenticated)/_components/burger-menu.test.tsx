import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ROUTES } from "@/shared/constants";
import { BurgerMenu } from "./burger-menu";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockSignOut = vi.fn(() => Promise.resolve());

vi.mock("@/modules/auth/client", () => ({
  signOut: () => mockSignOut(),
}));

describe("BurgerMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders a menu trigger button", () => {
    render(<BurgerMenu />);

    expect(screen.getByRole("button", { name: /menu/i })).toBeInTheDocument();
  });

  it("opens menu with Settings and Sign Out items on click", async () => {
    const user = userEvent.setup();
    render(<BurgerMenu />);

    await user.click(screen.getByRole("button", { name: /menu/i }));

    await waitFor(() => {
      expect(
        screen.getByRole("menuitem", { name: /settings/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("menuitem", { name: /sign out/i }),
      ).toBeInTheDocument();
    });
  });

  it("links Settings to /settings", async () => {
    const user = userEvent.setup();
    render(<BurgerMenu />);

    await user.click(screen.getByRole("button", { name: /menu/i }));

    await waitFor(() => {
      const settingsItem = screen.getByRole("menuitem", {
        name: /settings/i,
      });
      expect(settingsItem.closest("a")).toHaveAttribute(
        "href",
        ROUTES.SETTINGS,
      );
    });
  });

  it("calls signOut and redirects to /login", async () => {
    const user = userEvent.setup();
    render(<BurgerMenu />);

    await user.click(screen.getByRole("button", { name: /menu/i }));

    await waitFor(() => {
      expect(
        screen.getByRole("menuitem", { name: /sign out/i }),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole("menuitem", { name: /sign out/i }));

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith(ROUTES.LOGIN);
    });
  });

  it("redirects to login even when signOut fails", async () => {
    mockSignOut.mockRejectedValueOnce(new Error("network error"));
    const user = userEvent.setup();
    render(<BurgerMenu />);

    await user.click(screen.getByRole("button", { name: /menu/i }));

    await waitFor(() => {
      expect(
        screen.getByRole("menuitem", { name: /sign out/i }),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole("menuitem", { name: /sign out/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(ROUTES.LOGIN);
    });
  });
});
