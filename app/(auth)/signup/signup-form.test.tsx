import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import type { SignUpState } from "./actions";
import { SignUpForm } from "./signup-form";

const noopAction = async () => null;

describe("SignUpForm", () => {
  it("renders email, password, and submit button", () => {
    render(<SignUpForm action={noopAction} />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign up/i }),
    ).toBeInTheDocument();
  });

  it("renders link to login page", () => {
    render(<SignUpForm action={noopAction} />);

    const link = screen.getByRole("link", { name: /sign in/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/login");
  });

  it("displays error message from action", async () => {
    const errorAction = async () => ({ error: "Email already registered" });
    const user = userEvent.setup();

    render(<SignUpForm action={errorAction} />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Email already registered",
      );
    });
  });

  it("passes form data to the action", async () => {
    let receivedFormData: FormData | null = null;
    const captureAction = async (_prev: SignUpState, formData: FormData) => {
      receivedFormData = formData;
      return null;
    };
    const user = userEvent.setup();

    render(<SignUpForm action={captureAction} />);

    await user.type(screen.getByLabelText(/email/i), "new@example.com");
    await user.type(screen.getByLabelText(/password/i), "secret123");
    await user.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(receivedFormData?.get("email")).toBe("new@example.com");
      expect(receivedFormData?.get("password")).toBe("secret123");
    });
  });

  it("disables button while submitting", async () => {
    const pendingAction = () => new Promise<null>(() => {});
    const user = userEvent.setup();

    render(<SignUpForm action={pendingAction} />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByRole("button")).toBeDisabled();
    });
  });
});
