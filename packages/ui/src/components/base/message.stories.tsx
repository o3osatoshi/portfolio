import type { Meta, StoryObj } from "@storybook/react-vite";

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

export const Default: Story = {};

export const Destructive: Story = {
  args: {
    variant: "destructive",
  },
};

export const Hidden: Story = {
  args: {
    children: undefined,
  },
};
