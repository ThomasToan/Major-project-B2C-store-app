import type { PropsWithChildren } from "react";
import { Content } from "../Content";
import { LeftMenu } from "../Menu/LeftMenu";
import { TopMenu } from "./TopMenu";
import { getCurrentCustomer } from "@/functions/customerSession";

export async function AppLayout({
  children,
  query,
  selectedCategory,
  selectedTag,
  selectedYear,
  selectedMonth,
}: PropsWithChildren<{
  query?: string;
  selectedCategory?: string;
  selectedTag?: string;
  selectedYear?: string;
  selectedMonth?: string;
}>) {
  const customer = await getCurrentCustomer();

  return (
    <div className="text-primary min-h-screen bg-[color:var(--surface-raised)] md:grid md:grid-cols-[18rem_minmax(0,1fr)]">
      <LeftMenu
        selectedCategory={selectedCategory}
        selectedMonth={selectedMonth}
        selectedTag={selectedTag}
        selectedYear={selectedYear}
        showAdminLink={customer?.role === "ADMIN"}
      />
      <Content>
        <TopMenu query={query} />
        {children}
      </Content>
    </div>
  );
}
