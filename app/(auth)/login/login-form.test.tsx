import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import type { SignInState } from "./actions";
import { LoginForm } from "./login-form";

const noopAction = async () => null;

describe("LoginForm", () => {
  it("renders email, password, and submit button", () => {
    render(<LoginForm action={noopAction} />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i }),
    ).toBeInTheDocument();
  });

  it("renders link to signup page", () => {
    render(<LoginForm action={noopAction} />);

    const link = screen.getByRole("link", { name: /sign up/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/signup");
  });

  it("displays error message from action", async () => {
    const errorAction = async () => ({ error: "Invalid credentials" });
    const user = userEvent.setup();

    render(<LoginForm action={errorAction} />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Invalid credentials",
      );
    });
  });

  it("passes form data to the action", async () => {
    let receivedFormData: FormData | null = null;
    const captureAction = async (_prev: SignInState, formData: FormData) => {
      receivedFormData = formData;
      return null;
    };
    const user = userEvent.setup();

    render(<LoginForm action={captureAction} />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "secret123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(receivedFormData?.get("email")).toBe("test@example.com");
      expect(receivedFormData?.get("password")).toBe("secret123");
    });
  });

  it("disables button while submitting", async () => {
    const pendingAction = () => new Promise<null>(() => {});
    const user = userEvent.setup();

    render(<LoginForm action={pendingAction} />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByRole("button")).toBeDisabled();
    });
  });
});
