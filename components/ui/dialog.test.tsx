import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";

function renderDialog({
  showCloseButton = true,
  showFooterClose = false,
}: {
  showCloseButton?: boolean;
  showFooterClose?: boolean;
} = {}) {
  return render(
    <Dialog open>
      <DialogTrigger>Open</DialogTrigger>
      <DialogContent showCloseButton={showCloseButton}>
        <DialogHeader>
          <DialogTitle>Test Title</DialogTitle>
          <DialogDescription>Test Description</DialogDescription>
        </DialogHeader>
        <DialogFooter showCloseButton={showFooterClose}>
          <button type="button">Confirm</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>,
  );
}

describe("Dialog", () => {
  it("renders title and description when open", () => {
    renderDialog();
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
  });

  it("renders close button by default", () => {
    renderDialog();
    expect(screen.getByRole("button", { name: /close/i })).toBeInTheDocument();
  });

  it("hides close button when showCloseButton is false", () => {
    renderDialog({ showCloseButton: false });
    expect(
      screen.queryByRole("button", { name: /close/i }),
    ).not.toBeInTheDocument();
  });

  it("renders footer close button when showCloseButton is true", () => {
    renderDialog({ showFooterClose: true });
    const closeButtons = screen.getAllByRole("button", { name: /close/i });
    expect(closeButtons.length).toBeGreaterThanOrEqual(2);
  });

  it("renders footer children", () => {
    renderDialog();
    expect(
      screen.getByRole("button", { name: /confirm/i }),
    ).toBeInTheDocument();
  });

  it("has correct data-slot attributes", () => {
    renderDialog();
    expect(
      document.querySelector('[data-slot="dialog-content"]'),
    ).toBeInTheDocument();
    expect(
      document.querySelector('[data-slot="dialog-header"]'),
    ).toBeInTheDocument();
    expect(
      document.querySelector('[data-slot="dialog-title"]'),
    ).toBeInTheDocument();
    expect(
      document.querySelector('[data-slot="dialog-description"]'),
    ).toBeInTheDocument();
    expect(
      document.querySelector('[data-slot="dialog-footer"]'),
    ).toBeInTheDocument();
  });
});
