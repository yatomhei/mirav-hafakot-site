import { Fragment } from "react";

/**
 * A heading typed in the admin as separate lines: each line after the first starts on a new
 * line. `brClassName` lets a design hide the break at some widths (the space keeps words apart).
 */
export function BrokenLines({ lines, brClassName }: { lines: string[]; brClassName?: string }) {
  return (
    <>
      {lines.map((line, i) => (
        <Fragment key={i}>
          {i > 0 && (
            <>
              <br {...(brClassName ? { className: brClassName } : {})} />{" "}
            </>
          )}
          {line}
        </Fragment>
      ))}
    </>
  );
}
