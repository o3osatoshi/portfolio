import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor, within } from "@storybook/test";
import type * as React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

const AVATAR_PLACEHOLDER_SRC =
  "data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%2764%27%20height%3D%2764%27%20viewBox%3D%270%200%2064%2064%27%3E%3Crect%20width%3D%2764%27%20height%3D%2764%27%20rx%3D%2732%27%20fill%3D%27%232563eb%27%2F%3E%3Ctext%20x%3D%2732%27%20y%3D%2740%27%20font-family%3D%27sans-serif%27%20font-size%3D%2728%27%20fill%3D%27white%27%20text-anchor%3D%27middle%27%3ESN%3C%2Ftext%3E%3C%2Fsvg%3E";

const meta = {
  component: Avatar,
  tags: ["autodocs"],
  title: "UI/Avatar",
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

const renderAvatar = (args: React.ComponentProps<typeof Avatar>) => (
  <Avatar {...args}>
    <AvatarImage alt="Satoshi Nakamoto" src={AVATAR_PLACEHOLDER_SRC} />
    <AvatarFallback>SN</AvatarFallback>
  </Avatar>
);

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const image = await canvas.findByRole("img", {
      name: "Satoshi Nakamoto",
    });

    expect(image).toBeInTheDocument();
  },
  render: renderAvatar,
};

export const WithFallback: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
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
