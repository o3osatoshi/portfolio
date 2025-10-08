import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "@storybook/test";

import { Message } from "./message";

const meta = {
  args: {
    children: "Something went wrong. Try again in a moment.",
    variant: "default",
  },
  component: Message,
  tags: ["autodocs"],
  title: "UI/Base/Message",
} satisfies Meta<typeof Message>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const alert = await canvas.findByRole("alert");

    expect(alert).toHaveTextContent(
      "Something went wrong. Try again in a moment.",
    );
  },
};

export const Destructive: Story = {
  args: {
    variant: "destructive",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const alert = await canvas.findByRole("alert");

    expect(alert).toHaveTextContent(
      "Something went wrong. Try again in a moment.",
    );
  },
};

export const Hidden: Story = {
  args: {
    children: undefined,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(canvas.queryByRole("alert")).toBeNull();
  },
};
