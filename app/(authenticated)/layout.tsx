import { BottomNav } from "./_components/bottom-nav";
import { BurgerMenu } from "./_components/burger-menu";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex items-center justify-end p-2">
        <BurgerMenu />
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
      <BottomNav />
    </div>
  );
}
