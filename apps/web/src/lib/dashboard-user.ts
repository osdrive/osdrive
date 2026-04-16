import type { Accessor } from "solid-js";
import { createContext, useContext } from "solid-js";
import type { requireCurrentUserQuery } from "~/server/legacy";

export type DashboardUser = Awaited<ReturnType<typeof requireCurrentUserQuery>>;

export const DashboardUserContext = createContext<Accessor<DashboardUser | undefined> | null>(null);

export function useDashboardUser() {
  const user = useContext(DashboardUserContext);
  if (!user) {
    throw new Error("useDashboardUser must be used within the dashboard layout");
  }

  return user;
}
