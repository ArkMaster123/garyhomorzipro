'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

interface ChatBackgroundProps {
  children: React.ReactNode;
}

export function ChatBackground({ children }: ChatBackgroundProps) {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    console.log('ChatBackground theme:', theme, 'resolvedTheme:', resolvedTheme);
  }, [theme, resolvedTheme]);

  if (!mounted) {
    return <>{children}</>;
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <div className={`min-h-screen w-full relative ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-[#fafafa] text-gray-900'}`}>
      {/* Diagonal Grid Pattern */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: isDark
            ? `
                repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.1) 0, rgba(255, 255, 255, 0.1) 1px, transparent 1px, transparent 20px),
                repeating-linear-gradient(-45deg, rgba(255, 255, 255, 0.1) 0, rgba(255, 255, 255, 0.1) 1px, transparent 1px, transparent 20px)
              `
            : `
                repeating-linear-gradient(45deg, rgba(0, 0, 0, 0.1) 0, rgba(0, 0, 0, 0.1) 1px, transparent 1px, transparent 20px),
                repeating-linear-gradient(-45deg, rgba(0, 0, 0, 0.1) 0, rgba(0, 0, 0, 0.1) 1px, transparent 1px, transparent 20px)
              `,
          backgroundSize: "40px 40px",
        }}
      />
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
