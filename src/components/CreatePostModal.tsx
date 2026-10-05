import React, { useState, useRef } from 'react';
import { CATEGORIES } from '../data/mockData';
import { PostItem, UserProfile } from '../types';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitPost: (newPost: Partial<PostItem>) => void;
  user: UserProfile;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onSubmitPost,
  user,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('dorm');
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(user.defaultAnonymous);
  const [attachedImageUrl, setAttachedImageUrl] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [showImageSection, setShowImageSection] = useState(false);
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload');
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [tagsInput, setTagsInput] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Process image from device: downscale for Firestore efficiency and load fast
  const handleDeviceImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setImageError('กรุณาเลือกไฟล์รูปภาพที่ถูกต้อง (JPG, PNG, WebP, GIF)');
      return;
    }

    setImageError(null);
    setIsProcessingImage(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Downscale image to max width/height 1000px preserving aspect ratio
        const maxDim = 1000;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          setAttachedImageUrl(compressedDataUrl);
        } else {
          setAttachedImageUrl(event.target?.result as string);
        }
        setIsProcessingImage(false);
      };
      img.onerror = () => {
        setImageError('ไม่สามารถประมวลผลไฟล์รูปภาพได้');
        setIsProcessingImage(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (!customUrlInput.trim()) {
      setImageError('กรุณากรอก URL รูปภาพ');
      return;
    }
    setImageError(null);
    setAttachedImageUrl(customUrlInput.trim());
  };

  const handleRemoveImage = () => {
    setAttachedImageUrl('');
    setImageCaption('');
    setImageError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const matchedCat = CATEGORIES.find((c) => c.id === selectedCategory) || CATEGORIES[0];
    const tags = tagsInput
      ? tagsInput.split(',').map((t) => (t.trim().startsWith('#') ? t.trim() : `#${t.trim()}`))
      : [];

    onSubmitPost({
      title: title.trim() || undefined,
      content: content.trim(),
      category: matchedCat.title,
      categoryKey: matchedCat.id,
      categoryEmoji: matchedCat.emoji,
      author: isAnonymous ? `สมาชิกนิรนาม ${user.anonymousTag}` : 'นิสิตผู้พักอาศัย',
      authorBuilding: isAnonymous ? `${user.realBuilding} • ${user.floor}` : user.realBuilding,
      imageUrl: attachedImageUrl.trim() ? attachedImageUrl.trim() : undefined,
      imageCaption: imageCaption.trim() ? imageCaption.trim() : undefined,
      tags: tags.length > 0 ? tags : undefined,
    });

    // Reset state
    setTitle('');
    setContent('');
    setAttachedImageUrl('');
    setImageCaption('');
    setShowImageSection(false);
    setCustomUrlInput('');
    setTagsInput('');
    setShowTagInput(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111c2d]/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-7 shadow-2xl flex flex-col gap-4 border border-[#dee8ff] max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#f0f3ff]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#e1e0ff] text-[#4648d4] flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">edit_square</span>
            </div>
            <div>
              <h3 className="font-extrabold text-[#111c2d] text-lg">สร้างโพสต์ใหม่</h3>
              <p className="text-xs text-[#5a5e69]">แบ่งปันเรื่องราว แจ้งปัญหา หรือสอบถามเพื่อนร่วมหอ</p>
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

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Category Select Dropdown */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#111c2d]" htmlFor="postCategorySelect">
              เลือกหมวดหมู่
            </label>
            <div className="relative">
              <select
                id="postCategorySelect"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full h-11 px-3.5 pr-10 rounded-xl bg-[#f0f3ff] text-[#111c2d] text-xs sm:text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#4648d4] cursor-pointer"
              >
                <option value="dorm">🏠 เรื่องหอพัก (น้ำ, ไฟ, ความเป็นอยู่)</option>
                <option value="food">🍜 อาหารและร้านค้าแถวหอ</option>
                <option value="study">📚 การเรียนและติวสอบ</option>
                <option value="maintenance">🛠️ แจ้งปัญหา / ซ่อมบำรุงห้อง</option>
                <option value="announcement">📢 ประกาศของหาย / นิติหอ</option>
                <option value="gaming">🎮 บันเทิงและหากลุ่มเล่นเกม</option>
                <option value="general">💬 เรื่องทั่วไป / บ่นเม้าท์นิรนาม</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-3 text-[#5a5e69] pointer-events-none text-[20px]">
                expand_more
              </span>
            </div>
          </div>

          {/* Optional Post Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#111c2d]" htmlFor="postTitleInput">
              หัวข้อโพสต์ (ไม่บังคับ)
            </label>
            <input
              id="postTitleInput"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ระบุหัวข้อสั้นๆ หรือปัญหาที่ต้องการแจ้ง..."
              className="w-full h-11 px-3.5 rounded-xl bg-[#f0f3ff] text-[#111c2d] placeholder:text-[#5a5e69] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#4648d4] focus:bg-white transition-all"
            />
          </div>

          {/* Post Text Area */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#111c2d]" htmlFor="postContentArea">
              ข้อความของคุณ <span className="text-[#ba1a1a]">*</span>
            </label>
            <textarea
              id="postContentArea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              placeholder="คุณกำลังคิดอะไรอยู่? แบ่งปันข้อมูล แจ้งปัญหา หรือสอบถามเพื่อนร่วมหอพัก..."
              required
              className="w-full p-3.5 rounded-xl bg-[#f0f3ff] text-[#111c2d] placeholder:text-[#5a5e69] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#4648d4] focus:bg-white resize-none transition-all leading-relaxed"
            />
          </div>

          {/* IMAGE ATTACHMENT SECTION (From Device or URL) */}
          {showImageSection && (
            <div className="flex flex-col gap-3 p-4 rounded-2xl bg-[#f0f3ff] border border-[#dee8ff]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#111c2d] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-[#4648d4]">photo_library</span>
                  แนบรูปภาพประกอบ
                </span>

                {/* Switch between Device Upload and URL */}
                <div className="flex items-center gap-1 bg-white p-0.5 rounded-xl border border-[#dee8ff] text-[11px] font-semibold">
                  <button
                    type="button"
                    onClick={() => setImageInputMode('upload')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      imageInputMode === 'upload'
                        ? 'bg-[#4648d4] text-white shadow-2xs'
                        : 'text-[#5a5e69] hover:text-[#111c2d]'
                    }`}
                  >
                    จากตัวเครื่อง
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageInputMode('url')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      imageInputMode === 'url'
                        ? 'bg-[#4648d4] text-white shadow-2xs'
                        : 'text-[#5a5e69] hover:text-[#111c2d]'
                    }`}
                  >
                    ลิงก์ URL
                  </button>
                </div>
              </div>

              {/* Mode 1: Upload From Device */}
              {imageInputMode === 'upload' && !attachedImageUrl && (
                <div className="flex flex-col gap-2">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#dee8ff] hover:border-[#4648d4] rounded-2xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-white hover:bg-[#f9f9ff]"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleDeviceImageUpload}
                      className="hidden"
                    />
                    <div className="w-11 h-11 rounded-2xl bg-[#e1e0ff] text-[#4648d4] flex items-center justify-center shadow-2xs">
                      <span className="material-symbols-outlined text-[24px]">add_photo_alternate</span>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-[#111c2d]">
                        คลิกเพื่อเลือกรูปภาพจากเครื่องของคุณ
                      </p>
                      <p className="text-[10px] text-[#5a5e69]">รองรับไฟล์ JPG, PNG, WEBP, GIF</p>
                    </div>
                  </div>

                  {isProcessingImage && (
                    <div className="flex items-center justify-center gap-2 text-xs text-[#4648d4] font-medium py-1">
                      <span className="animate-spin material-symbols-outlined text-[16px]">sync</span>
                      <span>กำลังประมวลผลรูปภาพจากเครื่อง...</span>
                    </div>
                  )}
                </div>
              )}

              {/* Mode 2: Paste URL */}
              {imageInputMode === 'url' && !attachedImageUrl && (
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={customUrlInput}
                      onChange={(e) => {
                        setCustomUrlInput(e.target.value);
                        setImageError(null);
                      }}
                      placeholder="https://example.com/photo.jpg"
                      className="flex-1 h-10 px-3 text-xs rounded-xl bg-white border border-[#dee8ff] focus:outline-none focus:ring-2 focus:ring-[#4648d4]"
                    />
                    <button
                      type="button"
                      onClick={handleApplyUrl}
                      className="px-3.5 h-10 rounded-xl bg-[#4648d4] text-white hover:bg-[#6063ee] text-xs font-semibold shrink-0"
                    >
                      ใช้รูปนี้
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAttachedImageUrl(
                        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80'
                      );
                      setImageCaption('ภาพประกอบบริเวณหอพัก');
                    }}
                    className="text-[11px] text-[#4648d4] hover:underline self-start font-medium"
                  >
                    + ใช้ภาพตัวอย่างหอพัก
                  </button>
                </div>
              )}

              {/* Error Message */}
              {imageError && (
                <div className="p-2.5 rounded-xl bg-[#ffdad6] text-[#ba1a1a] text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  <span>{imageError}</span>
                </div>
              )}

              {/* Live Preview of Attached Image */}
              {attachedImageUrl && (
                <div className="relative rounded-2xl overflow-hidden border border-[#dee8ff] bg-white shadow-2xs">
                  <img
                    src={attachedImageUrl}
                    alt="Preview"
                    className="w-full max-h-56 object-cover"
                  />
                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-all shadow-md active:scale-95"
                    title="ลบรูปภาพนี้"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>

                  {/* Caption Input */}
                  <div className="p-2.5 bg-white border-t border-[#f0f3ff]">
                    <input
                      type="text"
                      value={imageCaption}
                      onChange={(e) => setImageCaption(e.target.value)}
                      placeholder="ใส่คำบรรยายใต้ภาพ (ไม่บังคับ เช่น ภาพห้องน้ำชั้น 2)..."
                      className="w-full h-8 px-2.5 rounded-lg bg-[#f0f3ff] text-xs text-[#111c2d] placeholder:text-[#5a5e69] focus:outline-none focus:ring-1 focus:ring-[#4648d4]"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Optional Tags Input */}
          {showTagInput && (
            <div className="flex flex-col gap-1.5 p-3 rounded-2xl bg-[#f0f3ff] border border-[#dee8ff]">
              <label className="text-xs font-semibold text-[#111c2d]">แท็ก (คั่นด้วยเครื่องหมายจุลภาค ,)</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="เช่น ซ่อมด่วน, ชั้น4, ปั๊มน้ำ"
                className="w-full h-9 px-3 text-xs rounded-xl bg-white border border-[#dee8ff] focus:outline-none focus:ring-2 focus:ring-[#4648d4]"
              />
            </div>
          )}

          {/* Anonymous Identity Toggle Switch */}
          <div className="p-3.5 rounded-2xl bg-[#f0f3ff] flex items-center justify-between border border-[#e7eeff]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#6063ee] text-white flex items-center justify-center shrink-0">
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  shield
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-xs sm:text-sm text-[#111c2d]">
                  โพสต์แบบไม่ระบุตัวตน
                </span>
                <span className="text-[11px] text-[#5a5e69]">
                  {isAnonymous
                    ? `แสดงเป็น "สมาชิกนิรนาม ${user.anonymousTag}"`
                    : 'แสดงตัวตนห้องพัก'}
                </span>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#dee2ef] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4648d4]"></div>
            </label>
          </div>

          {/* Attachment Toggle Buttons */}
          <div className="flex items-center gap-2 text-xs text-[#5a5e69]">
            <button
              type="button"
              onClick={() => {
                setShowImageSection(!showImageSection);
                if (!showImageSection && !attachedImageUrl) {
                  // Trigger file chooser directly if not open yet
                  setTimeout(() => fileInputRef.current?.click(), 100);
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all ${
                showImageSection || attachedImageUrl
                  ? 'bg-[#e1e0ff] text-[#4648d4] border-[#4648d4] font-semibold'
                  : 'bg-[#f0f3ff] hover:bg-[#dee8ff] border-transparent'
              }`}
            >
              <span className="material-symbols-outlined text-[18px] text-[#006b2d]">add_a_photo</span>
              <span>{attachedImageUrl ? 'มีรูปภาพแนบแล้ว (1)' : 'เพิ่มรูปจากเครื่อง'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowTagInput(!showTagInput)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all ${
                showTagInput
                  ? 'bg-[#e1e0ff] text-[#4648d4] border-[#4648d4] font-semibold'
                  : 'bg-[#f0f3ff] hover:bg-[#dee8ff] border-transparent'
              }`}
            >
              <span className="material-symbols-outlined text-[18px] text-[#4648d4]">tag</span>
              <span>แท็กตึก/ชั้น</span>
            </button>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#f0f3ff]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-[#5a5e69] hover:bg-[#f0f3ff] transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={!content.trim() || isProcessingImage}
              className="px-6 py-2.5 rounded-xl bg-[#4648d4] text-white hover:bg-[#6063ee] disabled:opacity-50 text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
              <span>เผยแพร่โพสต์</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
