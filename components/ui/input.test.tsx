import { render, screen } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it } from "vitest";
import { Input } from "./input";

describe("Input", () => {
  it("renders correctly", () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<Input className="custom-input" />);
    expect(screen.getByRole("textbox")).toHaveClass("custom-input");
  });

  it("forwards ref to the input element", () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current).toHaveAttribute("data-slot", "input");
  });

  it("maintains stable ref across re-renders", () => {
    const ref = React.createRef<HTMLInputElement>();
    const { rerender } = render(<Input ref={ref} />);
    const firstRef = ref.current;
    rerender(<Input ref={ref} />);
    expect(ref.current).toBe(firstRef);
  });
});
