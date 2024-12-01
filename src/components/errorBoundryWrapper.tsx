"use client";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import ErrorBoundary from "./ui/errorBoundary";
import ErrorComponent from "./ui/errorComponent";
import { Suspense } from "react";

export default function ErrorBoundryWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary onReset={reset} fallback={ErrorComponent}>
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
