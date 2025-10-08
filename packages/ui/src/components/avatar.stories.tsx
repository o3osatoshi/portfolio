import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor, within } from "@storybook/test";
import type * as React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

const meta = {
  component: Avatar,
  tags: ["autodocs"],
  title: "UI/Avatar",
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

const renderAvatar = (args: React.ComponentProps<typeof Avatar>) => (
  <Avatar {...args}>
    <AvatarImage alt="Satoshi Nakamoto" src="https://i.pravatar.cc/64?img=8" />
    <AvatarFallback>SN</AvatarFallback>
  </Avatar>
);

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const image = canvas.getByRole("img", { name: "Satoshi Nakamoto" });

    expect(image).toBeInTheDocument();
  },
  render: renderAvatar,
};

export const WithFallback: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const image = canvas.getByRole("img", { name: "Offline user" });

    image.dispatchEvent(new Event("error"));

    await waitFor(() => {
      expect(canvas.getByText("??")).toBeVisible();
    });
  },
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage alt="Offline user" src="https://invalid.url/avatar.png" />
      <AvatarFallback>??</AvatarFallback>
    </Avatar>
  ),
};
