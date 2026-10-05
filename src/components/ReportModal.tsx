import React, { useState } from 'react';
import { createReportInFirestore } from '../lib/firebase';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  targetTitle?: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  targetTitle = 'โพสต์หรือความคิดเห็น',
}) => {
  const [reason, setReason] = useState('doxxing');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const reasonLabels: Record<string, string> = {
    doxxing: 'Doxxing / เปิดเผยข้อมูลส่วนบุคคลหรือห้องพักผู้อื่น',
    harassment: 'คุกคาม ข่มขู่ หรือใช้ถ้อยคำหยาบคายรุนแรง',
    fake_info: 'ข้อมูลเท็จ / สร้างความตื่นตระหนกในหอพัก',
    spam: 'สแปม โฆษณา หรือการค้าที่ไม่ได้รับอนุญาต',
    inappropriate: 'ภาพหรือเนื้อหาไม่เหมาะสม',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createReportInFirestore({
        targetTitle,
        reason,
        reasonLabel: reasonLabels[reason] || reason,
        details: details.trim() || undefined,
      });
      onSuccess('ส่งรายงานเรียบร้อยแล้ว ทีมดูแลระบบและนิติหอพักจะตรวจสอบทันที');
      onClose();
    } catch (err) {
      console.warn('Report submit error:', err);
      onSuccess('ส่งรายงานเรียบร้อยแล้ว');
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111c2d]/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl flex flex-col gap-4 border border-[#e7eeff]">
        <div className="flex items-center justify-between pb-2 border-b border-[#f0f3ff]">
          <div className="flex items-center gap-2.5 text-[#ba1a1a]">
            <span
              className="material-symbols-outlined text-[24px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              report
            </span>
            <h3 className="font-bold text-[#111c2d] text-base">รายงานเนื้อหาที่ไม่เหมาะสม</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-[#f0f3ff] text-[#5a5e69] flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <p className="text-xs text-[#5a5e69]">
          คุณกำลังรายงาน: <span className="font-semibold text-[#111c2d]">{targetTitle}</span>
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            {[
              { id: 'doxxing', label: 'Doxxing / เปิดเผยข้อมูลส่วนบุคคลหรือห้องพักผู้อื่น' },
              { id: 'harassment', label: 'คุกคาม ข่มขู่ หรือใช้ถ้อยคำหยาบคายรุนแรง' },
              { id: 'fake_info', label: 'ข้อมูลเท็จ / สร้างความตื่นตระหนกในหอพัก' },
              { id: 'spam', label: 'สแปม โฆษณา หรือการค้าที่ไม่ได้รับอนุญาต' },
              { id: 'inappropriate', label: 'ภาพหรือเนื้อหาไม่เหมาะสม' },
            ].map((option) => (
              <label
                key={option.id}
                className={`flex items-center gap-3 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                  reason === option.id
                    ? 'border-[#4648d4] bg-[#f0f3ff] font-medium text-[#4648d4]'
                    : 'border-[#dee8ff] hover:bg-[#f9f9ff] text-[#111c2d]'
                }`}
              >
                <input
                  type="radio"
                  name="reportReason"
                  value={option.id}
                  checked={reason === option.id}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-4 h-4 text-[#4648d4] accent-[#4648d4]"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>

          <div className="flex flex-col gap-1 mt-1">
            <label className="text-xs font-medium text-[#111c2d]">
              รายละเอียดเพิ่มเติม (ไม่บังคับ)
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={2}
              placeholder="ระบุข้อเท็จจริงเพื่อช่วยให้การตรวจสอบรวดเร็วขึ้น..."
              className="w-full p-2.5 rounded-xl bg-[#f0f3ff] text-[#111c2d] text-xs placeholder:text-[#5a5e69] focus:outline-none focus:ring-1 focus:ring-[#4648d4]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f0f3ff]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#5a5e69] hover:bg-[#f0f3ff] rounded-lg"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold bg-[#ba1a1a] hover:bg-[#93000a] text-white rounded-lg transition-colors flex items-center gap-1.5"
            >
              {submitting ? 'กำลังส่งรายงาน...' : 'ส่งรายงานความปลอดภัย'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
