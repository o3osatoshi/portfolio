import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { expect } from "@storybook/test";
import { within } from "@storybook/testing-library";
import userEvent from "@testing-library/user-event";

import { Button } from "@/components/ui/button/button";

const meta = {
  title: "shadcn/Button",
  component: Button,
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "light",
      values: [
        { name: "light", value: "#ffffff" },
        { name: "dark", value: "#000000" },
      ],
    },
  },
  tags: ["autodocs"],
  argTypes: {
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
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon"],
    },
  },
  args: {
    onClick: fn(),
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Button",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Button" });

    await userEvent.tab();
    await expect(button).toHaveFocus();

    await userEvent.click(button);
    await expect(button).toBeInTheDocument();
  },
};

export const Destructive: Story = {
  args: {
    children: "Button",
    variant: "destructive",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Button" });

    await userEvent.click(button);
    await expect(button).toBeInTheDocument();
  },
};

export const Outline: Story = {
  args: {
    children: "Button",
    variant: "outline",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Button" });

    await userEvent.click(button);
    await expect(button).toBeInTheDocument();
  },
};

export const Secondary: Story = {
  args: {
    children: "Button",
    variant: "secondary",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Button" });

    await userEvent.click(button);
    await expect(button).toBeInTheDocument();
  },
};

export const Ghost: Story = {
  args: {
    children: "Button",
    variant: "secondary",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Button" });

    await userEvent.click(button);
    await expect(button).toBeInTheDocument();
  },
};

export const Link: Story = {
  args: {
    children: "Button",
    variant: "link",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Button" });

    await userEvent.click(button);
    await expect(button).toBeInTheDocument();
  },
};

export const Small: Story = {
  args: {
    children: "Button",
    size: "sm",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Button" });

    await userEvent.click(button);
    await expect(button).toBeInTheDocument();
  },
};

export const Large: Story = {
  args: {
    children: "Button",
    size: "lg",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Button" });

    await userEvent.click(button);
    await expect(button).toBeInTheDocument();
  },
};

export const Icon: Story = {
  args: {
    children: "Button",
    size: "icon",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Button" });

    await userEvent.click(button);
    await expect(button).toBeInTheDocument();
  },
};

export const Disabled: Story = {
  args: {
    children: "Button",
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Button" });

    await expect(button).toBeDisabled();
  },
};
