import type * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

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
    <AvatarImage
      alt="Satoshi Nakamoto"
      src="https://i.pravatar.cc/64?img=8"
    />
    <AvatarFallback>SN</AvatarFallback>
  </Avatar>
);

export const Default: Story = {
  render: renderAvatar,
};

export const WithFallback: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage alt="Offline user" src="https://invalid.url/avatar.png" />
      <AvatarFallback>??</AvatarFallback>
    </Avatar>
  ),
};
