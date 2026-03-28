import { render } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it } from "vitest";
import { Skeleton } from "./skeleton";

describe("Skeleton", () => {
  it("renders correctly", () => {
    const { container } = render(<Skeleton className="w-10 h-10" />);
    expect(container.firstChild).toHaveAttribute("data-slot", "skeleton");
  });

  it("forwards ref to the div element", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Skeleton ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveAttribute("data-slot", "skeleton");
  });

  it("maintains stable ref across re-renders", () => {
    const ref = React.createRef<HTMLDivElement>();
    const { rerender } = render(<Skeleton ref={ref} />);
    const firstRef = ref.current;
    rerender(<Skeleton ref={ref} />);
    expect(ref.current).toBe(firstRef);
  });
});
