import Image from "next/image";
import Link from "next/link";

export function EnquirySiteHeader() {
  return (
    <header
      className="flex h-[100px] w-full shrink-0 items-center justify-center bg-foreground"
      role="banner"
    >
      <Link
        href="/"
        className="flex h-full max-w-full items-center justify-center px-4 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground/40"
      >
        <Image
          src="/images/furry-flitchers-logo.png"
          alt="Furry Flitchers"
          width={276}
          height={48}
          className="h-[48px] w-auto max-w-[min(100%,276px)] object-contain object-center"
          priority
        />
      </Link>
    </header>
  );
}
