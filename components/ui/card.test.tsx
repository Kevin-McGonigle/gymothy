import { render, screen } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it } from "vitest";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";

describe("Card", () => {
  it("renders correctly with children", () => {
    render(<Card>Card Content</Card>);
    expect(screen.getByText("Card Content")).toBeInTheDocument();
  });

  it("forwards ref to the Card element", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Card ref={ref}>Content</Card>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveAttribute("data-slot", "card");
  });

  it("maintains stable ref across re-renders", () => {
    const ref = React.createRef<HTMLDivElement>();
    const { rerender } = render(<Card ref={ref}>Content</Card>);
    const firstRef = ref.current;
    rerender(<Card ref={ref}>New Content</Card>);
    expect(ref.current).toBe(firstRef);
  });

  it("forwards ref to CardHeader", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<CardHeader ref={ref}>Header</CardHeader>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveAttribute("data-slot", "card-header");
  });

  it("forwards ref to CardTitle", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<CardTitle ref={ref}>Title</CardTitle>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveAttribute("data-slot", "card-title");
  });

  it("forwards ref to CardDescription", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<CardDescription ref={ref}>Description</CardDescription>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveAttribute("data-slot", "card-description");
  });

  it("forwards ref to CardAction", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<CardAction ref={ref}>Action</CardAction>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveAttribute("data-slot", "card-action");
  });

  it("forwards ref to CardContent", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<CardContent ref={ref}>Content</CardContent>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveAttribute("data-slot", "card-content");
  });

  it("forwards ref to CardFooter", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<CardFooter ref={ref}>Footer</CardFooter>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveAttribute("data-slot", "card-footer");
  });
});
