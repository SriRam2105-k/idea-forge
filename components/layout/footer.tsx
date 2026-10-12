import Image from 'next/image';

export function Footer() {
  return (
    <footer className="bg-[#1B2B6B] text-white py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left Side: Logo */}
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 flex-shrink-0 rounded-full overflow-hidden bg-white shadow-sm">
            <Image
              src="/npr new logo.png"
              alt="NPR Logo"
              fill
              sizes="40px"
              className="object-cover"
            />
          </div>
          <div>
            <div className="text-[15px] font-bold leading-tight">NPR</div>
            <div className="text-[11px] font-bold leading-tight">COLLEGE OF ENGINEERING</div>
            <div className="text-[8px] font-semibold text-[#F5C518] leading-tight uppercase">(An Autonomous Institution)</div>
          </div>
        </div>

        {/* Right Side: Text */}
        <div className="text-sm font-medium tracking-wide">
          Innovate <span className="mx-2 opacity-50">|</span> Collaborate <span className="mx-2 opacity-50">|</span> Create Impact
        </div>
      </div>
    </footer>
  );
}
