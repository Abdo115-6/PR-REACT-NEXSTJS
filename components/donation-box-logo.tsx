import type { SVGProps } from 'react'

export function DonationBoxLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M11 20h26l3 7H8l3-7Z" />
      <path d="M10 27h28v14H10V27Z" />
      <path d="M17 27h14" />
      <path d="M24 31v7" />
      <path d="M27 32.5c-1-1-3.8-1.2-4.8-.2-.8.9-.3 2 1.8 2.5 2.2.5 3.2 1.6 2.5 2.7-.7 1.1-3.6 1.3-5.2.1" />
      <circle cx="30" cy="12" r="6" />
      <path d="M30 8.5v7" />
      <path d="M32.5 10.5c-.8-.8-2.8-1.1-3.6-.2-.7.8-.3 1.8 1.2 2.2 1.7.4 2.5 1.2 2 2.2-.5 1-2.7 1.2-4.1.1" />
    </svg>
  )
}
