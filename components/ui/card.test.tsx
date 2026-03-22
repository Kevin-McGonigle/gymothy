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

  it("renders as a div by default", () => {
    const { container } = render(<Card>Content</Card>);
    expect(container.firstChild?.nodeName).toBe("DIV");
  });

  it("renders as a button when passed a button element to render prop", () => {
    render(<Card render={<button type="button" />}>Click me</Card>);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button.nodeName).toBe("BUTTON");
    expect(button).toHaveTextContent("Click me");
  });

  it("renders as a link when passed an anchor element to render prop", () => {
    render(<Card render={<a href="/test">Link Content</a>}>Link</Card>);
    const link = screen.getByRole("link");
    expect(link).toBeInTheDocument();
    expect(link.nodeName).toBe("A");
    expect(link).toHaveAttribute("href", "/test");
  });

  it("merges class names correctly", () => {
    render(
      <Card
        className="extra-class"
        render={<button type="button" className="button-class" />}
      >
        Content
      </Card>,
    );
    const button = screen.getByRole("button");
    expect(button).toHaveClass("extra-class");
    expect(button).toHaveClass("button-class");
  });

  it("sets data-slot and data-size attributes via useRender state", () => {
    render(<Card size="sm">Content</Card>);
    const card = screen.getByText("Content");
    expect(card).toHaveAttribute("data-slot", "card");
    expect(card).toHaveAttribute("data-size", "sm");
  });

  it("forwards ref to the Card element", () => {
    const ref = React.createRef<HTMLElement>();
    render(<Card ref={ref}>Content</Card>);
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current).toHaveAttribute("data-slot", "card");
  });

  it("maintains stable ref across re-renders", () => {
    const ref = React.createRef<HTMLElement>();
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
