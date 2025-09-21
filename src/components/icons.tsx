import type { SVGProps } from "react";

export const Icons = {
  passport: (props: SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2Z" />
      <path d="M6 12h12" />
      <path d="M6 12a2 2 0 1 0-4 0 2 2 0 0 0 4 0Z" />
      <path d="M18 12a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z" />
    </svg>
  ),
};
