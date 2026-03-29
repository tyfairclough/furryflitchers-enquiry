"use client";

import Image from "next/image";
import { useId, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { MAIN_SITE_URL } from "@/lib/site";

export function EnquirySiteHeader() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  function openConfirm() {
    dialogRef.current?.showModal();
  }

  function closeDialog() {
    dialogRef.current?.close();
  }

  function confirmLeave() {
    window.location.assign(MAIN_SITE_URL);
  }

  return (
    <header
      className="flex h-[100px] w-full shrink-0 items-center justify-center bg-card-foreground"
      role="banner"
    >
      <button
        type="button"
        onClick={openConfirm}
        className="flex h-full max-w-full items-center justify-center px-4 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground/40"
        aria-haspopup="dialog"
        aria-controls="leave-enquiry-dialog"
      >
        <Image
          src="/images/furry-flitchers-logo.png"
          alt="Furry Flitchers"
          width={276}
          height={48}
          className="h-[48px] w-auto max-w-[min(100%,276px)] object-contain object-center"
          priority
        />
      </button>

      <dialog
        ref={dialogRef}
        id="leave-enquiry-dialog"
        aria-labelledby={titleId}
        className="w-[min(100%,28rem)] max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-lg backdrop:bg-foreground/40"
      >
        <h2 id={titleId} className="font-heading text-xl font-semibold text-foreground">
          Leave this page?
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Are you sure you want to abandon your enquiry? Any progress on this form may be
          lost.
        </p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={confirmLeave}>
            Go to furryflitchers.com
          </Button>
          <Button type="button" variant="primary" onClick={closeDialog}>
            Stay and continue
          </Button>
        </div>
      </dialog>
    </header>
  );
}
