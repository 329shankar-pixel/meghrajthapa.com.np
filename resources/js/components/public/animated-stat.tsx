import React, { useEffect, useState, useRef } from 'react';

interface AnimatedStatProps {
  value: string;
  label: string;
  icon: React.ElementType;
  className?: string;
  delay?: number;
}

export default function AnimatedStat({
  value,
  label,
  icon: Icon,
  className = '',
  delay = 0
}: AnimatedStatProps) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  // Extract number from value (e.g., "10,000+" -> 10000)
  const targetNumber = parseInt(value.replace(/[^0-9]/g, ''), 10);
  const suffix = value.replace(/[0-9,]/g, '');

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setIsVisible(true);
        observer.unobserve(domRef.current!);
      }
    });

    if (domRef.current) {
      observer.observe(domRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let start = 0;
    const duration = 2000; // 2 seconds
    const increment = targetNumber / (duration / 16); // 60fps

    const timer = setInterval(() => {
      start += increment;
      if (start >= targetNumber) {
        setCount(targetNumber);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [isVisible, targetNumber]);

  return (
    <div
      ref={domRef}
      className={`group p-8 rounded-[2rem] bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(204,0,0,0.05)] transition-all duration-500 hover:-translate-y-2 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'} ${className}`}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      <div className="w-16 h-16 mb-6 rounded-2xl bg-[var(--political-red)]/5 dark:bg-[var(--political-red)]/10 flex items-center justify-center group-hover:bg-[var(--political-red)] group-hover:text-white transition-all duration-500 group-hover:rotate-6">
        <Icon className="w-8 h-8 text-[var(--political-red)] group-hover:text-white transition-colors" />
      </div>
      <div className="text-4xl font-black text-gray-900 dark:text-white mb-2 tabular-nums">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{label}</div>
    </div>
  );
}
