"use client";

import { useTranslations } from "next-intl";

// import "@rainbow-me/rainbowkit/styles.css";
//
// import { ConnectButton } from "@rainbow-me/rainbowkit";
//
// import Web3Provider from "@/app/[locale]/(main)/labs/web3-crud/_components/web3-provider";
// import { AmountInput, Card, CardContent, Heading } from "@o3osatoshi/ui";

export default function Page() {
  const t = useTranslations("LabsWeb3Crud");

  return <div>{t("title")}</div>;
  // return (
  //   <Web3Provider>
  //     <div className="flex flex-col gap-6">
  //       <div className="flex justify-end">
  //         <ConnectButton />
  //       </div>
  //       <div className="flex flex-col items-center gap-3">
  //         <Heading level="h2">Deposit</Heading>
  //         <Card className="w-96">
  //           <CardContent>
  //             <AmountInput />
  //           </CardContent>
  //         </Card>
  //       </div>
  //       <div className="flex flex-col items-center gap-3">
  //         <Heading level="h2">Withdraw</Heading>
  //         <Card className="w-96">
  //           <CardContent>
  //             <AmountInput />
  //           </CardContent>
  //         </Card>
  //       </div>
  //     </div>
  //   </Web3Provider>
  // );
}
