import { render, screen } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it } from "vitest";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "./empty";

describe("Empty", () => {
  it("renders correctly with children", () => {
    render(<Empty>No results</Empty>);
    expect(screen.getByText("No results")).toBeInTheDocument();
  });

  it("forwards ref to the root element", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Empty ref={ref}>Content</Empty>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveAttribute("data-slot", "empty");
  });

  it("forwards ref to EmptyHeader", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<EmptyHeader ref={ref}>Header</EmptyHeader>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveAttribute("data-slot", "empty-header");
  });

  it("forwards ref to EmptyMedia", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<EmptyMedia ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveAttribute("data-slot", "empty-media");
  });

  it("forwards ref to EmptyTitle", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<EmptyTitle ref={ref}>Title</EmptyTitle>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveAttribute("data-slot", "empty-title");
  });

  it("forwards ref to EmptyDescription", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<EmptyDescription ref={ref}>Description</EmptyDescription>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveAttribute("data-slot", "empty-description");
  });

  it("forwards ref to EmptyContent", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<EmptyContent ref={ref}>Content</EmptyContent>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveAttribute("data-slot", "empty-content");
  });

  it("maintains stable ref across re-renders", () => {
    const ref = React.createRef<HTMLDivElement>();
    const { rerender } = render(<Empty ref={ref}>Content</Empty>);
    const firstRef = ref.current;
    rerender(<Empty ref={ref}>Updated</Empty>);
    expect(ref.current).toBe(firstRef);
  });
});
