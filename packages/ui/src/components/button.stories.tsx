import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "@storybook/test";

import { Button } from "./button";

const meta = {
  args: {
    children: "Button",
    size: "default",
    variant: "default",
  },
  argTypes: {
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon"],
    },
    variant: {
      control: "select",
      options: [
        "default",
        "destructive",
        "outline",
        "secondary",
        "ghost",
        "link",
      ],
    },
  },
  component: Button,

  title: "UI/Button",
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

const makePlay =
  (name: string) =>
  async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name });

    expect(button).toBeVisible();

    await userEvent.click(button);
  };

export const Default: Story = {
  args: { children: "Default", variant: "default" },
  play: makePlay("Default"),
};

export const Destructive: Story = {
  args: { children: "Destructive", variant: "destructive" },
  play: makePlay("Destructive"),
};

export const Outline: Story = {
  args: { children: "Outline", variant: "outline" },
  play: makePlay("Outline"),
};

export const Secondary: Story = {
  args: { children: "Secondary", variant: "secondary" },
  play: makePlay("Secondary"),
};

export const Ghost: Story = {
  args: { children: "Ghost", variant: "ghost" },
  play: makePlay("Ghost"),
};

export const Link: Story = {
  args: { children: "Link", variant: "link" },
  play: makePlay("Link"),
};

export const Small: Story = {
  args: { children: "Small", size: "sm" },
  play: makePlay("Small"),
};

export const Large: Story = {
  args: { children: "Large", size: "lg" },
  play: makePlay("Large"),
};

export const Icon: Story = {
  args: { children: "★", size: "icon" },
  play: makePlay("★"),
};
