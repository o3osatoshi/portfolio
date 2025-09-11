import { Button } from "@o3osatoshi/ui";
import type { Meta, StoryObj } from "@storybook/react";

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

  tags: ["autodocs"],

  title: "UI/Button",
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: "Default", variant: "default" },
};

export const Destructive: Story = {
  args: { children: "Destructive", variant: "destructive" },
};

export const Outline: Story = {
  args: { children: "Outline", variant: "outline" },
};

export const Secondary: Story = {
  args: { children: "Secondary", variant: "secondary" },
};

export const Ghost: Story = {
  args: { children: "Ghost", variant: "ghost" },
};

export const Link: Story = {
  args: { children: "Link", variant: "link" },
};

export const Small: Story = {
  args: { children: "Small", size: "sm" },
};

export const Large: Story = {
  args: { children: "Large", size: "lg" },
};

export const Icon: Story = {
  args: { children: "★", size: "icon" },
};
