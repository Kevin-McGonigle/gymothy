import { render, screen } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it } from "vitest";
import { Spinner } from "./spinner";

describe("Spinner", () => {
  it("renders correctly with status role", () => {
    render(<Spinner />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("forwards ref to the svg element", () => {
    const ref = React.createRef<SVGSVGElement>();
    render(<Spinner ref={ref} />);
    expect(ref.current).toBeInstanceOf(SVGSVGElement);
    expect(ref.current).toHaveAttribute("data-slot", "spinner");
  });

  it("maintains stable ref across re-renders", () => {
    const ref = React.createRef<SVGSVGElement>();
    const { rerender } = render(<Spinner ref={ref} />);
    const firstRef = ref.current;
    rerender(<Spinner ref={ref} />);
    expect(ref.current).toBe(firstRef);
  });
});
