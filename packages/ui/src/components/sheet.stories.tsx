import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "./button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet";

const meta = {
  component: Sheet,
  tags: ["autodocs"],
  title: "UI/Sheet",
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Open settings</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Workspace settings</SheetTitle>
          <SheetDescription>
            Update workspace preferences and configure integrations in one
            place. Changes save automatically.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4 px-4 pb-4 text-sm">
          <div>
            <h4 className="font-medium">Appearance</h4>
            <p className="text-muted-foreground">Pick the theme for your dashboard.</p>
          </div>
          <div>
            <h4 className="font-medium">Integrations</h4>
            <p className="text-muted-foreground">
              Connect Slack, Linear, and GitHub to receive real-time updates.
            </p>
          </div>
        </div>
        <SheetFooter className="border-t">
          <Button variant="secondary">Manage billing</Button>
          <Button>Save changes</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

export const Placement: Story = {
  render: () => (
    <div className="grid gap-4 sm:grid-cols-2">
      {(["left", "right", "top", "bottom"] as const).map((side) => (
        <Sheet key={side}>
          <SheetTrigger asChild>
            <Button variant="ghost" className="capitalize">
              {side} sheet
            </Button>
          </SheetTrigger>
          <SheetContent side={side}>
            <SheetHeader>
              <SheetTitle className="capitalize">{side} drawer</SheetTitle>
              <SheetDescription>
                Each sheet animates from a different edge of the viewport to
                suit your layout.
              </SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      ))}
    </div>
  ),
};
