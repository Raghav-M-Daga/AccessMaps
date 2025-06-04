'use client';

import { AuthProvider } from "@/componenets/AuthProvider";

export default function Template({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProvider>{children}</AuthProvider>;
}
