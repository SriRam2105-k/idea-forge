import Image from 'next/image';

export function Footer() {
  return (
    <footer className="bg-[#1B2B6B] text-white py-6 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        {/* Left Side: Logo */}
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 rounded-full overflow-hidden bg-white shadow-sm">
            <Image
              src="/npr new logo.png"
              alt="NPR Logo"
              fill
              sizes="40px"
              className="object-cover"
            />
          </div>
          <div className="text-left">
            <div className="text-[13px] sm:text-[15px] font-bold leading-tight">NPR</div>
            <div className="text-[10px] sm:text-[11px] font-bold leading-tight">COLLEGE OF ENGINEERING</div>
            <div className="text-[7.5px] sm:text-[8px] font-semibold text-[#F5C518] leading-tight uppercase">(An Autonomous Institution)</div>
          </div>
        </div>

        {/* Right Side: Text */}
        <div className="text-xs sm:text-sm font-medium tracking-wide text-blue-100 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
          <span>Innovate</span>
          <span className="opacity-40">|</span>
          <span>Collaborate</span>
          <span className="opacity-40">|</span>
          <span>Create Impact</span>
        </div>
      </div>
    </footer>
  );
}
