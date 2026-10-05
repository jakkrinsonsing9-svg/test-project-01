import React, { useState, useEffect } from 'react';
import { ActiveTab, UserProfile } from '../types';
import { AVATAR_URL } from '../data/mockData';

interface VerificationViewProps {
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export const VerificationView: React.FC<VerificationViewProps> = ({
  user,
  onUpdateUser,
  setActiveTab,
}) => {
  const [method, setMethod] = useState<'email' | 'sso' | 'lease'>('email');
  const [building, setBuilding] = useState(user.realBuilding || 'อาคาร 2 (หอพักชาย)');
  const [room, setRoom] = useState(user.realRoom || '415');
  const [email, setEmail] = useState('thanapat.w@student.university.ac.th');
  const [otpSent, setOtpSent] = useState(true);
  const [otpDigits, setOtpDigits] = useState(['4', '8', '2', '9', '1', '0']);
  const [countdown, setCountdown] = useState(102); // 01:42
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedSuccess, setVerifiedSuccess] = useState(user.isVerified);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [countdown]);

  const formatCountdown = () => {
    const mins = Math.floor(countdown / 60);
    const secs = countdown % 60;
    return `0${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) val = val.slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = val;
    setOtpDigits(newDigits);
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setVerifiedSuccess(true);
      onUpdateUser({
        isVerified: true,
        realBuilding: building,
        realRoom: room,
      });
    }, 700);
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 lg:px-8 pt-24 pb-20 flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111c2d] tracking-tight">
          ระบบยืนยันตัวตนผู้พักอาศัย
        </h1>
        <p className="text-sm text-[#5a5e69]">
          พิสูจน์ว่าคุณเป็นผู้พักอาศัยจริงในหอพัก
          โดยที่ข้อมูลส่วนตัวของคุณจะไม่ถูกเปิดเผยในระบบคอมมูนิตี้
        </p>
      </div>

      {/* 3-Step Stepper */}
      <div className="rounded-2xl bg-white p-5 border border-[#e7eeff] shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Step 1 */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#006b2d] text-white flex items-center justify-center text-sm font-bold shrink-0">
              <span className="material-symbols-outlined text-[18px]">check</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-[#006b2d] font-bold">ขั้นตอนที่ 1</span>
              <span className="text-xs font-semibold text-[#111c2d]">เข้าสู่ระบบ</span>
              <span className="text-[10px] text-[#5a5e69]">เสร็จสิ้นแล้ว</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-center gap-3 sm:border-l sm:border-[#e7eeff] sm:pl-4">
            <div className="w-9 h-9 rounded-full bg-[#4648d4] text-white flex items-center justify-center text-sm font-bold shrink-0 ring-4 ring-[#e1e0ff]">
              2
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-[#4648d4] font-bold">ขั้นตอนที่ 2</span>
              <span className="text-xs font-semibold text-[#111c2d]">ยืนยันตัวตนผู้พัก</span>
              <span className="text-[10px] text-[#4648d4] font-medium">กำลังดำเนินการ</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-center gap-3 sm:border-l sm:border-[#e7eeff] sm:pl-4">
            <div className="w-9 h-9 rounded-full bg-[#dee2ef] text-[#5a5e69] flex items-center justify-center text-sm font-bold shrink-0">
              3
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-[#5a5e69] font-bold">ขั้นตอนที่ 3</span>
              <span className="text-xs font-semibold text-[#5a5e69]">สร้างตัวตนนิรนาม</span>
              <span className="text-[10px] text-[#5a5e69]">ถัดไป</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Verification Form (Cols 1-7) */}
        <div className="lg:col-span-7 rounded-2xl bg-white p-6 border border-[#e7eeff] shadow-xs flex flex-col gap-6">
          {/* Method Selection Tabs */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-[#5a5e69] uppercase tracking-wider">
              เลือกวิธีการยืนยันตัวตน
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMethod('email')}
                className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                  method === 'email'
                    ? 'border-[#4648d4] bg-[#f0f3ff] text-[#4648d4]'
                    : 'border-[#dee8ff] hover:bg-[#f9f9ff] text-[#464554]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="material-symbols-outlined text-[20px]">mail</span>
                  <span className="px-1.5 py-0.2 rounded bg-[#00873b] text-white text-[9px] font-bold">
                    แนะนำ
                  </span>
                </div>
                <span className="text-xs font-bold mt-1">อีเมลสถาบัน</span>
                <span className="text-[10px] text-[#5a5e69]">รับรหัส OTP</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('sso')}
                className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                  method === 'sso'
                    ? 'border-[#4648d4] bg-[#f0f3ff] text-[#4648d4]'
                    : 'border-[#dee8ff] hover:bg-[#f9f9ff] text-[#464554]'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">school</span>
                <span className="text-xs font-bold mt-1">พอร์ทัลมหาวิทยาลัย</span>
                <span className="text-[10px] text-[#5a5e69]">SSO เข้าสู่ระบบ</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('lease')}
                className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                  method === 'lease'
                    ? 'border-[#4648d4] bg-[#f0f3ff] text-[#4648d4]'
                    : 'border-[#dee8ff] hover:bg-[#f9f9ff] text-[#464554]'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">description</span>
                <span className="text-xs font-bold mt-1">สัญญาเช่าห้อง</span>
                <span className="text-[10px] text-[#5a5e69]">อัปโหลดเอกสาร</span>
              </button>
            </div>
          </div>

          {/* Dynamic Form Content */}
          <form onSubmit={handleVerifySubmit} className="flex flex-col gap-4">
            {/* Building & Room Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#111c2d]">อาคารหอพัก</label>
                <select
                  value={building}
                  onChange={(e) => setBuilding(e.target.value)}
                  className="h-11 px-3 rounded-xl bg-[#f0f3ff] text-xs text-[#111c2d] focus:outline-none focus:ring-2 focus:ring-[#4648d4]"
                >
                  <option value="อาคาร 1 (หอพักชาย 1)">อาคาร 1 (หอพักชาย 1)</option>
                  <option value="อาคาร 2 (หอพักชาย)">อาคาร 2 (หอพักชาย 2)</option>
                  <option value="อาคาร 3 (หอพักหญิง 1)">อาคาร 3 (หอพักหญิง 1)</option>
                  <option value="อาคาร 4 (หอพักหญิง 2)">อาคาร 4 (หอพักหญิง 2)</option>
                  <option value="อาคารนานาชาติ">อาคารนานาชาติ (Inter Dorm)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#111c2d]">หมายเลขห้อง</label>
                <input
                  type="text"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="เช่น 415"
                  required
                  className="h-11 px-3 rounded-xl bg-[#f0f3ff] text-xs text-[#111c2d] focus:outline-none focus:ring-2 focus:ring-[#4648d4]"
                />
              </div>
            </div>

            {/* Method A: Email & OTP */}
            {method === 'email' && (
              <div className="flex flex-col gap-4 pt-1">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#111c2d]">
                    อีเมลมหาวิทยาลัย (@student.ac.th)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="stu.code@student.ac.th"
                      className="flex-1 h-11 px-3 rounded-xl bg-[#f0f3ff] text-xs text-[#111c2d] focus:outline-none focus:ring-2 focus:ring-[#4648d4]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(true);
                        setCountdown(120);
                        alert('ส่งรหัส OTP 6 หลักไปยังอีเมลของคุณเรียบร้อยแล้ว');
                      }}
                      className="px-4 h-11 rounded-xl bg-[#e1e0ff] text-[#4648d4] text-xs font-semibold hover:bg-[#c0c1ff] transition-colors whitespace-nowrap"
                    >
                      {otpSent ? 'ส่งรหัสอีกครั้ง' : 'ส่งรหัส OTP'}
                    </button>
                  </div>
                </div>

                {/* 6-Digit OTP */}
                <div className="flex flex-col gap-2 p-4 rounded-xl bg-[#f0f3ff] border border-[#dee8ff]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#111c2d]">
                      รหัสยืนยัน OTP (6 หลัก)
                    </span>
                    <span className="text-[11px] text-[#4648d4] font-medium">
                      ขอรหัสใหม่ ({formatCountdown()})
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        className="w-11 h-12 text-center text-lg font-bold rounded-xl bg-white border border-[#dee8ff] text-[#111c2d] focus:outline-none focus:ring-2 focus:ring-[#4648d4]"
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-[#5a5e69]">
                    รหัสถูกส่งไปยังอีเมลของคุณ มีอายุการใช้งาน 10 นาที
                  </span>
                </div>
              </div>
            )}

            {/* Method B: University SSO */}
            {method === 'sso' && (
              <div className="p-4 rounded-xl bg-[#f0f3ff] border border-[#dee8ff] flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#4648d4] text-white flex items-center justify-center">
                    <span className="material-symbols-outlined text-[22px]">account_balance</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-[#111c2d]">
                      เชื่อมต่อพอร์ทัล Single Sign-On (SSO)
                    </h4>
                    <p className="text-[11px] text-[#5a5e69]">
                      ระบบจะดึงเฉพาะสถานะการพักอาศัยโดยไม่เก็บรหัสผ่าน
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="รหัสนักศึกษา / รหัสบุคลากร"
                    className="h-10 px-3 rounded-lg bg-white border border-[#dee8ff] text-xs"
                  />
                  <input
                    type="password"
                    placeholder="รหัสผ่าน SSO มหาวิทยาลัย"
                    className="h-10 px-3 rounded-lg bg-white border border-[#dee8ff] text-xs"
                  />
                </div>
              </div>
            )}

            {/* Method C: Lease Document */}
            {method === 'lease' && (
              <div className="p-4 rounded-xl bg-[#f0f3ff] border border-[#dee8ff] flex flex-col gap-3">
                <label className="text-xs font-semibold text-[#111c2d]">
                  เลขที่สัญญาเช่า / ใบเสร็จค่าหอพัก
                </label>
                <input
                  type="text"
                  placeholder="เช่น REC-2025-0415"
                  className="h-10 px-3 rounded-lg bg-white border border-[#dee8ff] text-xs"
                />
                <div className="border-2 border-dashed border-[#dee8ff] rounded-xl p-6 text-center flex flex-col items-center gap-2 bg-white cursor-pointer hover:bg-[#f9f9ff]">
                  <span className="material-symbols-outlined text-3xl text-[#4648d4]">
                    upload_file
                  </span>
                  <span className="text-xs font-semibold text-[#111c2d]">
                    ลากไฟล์สัญญาเช่ามาวาง หรือคลิกเพื่ออัปโหลด
                  </span>
                  <span className="text-[10px] text-[#5a5e69]">รองรับไฟล์ PDF, JPG, PNG (สูงสุด 10MB)</span>
                </div>
              </div>
            )}

            {/* Submit Verification Button */}
            <button
              type="submit"
              disabled={isVerifying}
              className="mt-2 w-full h-12 rounded-xl bg-[#4648d4] text-white hover:bg-[#6063ee] font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified
              </span>
              <span>
                {isVerifying
                  ? 'กำลังเข้ารหัสและตรวจสอบตัวตน...'
                  : verifiedSuccess
                  ? 'ยืนยันตัวตนสำเร็จแล้ว (บันทึกข้อมูล)'
                  : 'ยืนยันตัวตนและเข้าสู่ชุมชน'}
              </span>
            </button>

            {/* PDPA Trust Notice */}
            <div className="p-3 rounded-xl bg-[#f0f3ff] text-[11px] text-[#5a5e69] leading-relaxed flex items-start gap-2 border border-[#dee8ff]">
              <span
                className="material-symbols-outlined text-[16px] text-[#006b2d] shrink-0"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                shield
              </span>
              <span>
                ข้อมูลการยืนยันตัวตนจะถูกจัดเก็บในระบบปิดของนิติหอพักตาม พ.ร.บ.
                คุ้มครองข้อมูลส่วนบุคคล (PDPA) และจะไม่ถูกส่งต่อไปยังคอมมูนิตี้สาธารณะ
              </span>
            </div>
          </form>
        </div>

        {/* Right Column: Privacy Architecture Card (Cols 8-12) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-2xl bg-white p-6 border border-[#e7eeff] shadow-xs flex flex-col gap-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#e1e0ff] text-[#4648d4] flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">security</span>
              </div>
              <h3 className="font-bold text-sm text-[#111c2d]">
                สถาปัตยกรรมความเป็นส่วนตัว (Privacy by Design)
              </h3>
            </div>

            {/* Real Profile Layer (ความลับสูงสุด) */}
            <div className="rounded-xl bg-[#f0f3ff] p-4 flex flex-col gap-2.5 border border-[#dee8ff]">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#ba1a1a] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">lock</span>
                  ข้อมูลทะเบียนจริง (ความลับสูงสุด)
                </span>
                <span className="text-[10px] text-[#ba1a1a] font-semibold bg-[#ffdad6] px-1.5 py-0.2 rounded">
                  ❌ ไม่ส่งสู่ Frontend
                </span>
              </div>

              <div className="text-xs text-[#5a5e69] flex flex-col gap-1.5 pt-1">
                <div className="flex justify-between">
                  <span>ชื่อ-นามสกุลจริง:</span>
                  <span className="font-mono text-[#111c2d]">นายธนภัทร วงศ์เจริญ</span>
                </div>
                <div className="flex justify-between">
                  <span>รหัสนักศึกษา:</span>
                  <span className="font-mono text-[#111c2d]">6438****21</span>
                </div>
                <div className="flex justify-between">
                  <span>อีเมลมหาวิทยาลัย:</span>
                  <span className="font-mono text-[#111c2d]">than****@student.ac.th</span>
                </div>
                <div className="flex justify-between">
                  <span>ห้องพักจริง:</span>
                  <span className="font-mono text-[#111c2d]">
                    {building} ห้อง {room}
                  </span>
                </div>
              </div>
            </div>

            {/* Cryptographic Air Gap */}
            <div className="flex flex-col items-center gap-1 py-1">
              <span className="material-symbols-outlined text-[#4648d4] text-[24px]">
                arrow_downward
              </span>
              <div className="px-3 py-1 rounded-full bg-[#e1e0ff] text-[#4648d4] text-[10px] font-bold tracking-wider">
                SHA-256 One-Way Pseudo Hash (ไม่สามารถย้อนกลับได้)
              </div>
              <span className="material-symbols-outlined text-[#4648d4] text-[24px]">
                arrow_downward
              </span>
            </div>

            {/* Anonymous Layer */}
            <div className="rounded-xl bg-[#e7eeff] p-4 flex flex-col gap-3 border border-[#c0c1ff]">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#006b2d] flex items-center gap-1">
                  <span
                    className="material-symbols-outlined text-[16px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified
                  </span>
                  โปรไฟล์ในคอมมูนิตี้ (แสดงต่อสาธารณะ)
                </span>
                <span className="text-[10px] text-[#006b2d] font-semibold bg-[#f7fff3] px-1.5 py-0.2 rounded border border-[#00873b]/20">
                  ✓ ปลอดภัย 100%
                </span>
              </div>

              <div className="flex items-center gap-3">
                <img
                  src={user.avatarUrl || AVATAR_URL}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-[#4648d4]"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <p className="font-bold text-xs text-[#111c2d]">
                    สมาชิกนิรนาม {user.anonymousTag}
                  </p>
                  <p className="text-[11px] text-[#5a5e69]">
                    ผู้พักอาศัยยืนยันแล้ว • {user.floor}
                  </p>
                </div>
              </div>

              <p className="text-[11px] text-[#5a5e69] leading-relaxed">
                สมาชิกคนอื่นและเพื่อนร่วมหอพักจะมองเห็นเฉพาะนามสมมุตินี้เท่านั้น
                ไม่สามารถตรวจสอบย้อนกลับไปยังชื่อจริงหรือห้องพักของคุณได้
              </p>
            </div>
          </div>

          {/* Dorm Support Box */}
          <div className="rounded-2xl bg-white p-5 border border-[#e7eeff] shadow-xs text-xs text-[#5a5e69] flex flex-col gap-2">
            <span className="font-bold text-[#111c2d]">ต้องการความช่วยเหลือ?</span>
            <p className="leading-relaxed">
              หากไม่ได้รับรหัส OTP หรือพบปัญหาในการยืนยันตัวตน
              สามารถนำบัตรนักศึกษาติดต่อได้ที่สำนักงานนิติหอพัก อาคาร 1 ชั้น 1
            </p>
            <div className="flex items-center justify-between pt-1 border-t border-[#f0f3ff] text-[11px]">
              <span>โทรศัพท์สำนักงาน:</span>
              <span className="font-bold text-[#111c2d]">02-xxx-4100</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
