import { render, screen } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it } from "vitest";
import { Button } from "./button";

describe("Button", () => {
  it("renders correctly with children", () => {
    render(<Button>Click me</Button>);
    expect(
      screen.getByRole("button", { name: /click me/i }),
    ).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<Button className="custom-class">Click me</Button>);
    expect(screen.getByRole("button")).toHaveClass("custom-class");
  });

  it("forwards ref to the button element", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Click me</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(ref.current).toHaveAttribute("data-slot", "button");
  });

  it("maintains stable ref across re-renders", () => {
    const ref = React.createRef<HTMLButtonElement>();
    const { rerender } = render(<Button ref={ref}>Click me</Button>);
    const firstRef = ref.current;
    rerender(<Button ref={ref}>Click again</Button>);
    expect(ref.current).toBe(firstRef);
  });
});
