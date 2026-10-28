import { createContext, useContext } from "react";

export const ThreadContext = createContext<{ open: (id: number) => void }>({ open: () => {} });
export const useThread = () => useContext(ThreadContext);
