import { type ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="dark min-h-screen bg-[#0a0a0f] [color-scheme:dark]">
      {children}
    </div>
  );
}
