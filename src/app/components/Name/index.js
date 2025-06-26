"use client";

import React from "react";
import clsx from "clsx";
import NameOffScreenCanvas from "./NameOffScreenCanvas";
import VisuallyHidden from "@/components/VisuallyHidden";
import useWindowBreakpoints from "@/hooks/useWindowBreakpoints";

export default function Name() {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const breakpoint = useWindowBreakpoints({
    isMobile: true,
  });
  const environment = process.env.NODE_ENV;

  return (
    <div className="w-full h-auto aspect-[700/329] sm:aspect-[2304/384]">
      <svg
        width="700"
        height="329"
        viewBox="0 0 1400 658"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={clsx(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-auto z-10 pointer-events-none fill-neutral-950 dark:fill-neutral-50",
          "block sm:hidden",
          isLoaded && "animate-fade-out-300 animation-delay-1000"
        )}
      >
        
      </svg>
      <svg
        width="2304"
        height="384"
        viewBox="0 0 2304 384"
        xmlns="http://www.w3.org/2000/svg"
        className={clsx(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-auto z-10 pointer-events-none fill-neutral-950 dark:fill-neutral-50",
          "hidden sm:block",
          isLoaded && "animate-fade-out-300 animation-delay-1000"
        )}
      >
      </svg>
      {breakpoint === "xs" && (
        <NameOffScreenCanvas
          isMobile
          isLoaded={isLoaded}
          setIsLoaded={setIsLoaded}
          environment={environment}
        />
      )}
      {breakpoint === "sm" && (
        <NameOffScreenCanvas
          isLoaded={isLoaded}
          setIsLoaded={setIsLoaded}
          environment={environment}
        />
      )}
      <VisuallyHidden>
        <h1>Elkasmi Fatima Zahra</h1>
      </VisuallyHidden>
    </div>
  );
}
