"use client";

import { Menu } from "@base-ui/react/menu";
import { LogOutIcon, MenuIcon, SettingsIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "@/modules/auth/client";
import { ROUTES } from "@/shared/constants";

export function BurgerMenu() {
  const router = useRouter();

  async function handleSignOut() {
    try {
      await signOut();
    } catch {
      // Sign-out failure (network error, expired session) — proceed to redirect
    } finally {
      router.push(ROUTES.LOGIN);
    }
  }

  return (
    <Menu.Root>
      <Menu.Trigger
        className="flex flex-1 flex-col items-center gap-1 py-3 text-xs text-muted-foreground"
        aria-label="Menu"
      >
        <MenuIcon className="size-5" />
        More
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner side="top" align="end" sideOffset={8}>
          <Menu.Popup className="min-w-40 rounded-lg border bg-popover p-1 shadow-md">
            <Menu.LinkItem
              render={<Link href={ROUTES.SETTINGS} />}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm outline-none hover:bg-accent focus:bg-accent"
            >
              <SettingsIcon className="size-4" />
              Settings
            </Menu.LinkItem>
            <Menu.Item
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm outline-none hover:bg-accent focus:bg-accent"
              onClick={handleSignOut}
            >
              <LogOutIcon className="size-4" />
              Sign Out
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
