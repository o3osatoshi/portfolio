import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

// import "@rainbow-me/rainbowkit/styles.css";
//
// import { ConnectButton } from "@rainbow-me/rainbowkit";
//
// import Web3Provider from "@/app/[locale]/(main)/labs/web3-crud/_components/web3-provider";
// import { AmountInput, Card, CardContent, Heading } from "@o3osatoshi/ui";
import PageHeader from "@/app/[locale]/(main)/_components/page-header";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ namespace: "LabsWeb3Crud", locale });

  return {
    description: t("metadata.description"),
    title: t("metadata.title"),
  };
}

export default async function Page() {
  const t = await getTranslations("LabsWeb3Crud");

  return <PageHeader title={t("header.title")} />;
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
