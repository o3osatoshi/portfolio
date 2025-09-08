"use client";

import { AmountInput, Card, CardContent, Heading } from "@o3osatoshi/ui";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import type * as React from "react";
import "@rainbow-me/rainbowkit/styles.css";
import { Web3Provider } from "@/app/(main)/labs/web3-crud/_components/web3-provider";

export default function Page() {
  return (
    <Web3Provider>
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
    </Web3Provider>
  );
}
