import { render, screen } from "@testing-library/react";
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
});
