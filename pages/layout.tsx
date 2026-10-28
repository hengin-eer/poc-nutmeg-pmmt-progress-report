import { useShared } from "@void/react";
import "remixicon/fonts/remixicon.css";
import { Shell } from "../components/layout/Shell";
import "./app.css";

type LayoutProps = { children: React.ReactNode };

export default function Layout({ children }: LayoutProps) {
  const { me, demo, path } = useShared();
  if (!me) return <>{children}</>;
  return <Shell me={me} demo={demo} path={path}>{children}</Shell>;
}
