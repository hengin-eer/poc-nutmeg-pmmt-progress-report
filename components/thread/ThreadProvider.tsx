import { useCallback, useState, type ReactNode } from "react";
import { ThreadContext } from "./context";
import { ThreadDrawer } from "./ThreadDrawer";

type ThreadProviderProps = { children: ReactNode };

export function ThreadProvider({ children }: ThreadProviderProps) {
  const [openId, setOpenId] = useState<number | null>(null);
  const open = useCallback((id: number) => setOpenId(id), []);
  return (
    <ThreadContext.Provider value={{ open }}>
      {children}
      {openId !== null && <ThreadDrawer key={openId} id={openId} onClose={() => setOpenId(null)} />}
    </ThreadContext.Provider>
  );
}
