import { DemoLogin } from "../components/login/DemoLogin";
import { GoogleLogin } from "../components/login/GoogleLogin";
import type { Props } from "./login.server";

export default function LoginPage({ demo, demoMembers, googleReady }: Props) {
  return (
    <div className="container">
      <div className="login stack">
        <GoogleLogin googleReady={googleReady} />
        {demo && <DemoLogin demoMembers={demoMembers} />}
      </div>
    </div>
  );
}
