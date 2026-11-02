import { DemoLogin } from "../components/login/DemoLogin";
import { GoogleLogin } from "../components/login/GoogleLogin";
import { Stack } from "../components/ui";
import type { Props } from "./login.server";

export default function LoginPage({ demo, demoMembers, googleReady }: Props) {
  return (
    <div>
      <Stack className="mx-auto my-[10vh] max-w-[460px] px-4">
        <GoogleLogin googleReady={googleReady} />
        {demo && <DemoLogin demoMembers={demoMembers} />}
      </Stack>
    </div>
  );
}
