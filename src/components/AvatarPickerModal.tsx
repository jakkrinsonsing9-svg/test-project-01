import React, { useState, useRef } from 'react';
import { PRESET_AVATARS, AVATAR_URL, PresetAvatar } from '../data/mockData';

interface AvatarPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatarUrl?: string;
  onSelectAvatar: (url: string) => void;
  onShowToast: (msg: string) => void;
}

export const AvatarPickerModal: React.FC<AvatarPickerModalProps> = ({
  isOpen,
  onClose,
  currentAvatarUrl,
  onSelectAvatar,
  onShowToast,
}) => {
  const [selectedUrl, setSelectedUrl] = useState<string>(currentAvatarUrl || AVATAR_URL);
  const [customUrlInput, setCustomUrlInput] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'presets' | 'upload' | 'url'>('presets');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle local file upload with canvas downscaling for Firestore efficiency
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('กรุณาเลือกไฟล์รูปภาพที่ถูกต้อง (JPG, PNG, WebP)');
      return;
    }

    setUploadError(null);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        // Resize image to max 256x256 square to keep storage minimal
        const canvas = document.createElement('canvas');
        const size = Math.min(img.width, img.height);
        const targetSize = 256;
        canvas.width = targetSize;
        canvas.height = targetSize;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          // Crop square from center
          const offsetX = (img.width - size) / 2;
          const offsetY = (img.height - size) / 2;
          ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, targetSize, targetSize);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setSelectedUrl(dataUrl);
          setIsProcessing(false);
          onShowToast('อัปโหลดและปรับขนาดรูปภาพตัวอย่างสำเร็จ');
        } else {
          setSelectedUrl(readerEvent.target?.result as string);
          setIsProcessing(false);
        }
      };
      img.onerror = () => {
        setUploadError('ไม่สามารถประมวลผลไฟล์รูปภาพได้');
        setIsProcessing(false);
      };
      img.src = readerEvent.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCustomUrl = () => {
    const trimmed = customUrlInput.trim();
    if (!trimmed) {
      setUploadError('กรุณากรอก URL ของรูปภาพ');
      return;
    }
    setSelectedUrl(trimmed);
    onShowToast('เลือกรูปภาพจาก URL เรียบร้อย');
  };

  const handleSave = () => {
    if (!selectedUrl) return;
    onSelectAvatar(selectedUrl);
    onShowToast('เปลี่ยนรูปโปรไฟล์สำเร็จ 🎉');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111c2d]/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-7 shadow-2xl flex flex-col gap-5 border border-[#dee8ff] text-[#111c2d] max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#f0f3ff]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#e1e0ff] text-[#4648d4] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[24px]">account_circle</span>
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#111c2d]">เปลี่ยนรูปโปรไฟล์</h3>
              <p className="text-xs text-[#5a5e69]">
                เลือกรูปภาพอวตารนิรนาม หรืออัปโหลดรูปภาพของคุณเอง
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl hover:bg-[#f0f3ff] text-[#5a5e69] flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Current / Live Preview Section */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#f0f3ff] border border-[#dee8ff]">
          <div className="relative">
            <img
              src={selectedUrl}
              alt="Avatar Preview"
              className="w-16 h-16 rounded-2xl object-cover ring-4 ring-[#4648d4]/30 shadow-sm"
              onError={(e) => {
                // Fallback to initial avatar if invalid url
                (e.target as HTMLImageElement).src = AVATAR_URL;
              }}
            />
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#006b2d] ring-2 ring-white flex items-center justify-center text-white text-[12px]">
              <span className="material-symbols-outlined text-[14px]">check</span>
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-[#5a5e69]">ตัวอย่างรูปโปรไฟล์ปัจจุบัน</span>
            <span className="text-sm font-bold text-[#111c2d]">พร้อมนำไปใช้งานบนระบบ</span>
            <span className="text-[11px] text-[#006b2d] font-medium flex items-center gap-1 mt-0.5">
              <span className="material-symbols-outlined text-[14px]">shield</span>
              คงความเป็นส่วนตัวแบบไม่ระบุตัวตนจริง
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-[#f0f3ff] text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'presets'
                ? 'bg-white text-[#4648d4] shadow-xs'
                : 'text-[#5a5e69] hover:text-[#111c2d]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">gallery_thumbnail</span>
            <span>รูปสำเร็จรูป</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'upload'
                ? 'bg-white text-[#4648d4] shadow-xs'
                : 'text-[#5a5e69] hover:text-[#111c2d]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">upload_file</span>
            <span>อัปโหลดรูป</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'url'
                ? 'bg-white text-[#4648d4] shadow-xs'
                : 'text-[#5a5e69] hover:text-[#111c2d]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">link</span>
            <span>ลิงก์ URL</span>
          </button>
        </div>

        {/* Tab 1: Presets Gallery */}
        {activeTab === 'presets' && (
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold text-[#5a5e69]">
              แตะเลือกรูปอวตารที่คุณชอบ:
            </span>
            <div className="grid grid-cols-4 gap-3">
              {PRESET_AVATARS.map((avatar: PresetAvatar) => {
                const isSelected = selectedUrl === avatar.url;
                return (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => setSelectedUrl(avatar.url)}
                    className={`group relative flex flex-col items-center gap-1.5 p-2 rounded-2xl border transition-all text-center ${
                      isSelected
                        ? 'border-[#4648d4] bg-[#e1e0ff]/30 ring-2 ring-[#4648d4]'
                        : 'border-[#dee8ff] hover:border-[#4648d4]/50 hover:bg-[#f0f3ff]'
                    }`}
                  >
                    <img
                      src={avatar.url}
                      alt={avatar.name}
                      className="w-14 h-14 rounded-xl object-cover shadow-2xs group-hover:scale-105 transition-transform"
                    />
                    <span className="text-[10px] font-semibold text-[#111c2d] truncate w-full">
                      {avatar.name}
                    </span>
                    {isSelected && (
                      <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#4648d4] text-white flex items-center justify-center">
                        <span className="material-symbols-outlined text-[10px]">check</span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: File Upload */}
        {activeTab === 'upload' && (
          <div className="flex flex-col gap-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#dee8ff] hover:border-[#4648d4] rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-[#f9f9ff] hover:bg-[#f0f3ff]"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-2xl bg-[#e1e0ff] text-[#4648d4] flex items-center justify-center">
                <span className="material-symbols-outlined text-[26px]">add_photo_alternate</span>
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-[#111c2d]">
                  คลิกเพื่อเลือกรูปภาพจากเครื่องของคุณ
                </p>
                <p className="text-[10px] text-[#5a5e69]">รองรับไฟล์ JPG, PNG, WEBP</p>
              </div>
            </div>

            {uploadError && (
              <div className="p-3 rounded-xl bg-[#ffdad6] text-[#ba1a1a] text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">error</span>
                <span>{uploadError}</span>
              </div>
            )}

            {isProcessing && (
              <div className="flex items-center justify-center gap-2 text-xs text-[#4648d4] font-medium py-2">
                <span className="animate-spin material-symbols-outlined text-[16px]">sync</span>
                <span>กำลังประมวลผลและปรับขนาดรูปภาพ...</span>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Image URL Input */}
        {activeTab === 'url' && (
          <div className="flex flex-col gap-3">
            <label className="text-xs font-semibold text-[#111c2d]">
              วางลิงก์รูปภาพจากอินเทอร์เน็ต (URL):
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={customUrlInput}
                onChange={(e) => {
                  setCustomUrlInput(e.target.value);
                  setUploadError(null);
                }}
                placeholder="https://example.com/avatar.jpg"
                className="flex-1 h-11 px-3.5 rounded-xl bg-[#f0f3ff] text-xs text-[#111c2d] border border-[#dee8ff] focus:outline-none focus:ring-2 focus:ring-[#4648d4]"
              />
              <button
                type="button"
                onClick={handleApplyCustomUrl}
                className="px-4 h-11 rounded-xl bg-[#4648d4] text-white hover:bg-[#6063ee] text-xs font-semibold transition-colors shrink-0"
              >
                ดูตัวอย่าง
              </button>
            </div>
            {uploadError && (
              <span className="text-[11px] text-[#ba1a1a]">{uploadError}</span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#f0f3ff]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-[#dee8ff] text-xs font-semibold text-[#5a5e69] hover:bg-[#f0f3ff] transition-colors"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-[#4648d4] text-white hover:bg-[#6063ee] text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">save</span>
            <span>บันทึกรูปโปรไฟล์</span>
          </button>
        </div>
      </div>
    </div>
  );
};
