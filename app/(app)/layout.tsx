import { AppSidebar } from "@/components/layout/app-sidebar";
import { requireSession } from "@/lib/session";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireSession();

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar user={session.user} />
      <main className="lg:pl-64">
        <div className="mx-auto w-full max-w-7xl px-6 py-8 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
