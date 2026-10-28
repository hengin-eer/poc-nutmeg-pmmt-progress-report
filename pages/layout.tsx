import { useShared } from "@void/react";
import "remixicon/fonts/remixicon.css";
import { Shell } from "../components/layout/Shell";
import "./app.css";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { me, demo, path } = useShared();
  if (!me) return <>{children}</>;
  return <Shell me={me} demo={demo} path={path}>{children}</Shell>;
}
