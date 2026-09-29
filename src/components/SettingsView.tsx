import React, { useState } from 'react';
import { ActiveTab, UserProfile } from '../types';
import { AVATAR_URL } from '../data/mockData';

interface SettingsViewProps {
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenReportModal: (title: string) => void;
  onShowToast: (msg: string) => void;
  darkMode?: boolean;
  onToggleDarkMode?: (enabled?: boolean) => void;
  onOpenRulesModal?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  onUpdateUser,
  setActiveTab,
  onOpenReportModal,
  onShowToast,
  darkMode,
  onToggleDarkMode,
  onOpenRulesModal,
}) => {
  const isDark = darkMode ?? user.darkMode ?? false;
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>(
    isDark ? 'dark' : 'light'
  );
  const [showCssVars, setShowCssVars] = useState(false);

  const handleToggleTheme = (enableDark: boolean) => {
    setThemeMode(enableDark ? 'dark' : 'light');
    if (onToggleDarkMode) {
      onToggleDarkMode(enableDark);
    } else {
      onUpdateUser({ darkMode: enableDark });
    }
  };

  const handleSelectSystemTheme = () => {
    setThemeMode('system');
    const systemDark =
      typeof window !== 'undefined' && window.matchMedia
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
        : false;
    if (onToggleDarkMode) {
      onToggleDarkMode(systemDark);
    } else {
      onUpdateUser({ darkMode: systemDark });
    }
    onShowToast(`ตั้งค่าธีมตามระบบเรียบร้อย (${systemDark ? 'โหมดมืด' : 'โหมดสว่าง'})`);
  };
  const [sessions, setSessions] = useState([
    {
      id: 's1',
      device: 'Chrome on macOS',
      location: 'เครือข่ายหอพักใน 2 • IP 10.24.8.12',
      current: true,
      lastActive: 'กำลังใช้งานขณะนี้',
    },
    {
      id: 's2',
      device: 'Safari on iPhone 15',
      location: 'เครือข่ายมือถือ 5G',
      current: false,
      lastActive: '2 ชั่วโมงที่แล้ว',
    },
  ]);

  const handleResetTag = () => {
    const randomHex = Math.floor(Math.random() * 0xffff)
      .toString(16)
      .toUpperCase()
      .padStart(4, '0');
    const newTag = `#${randomHex}`;
    onUpdateUser({ anonymousTag: newTag });
    onShowToast(`สร้างรหัสนิรนามใหม่สำเร็จ: สมาชิกนิรนาม ${newTag}`);
  };

  const handleDisconnectSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    onShowToast('ตัดการเชื่อมต่ออุปกรณ์ดังกล่าวเรียบร้อยแล้ว');
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 lg:px-8 pt-24 pb-20 flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111c2d] tracking-tight">
          การตั้งค่าและความเป็นส่วนตัว
        </h1>
        <p className="text-sm text-[#5a5e69]">
          จัดการรหัสประจำตัวนิรนามของคุณ การแจ้งเตือน และข้อมูลความปลอดภัยสูงสุด
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (Cols 1-7) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Section 1: Anonymous Identity Management */}
          <div className="rounded-2xl bg-white p-6 border border-[#e7eeff] shadow-xs flex flex-col gap-5">
            <div className="flex items-center gap-2.5 pb-2 border-b border-[#f0f3ff]">
              <span className="material-symbols-outlined text-[22px] text-[#4648d4]">
                masks
              </span>
              <h3 className="font-bold text-base text-[#111c2d]">
                การจัดการรหัสประจำตัวนิรนาม (Anonymous Identity)
              </h3>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#f0f3ff] border border-[#dee8ff]">
              <div className="flex items-center gap-3">
                <img
                  src={AVATAR_URL}
                  alt="Avatar"
                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-[#4648d4]"
                  referrerPolicy="no-referrer"
                />
                <div className="flex flex-col">
                  <span className="text-xs text-[#5a5e69]">รหัสนิรนามปัจจุบัน</span>
                  <span className="text-base font-extrabold text-[#111c2d]">
                    สมาชิกนิรนาม {user.anonymousTag}
                  </span>
                  <span className="text-[11px] text-[#006b2d] font-semibold">
                    ✓ ผู้พักอาศัยยืนยันแล้ว • {user.floor}
                  </span>
                </div>
              </div>

              {/* Reset Anonymous Tag Button */}
              <button
                type="button"
                onClick={handleResetTag}
                className="px-4 py-2.5 rounded-xl bg-[#4648d4] text-white hover:bg-[#6063ee] text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-1.5 active:scale-95 whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-[16px]">refresh</span>
                <span>สุ่มรหัส Tag ใหม่</span>
              </button>
            </div>

            <p className="text-xs text-[#5a5e69] leading-relaxed">
              การกดสุ่มรหัส Tag ใหม่จะเปลี่ยนรหัสแฮชของคุณในระบบบอร์ด
              ทำให้โพสต์ก่อนหน้าไม่สามารถเชื่อมโยงกับโพสต์ใหม่ได้ (เพื่อการรักษาตัวตนระดับสูงสุด)
            </p>

            {/* Default Anonymous Post Toggle */}
            <div className="pt-2 border-t border-[#f0f3ff] flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[#111c2d]">
                  โพสต์แบบไม่ระบุตัวตนเป็นค่าเริ่มต้น
                </span>
                <span className="text-[11px] text-[#5a5e69]">
                  เปิดใช้งานเสมอเมื่อเริ่มเขียนกระทู้ใหม่
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={user.defaultAnonymous}
                  onChange={(e) => {
                    onUpdateUser({ defaultAnonymous: e.target.checked });
                    onShowToast(
                      e.target.checked
                        ? 'เปิดการโพสต์นิรนามเป็นค่าเริ่มต้น'
                        : 'ปิดการโพสต์นิรนามเริ่มต้น'
                    );
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#dee2ef] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4648d4]"></div>
              </label>
            </div>
          </div>

          {/* Section 2: Notification Preferences */}
          <div className="rounded-2xl bg-white p-6 border border-[#e7eeff] shadow-xs flex flex-col gap-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-[#f0f3ff]">
              <span className="material-symbols-outlined text-[22px] text-[#4648d4]">
                notifications
              </span>
              <h3 className="font-bold text-base text-[#111c2d]">การตั้งค่าการแจ้งเตือน</h3>
            </div>

            <div className="flex flex-col gap-3">
              {[
                {
                  key: 'replies',
                  title: 'แจ้งเตือนเมื่อมีคนตอบกลับกระทู้ของคุณ',
                  desc: 'รับการแจ้งเตือนทันทีเมื่อมีความคิดเห็นใหม่ในกระทู้ที่คุณสร้าง',
                },
                {
                  key: 'likes',
                  title: 'แจ้งเตือนเมื่อมีคนกดถูกใจความคิดเห็น',
                  desc: 'แจ้งเมื่อมีเพื่อนร่วมหอพักกดถูกใจหรือเห็นด้วยกับโพสต์ของคุณ',
                },
                {
                  key: 'urgentNotices',
                  title: 'ประกาศด่วนและเหตุฉุกเฉินจากนิติหอพัก',
                  desc: 'การแจ้งซ่อมระบบน้ำ ไฟฟ้า หรือสถานการณ์ฉุกเฉินรอบอาคาร',
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#f0f3ff]"
                >
                  <div className="flex flex-col pr-3">
                    <span className="text-xs font-semibold text-[#111c2d]">{item.title}</span>
                    <span className="text-[11px] text-[#5a5e69]">{item.desc}</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={
                        user.notifications[item.key as keyof typeof user.notifications] ?? true
                      }
                      onChange={(e) => {
                        onUpdateUser({
                          notifications: {
                            ...user.notifications,
                            [item.key]: e.target.checked,
                          },
                        });
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#dee2ef] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4648d4]"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Active Device Sessions */}
          <div className="rounded-2xl bg-white p-6 border border-[#e7eeff] shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#f0f3ff]">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[22px] text-[#4648d4]">devices</span>
                <h3 className="font-bold text-base text-[#111c2d]">อุปกรณ์และเซสชันที่เชื่อมต่อ</h3>
              </div>
              <span className="text-xs text-[#5a5e69]">({sessions.length} อุปกรณ์)</span>
            </div>

            <div className="flex flex-col gap-3">
              {sessions.map((sess) => (
                <div
                  key={sess.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-[#dee8ff] bg-[#f9f9ff]"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[22px] text-[#5a5e69]">
                      {sess.device.includes('iPhone') ? 'smartphone' : 'laptop_mac'}
                    </span>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#111c2d]">{sess.device}</span>
                        {sess.current && (
                          <span className="px-1.5 py-0.2 rounded bg-[#e1e0ff] text-[#4648d4] text-[9px] font-bold">
                            เซสชันนี้
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#5a5e69]">{sess.location}</span>
                    </div>
                  </div>

                  {!sess.current && (
                    <button
                      onClick={() => handleDisconnectSession(sess.id)}
                      className="px-2.5 py-1 text-xs text-[#ba1a1a] hover:bg-[#ffdad6] rounded-lg transition-colors font-medium"
                    >
                      ยกเลิกการเชื่อมต่อ
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (Cols 8-12) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Real Identity Vault (ความลับ) */}
          <div className="rounded-2xl bg-white p-6 border border-[#e7eeff] shadow-xs flex flex-col gap-4">
            <div className="flex items-center gap-2 text-[#ba1a1a]">
              <span className="material-symbols-outlined text-[20px]">verified_user</span>
              <h3 className="font-bold text-sm">ข้อมูลห้องพักจริง (เข้ารหัสปิด)</h3>
            </div>

            <div className="p-4 rounded-xl bg-[#f0f3ff] text-xs flex flex-col gap-2 border border-[#dee8ff]">
              <div className="flex justify-between">
                <span className="text-[#5a5e69]">อาคารหอพัก:</span>
                <span className="font-semibold text-[#111c2d]">{user.realBuilding}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5a5e69]">หมายเลขห้อง:</span>
                <span className="font-semibold text-[#111c2d]">{user.realRoom}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5a5e69]">รหัสนักศึกษา:</span>
                <span className="font-semibold font-mono text-[#111c2d]">
                  {user.studentIdMasked}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5a5e69]">อีเมลสถาบัน:</span>
                <span className="font-semibold font-mono text-[#111c2d]">{user.emailMasked}</span>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('verify')}
              className="w-full py-2.5 rounded-xl border border-[#dee8ff] text-xs font-semibold text-[#4648d4] hover:bg-[#f0f3ff] transition-colors"
            >
              แก้ไขหรืออัปเดตข้อมูลหอพัก
            </button>
          </div>

          {/* Theme & Display (Dark Mode) */}
          <div className="rounded-2xl bg-white p-6 border border-[#e7eeff] shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#f0f3ff]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[22px] text-[#4648d4]">
                  {isDark ? 'dark_mode' : 'light_mode'}
                </span>
                <h3 className="font-bold text-sm text-[#111c2d]">ธีมและการแสดงผล (Theme)</h3>
              </div>
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                  isDark
                    ? 'bg-[#2b3354] text-[#c0c1ff]'
                    : 'bg-[#e1e0ff] text-[#4648d4]'
                }`}
              >
                {isDark ? 'โหมดมืด (Dark)' : 'โหมดสว่าง (Light)'}
              </span>
            </div>

            {/* Main Dark Mode Switch */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#f0f3ff] border border-[#dee8ff]">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                    isDark ? 'bg-[#263143] text-[#fde047]' : 'bg-[#dee8ff] text-[#eab308]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {isDark ? 'dark_mode' : 'light_mode'}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#111c2d]">
                    โหมดมืด (Dark Mode)
                  </span>
                  <span className="text-[11px] text-[#5a5e69]">
                    อัปเดต CSS Variables และลดแสงสะท้อนถนอมสายตา
                  </span>
                </div>
              </div>

              {/* Accessible Switch */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="dark-mode-toggle"
                  aria-label="Toggle Dark Mode"
                  checked={isDark}
                  onChange={(e) => handleToggleTheme(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#dee2ef] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4648d4]"></div>
              </label>
            </div>

            {/* Segmented Mode Selector */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleToggleTheme(false)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  !isDark && themeMode === 'light'
                    ? 'bg-[#4648d4] text-white shadow-xs'
                    : 'bg-[#f0f3ff] text-[#5a5e69] hover:bg-[#dee8ff]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">light_mode</span>
                <span>สว่าง</span>
              </button>

              <button
                type="button"
                onClick={() => handleToggleTheme(true)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  isDark && themeMode === 'dark'
                    ? 'bg-[#4648d4] text-white shadow-xs'
                    : 'bg-[#f0f3ff] text-[#5a5e69] hover:bg-[#dee8ff]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">dark_mode</span>
                <span>มืด</span>
              </button>

              <button
                type="button"
                onClick={handleSelectSystemTheme}
                className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  themeMode === 'system'
                    ? 'bg-[#4648d4] text-white shadow-xs'
                    : 'bg-[#f0f3ff] text-[#5a5e69] hover:bg-[#dee8ff]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">brightness_auto</span>
                <span>ตามระบบ</span>
              </button>
            </div>

            {/* Accessibility & Contrast Guarantee Box */}
            <div className="p-3 rounded-xl bg-[#f0f3ff] border border-[#dee8ff] flex flex-col gap-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#111c2d] flex items-center gap-1.5">
                  <span
                    className="material-symbols-outlined text-[16px] text-[#006b2d]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified
                  </span>
                  มาตรฐานการเข้าถึง (Accessibility)
                </span>
                <span className="px-1.5 py-0.5 rounded bg-[#f7fff3] text-[#006b2d] font-bold text-[10px] border border-[#006b2d]/20">
                  {isDark ? '16.5:1 • WCAG AAA' : '15.2:1 • WCAG AAA'}
                </span>
              </div>
              <p className="text-[11px] text-[#5a5e69] leading-relaxed">
                สีพื้นหลังและสีข้อความถูกคำนวณผ่าน CSS Variables ให้มีอัตราส่วนความคมชัดสูงกว่าเกณฑ์สากล
                อ่านสบายตาและไม่ก่อให้เกิดแสงวาบ
              </p>
            </div>

            {/* Collapsible Live CSS Variables Inspector */}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setShowCssVars(!showCssVars)}
                className="flex items-center justify-between text-xs text-[#5a5e69] hover:text-[#111c2d] font-medium py-1"
              >
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px]">code</span>
                  <span>ดูค่า CSS Variables ที่ถูกอัปเดต</span>
                </span>
                <span className="material-symbols-outlined text-[16px]">
                  {showCssVars ? 'expand_less' : 'expand_more'}
                </span>
              </button>

              {showCssVars && (
                <div className="p-3 rounded-xl bg-[#f0f3ff] font-mono text-[11px] text-[#5a5e69] flex flex-col gap-1.5 border border-[#dee8ff] animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <span>--color-background</span>
                    <span className="flex items-center gap-1.5 font-bold text-[#111c2d]">
                      <span
                        className="w-3 h-3 rounded-sm border border-gray-400"
                        style={{ backgroundColor: isDark ? '#0f141c' : '#f9f9ff' }}
                      ></span>
                      {isDark ? '#0f141c' : '#f9f9ff'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>--color-surface</span>
                    <span className="flex items-center gap-1.5 font-bold text-[#111c2d]">
                      <span
                        className="w-3 h-3 rounded-sm border border-gray-400"
                        style={{ backgroundColor: isDark ? '#171f2c' : '#ffffff' }}
                      ></span>
                      {isDark ? '#171f2c' : '#ffffff'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>--color-on-surface</span>
                    <span className="flex items-center gap-1.5 font-bold text-[#111c2d]">
                      <span
                        className="w-3 h-3 rounded-sm border border-gray-400"
                        style={{ backgroundColor: isDark ? '#f3f4f6' : '#111c2d' }}
                      ></span>
                      {isDark ? '#f3f4f6' : '#111c2d'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>--color-border</span>
                    <span className="flex items-center gap-1.5 font-bold text-[#111c2d]">
                      <span
                        className="w-3 h-3 rounded-sm border border-gray-400"
                        style={{ backgroundColor: isDark ? '#293548' : '#e7eeff' }}
                      ></span>
                      {isDark ? '#293548' : '#e7eeff'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Language Selector */}
            <div className="pt-2 border-t border-[#f0f3ff] flex items-center justify-between">
              <span className="text-xs font-semibold text-[#111c2d]">ภาษาของระบบ</span>
              <select className="h-8 px-2.5 rounded-lg bg-[#f0f3ff] text-xs text-[#111c2d] focus:outline-none">
                <option value="th">ไทย (Thai)</option>
                <option value="en">English (US)</option>
              </select>
            </div>
          </div>

          {/* Community Safety & Report Test */}
          <div className="rounded-2xl bg-white p-6 border border-[#e7eeff] shadow-xs flex flex-col gap-3">
            <span className="text-xs font-bold text-[#5a5e69] uppercase tracking-wider">
              การควบคุมความปลอดภัย
            </span>
            <p className="text-xs text-[#5a5e69] leading-relaxed">
              หากคุณพบเห็นการเปิดเผยข้อมูลส่วนตัวของผู้อื่น (Doxxing) หรือการคุกคาม
              คุณสามารถส่งรายงานเพื่อให้นิติหอพักระงับการเข้าถึงได้ทันที
            </p>
            <button
              onClick={() => onOpenReportModal('ทดสอบระบบรายงานความปลอดภัย')}
              className="mt-1 w-full py-2.5 rounded-xl bg-[#ffdad6] text-[#ba1a1a] hover:bg-[#ffb4ab] text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">report</span>
              <span>ทดสอบการรายงานเนื้อหา</span>
            </button>
          </div>

          {/* Firebase Connection & Security Rules Card */}
          <div className="rounded-2xl bg-white p-6 border border-[#e7eeff] shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#5a5e69] uppercase tracking-wider">
                การเชื่อมต่อ Firebase
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#e1e0ff] text-[#4648d4] text-[10px] font-bold">
                dormtalk-131e0
              </span>
            </div>
            <p className="text-xs text-[#5a5e69] leading-relaxed">
              ฐานข้อมูล Cloud Firestore และ Firebase Authentication หากต้องการอัปเดตสิทธิ์ความปลอดภัยหรือพบปัญหาการอนุญาต สามารถดู Security Rules ได้ที่นี่
            </p>
            {onOpenRulesModal && (
              <button
                type="button"
                onClick={onOpenRulesModal}
                className="mt-1 w-full py-2.5 rounded-xl bg-[#f0f3ff] hover:bg-[#dee8ff] text-[#4648d4] text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">security</span>
                <span>ดูและคัดลอก Cloud Firestore Rules</span>
              </button>
            )}
          </div>

          {/* Logout Action */}
          <button
            onClick={() => {
              onShowToast('ออกจากระบบเรียบร้อยแล้ว');
              setActiveTab('login');
            }}
            className="w-full py-3 rounded-2xl bg-white border border-[#ba1a1a]/30 hover:bg-[#ffdad6]/20 text-[#ba1a1a] text-xs font-bold transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
