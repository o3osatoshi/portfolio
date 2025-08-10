"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Heading } from "@repo/ui/components/base/heading";
import { Card, CardContent } from "@repo/ui/components/card";
import AmountInput from "@repo/ui/components/case/amount-input";
import type * as React from "react";

export default function Page() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <ConnectButton />
      </div>
      <div className="flex flex-col gap-3 items-center">
        <Heading level="h2">Deposit</Heading>
        <Card className="w-96">
          <CardContent>
            <AmountInput />
          </CardContent>
        </Card>
      </div>
      <div className="flex flex-col gap-3 items-center">
        <Heading level="h2">Withdraw</Heading>
        <Card className="w-96">
          <CardContent>
            <AmountInput />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
