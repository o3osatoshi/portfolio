import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "@storybook/test";
import { CheckCircle, LogOut, Settings } from "lucide-react";
import * as React from "react";

import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./dropdown-menu";

const meta = {
  component: DropdownMenu,
  title: "UI/Dropdown Menu",
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole("button", { name: "Open menu" }));

    const menu = await body.findByRole("menu");

    await waitFor(() => {
      expect(menu).toBeVisible();
    });

    const activityBar = body.getByRole("menuitemcheckbox", {
      name: "Activity bar",
    });

    expect(activityBar).toHaveAttribute("aria-checked", "false");

    await userEvent.click(activityBar);

    await waitFor(() => {
      expect(activityBar).toHaveAttribute("aria-checked", "true");
    });

    const rightPanel = body.getByRole("menuitemradio", { name: "Right" });

    await userEvent.click(rightPanel);

    await waitFor(() => {
      expect(rightPanel).toHaveAttribute("aria-checked", "true");
    });
  },
  render: () => {
    const [statusBar, setStatusBar] = React.useState(true);
    const [activityBar, setActivityBar] = React.useState(false);
    const [panel, setPanel] = React.useState("bottom");

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Open menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              Profile
              <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              Billing
              <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              Team
              <DropdownMenuShortcut>⌘T</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuLabel inset>Appearance</DropdownMenuLabel>
            <DropdownMenuCheckboxItem
              checked={statusBar}
              onCheckedChange={(checked) => setStatusBar(checked === true)}
            >
              Status bar
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={activityBar}
              onCheckedChange={(checked) => setActivityBar(checked === true)}
            >
              Activity bar
            </DropdownMenuCheckboxItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuLabel inset>Panel position</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              onValueChange={(value) => setPanel(value)}
              value={panel}
            >
              <DropdownMenuRadioItem value="left">Left</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="bottom">
                Bottom
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="right">Right</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Settings className="mr-2 size-4" />
              More settings
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-48">
              <DropdownMenuItem>
                Notifications
                <DropdownMenuShortcut>⌘N</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                Integrations
                <DropdownMenuShortcut>⌘I</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">
            <LogOut className="mr-2 size-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
};

export const WithStatus: Story = {
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    const switchWorkspace = await body.findByRole("menuitem", {
      name: "Switch workspace",
    });

    await waitFor(() => {
      expect(switchWorkspace).toBeVisible();
    });

    const trigger = body.getByRole("button", {
      hidden: true,
      name: "Connected",
    });

    expect(trigger).toHaveAttribute("data-state", "open");
  },
  render: () => (
    // modal={false} is required here to prevent the modal backdrop from interfering with the test's ability to check the trigger state.
    <DropdownMenu defaultOpen modal={false}>
      <DropdownMenuTrigger asChild>
        <Button className="gap-2" variant="secondary">
          <CheckCircle className="size-4" />
          Connected
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>Connection</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Switch workspace</DropdownMenuItem>
        <DropdownMenuItem>Re-authorise</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">Disconnect</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};
