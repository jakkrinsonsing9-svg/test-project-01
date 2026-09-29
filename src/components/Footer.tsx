import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-white border-t border-[#e7eeff] py-8 pb-28 lg:pb-8 mt-auto">
      <div className="max-w-[1280px] mx-auto px-4 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[#5a5e69] text-xs">
        <div className="flex flex-wrap items-center gap-2 text-center md:text-left">
          <span className="font-bold text-[#111c2d] text-sm">หอคุย (DormTalk)</span>
          <span>•</span>
          <span>ระบบคอมมูนิตี้หอพักนิรนามเพื่อความปลอดภัยและความเป็นส่วนตัวสูงสุด</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1 text-[#006b2d] font-medium">
            <span
              className="material-symbols-outlined text-[16px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              lock
            </span>
            เข้ารหัสข้อมูลตัวตน Zero-Knowledge
          </span>
          <span>© 2025 DormTalk. สงวนลิขสิทธิ์</span>
        </div>
      </div>
    </footer>
  );
};
