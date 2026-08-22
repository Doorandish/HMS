import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { headers } from "next/headers";
import { resolveTenant } from "@/lib/tenant/tenant-resolver";
import { TenantProvider } from "@/lib/tenant/tenant-context";
import { parseTenantPublicData } from "@/lib/tenant/tenant-utils";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const tenantSlug = headersList.get('x-tenant-slug');
  const tenant = await resolveTenant(tenantSlug);
  
  if (!tenant) {
    return {
      title: "Hotel Management System",
    };
  }

  const publicData = parseTenantPublicData(tenant as any);
  return {
    title: {
      template: `%s | ${publicData.name}`,
      default: publicData.name,
    },
    description: publicData.branding.heroSubtitle,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const tenantSlug = headersList.get('x-tenant-slug');
  const tenant = await resolveTenant(tenantSlug);
  
  const tenantPublicData = tenant ? parseTenantPublicData(tenant as any) : null;

  return (
    <html lang="en">
      <body className={`${inter.className} antialiased min-h-screen flex flex-col`}>
        <TenantProvider tenant={tenantPublicData}>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </TenantProvider>
      </body>
    </html>
  );
}
