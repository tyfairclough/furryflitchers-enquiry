"use client";

import HCaptcha from "@hcaptcha/react-hcaptcha";
import { useEffect, useRef, useState } from "react";

function captchaDisabledOnThisClient(): boolean {
  if (process.env.NODE_ENV === "development") return true;
  if (typeof window === "undefined") return true;
  const h = window.location.hostname;
  return h === "localhost" || h === "127.0.0.1";
}

export function useInvisibleHcaptcha() {
  const ref = useRef<HCaptcha>(null);
  const sitekey = process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY;
  const [mountCaptcha, setMountCaptcha] = useState(false);

  useEffect(() => {
    if (!sitekey) return;
    if (captchaDisabledOnThisClient()) return;
    setMountCaptcha(true);
  }, [sitekey]);

  async function execute(): Promise<string | null> {
    if (!sitekey || !mountCaptcha || captchaDisabledOnThisClient()) return null;
    const res = await ref.current?.execute({ async: true });
    if (!res) return null;
    if (typeof res === "string") return res;
    return res.response ?? null;
  }

  const element =
    sitekey && mountCaptcha ? (
      <HCaptcha sitekey={sitekey} size="invisible" ref={ref} />
    ) : null;

  return {
    execute,
    element,
    enabled: Boolean(sitekey && mountCaptcha && !captchaDisabledOnThisClient()),
  };
}
