import { render, screen } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it } from "vitest";
import { Badge } from "./badge";

describe("Badge", () => {
  it("renders correctly with children", () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("forwards ref to the span element", () => {
    const ref = React.createRef<HTMLSpanElement>();
    render(<Badge ref={ref}>Active</Badge>);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    expect(ref.current).toHaveAttribute("data-slot", "badge");
  });

  it("maintains stable ref across re-renders", () => {
    const ref = React.createRef<HTMLSpanElement>();
    const { rerender } = render(<Badge ref={ref}>Active</Badge>);
    const firstRef = ref.current;
    rerender(<Badge ref={ref}>Inactive</Badge>);
    expect(ref.current).toBe(firstRef);
  });
});
