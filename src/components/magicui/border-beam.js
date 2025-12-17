import { cn } from "@/lib/utils";

export const BorderBeam = ({
  className,
  borderWidth = 3,
  duration = 6,
  colorFrom = '#a8efff',
  colorTo = 'rgba(168,239,255,0.1)',
}) => {
  return (
    <>
      <style jsx global>{`
        @property --angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes borderRotate {
          to {
            --angle: 360deg;
          }
        }
      `}</style>
      <div
        style={{
          '--angle': '0deg',
          '--c1': colorFrom,
          '--c2': colorTo,
          animation: `borderRotate ${duration}s linear infinite`,
          boxShadow: `0 0 0 ${borderWidth}px transparent`,
          mask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          background: `conic-gradient(from var(--angle), var(--c2), var(--c1) 0.1turn, var(--c1) 0.15turn, var(--c2) 0.25turn)`
        }}
        className={cn('pointer-events-none absolute inset-0 rounded-[inherit]', className)}
      />
    </>
  );
};