import React, { useState } from 'react';
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
  const [isAnonymous, setIsAnonymous] = useState(user.defaultAnonymous);
  const [attachedImageUrl, setAttachedImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [tagsInput, setTagsInput] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const matchedCat = CATEGORIES.find((c) => c.id === selectedCategory) || CATEGORIES[0];
    const tags = tagsInput
      ? tagsInput.split(',').map((t) => (t.trim().startsWith('#') ? t.trim() : `#${t.trim()}`))
      : [];

    onSubmitPost({
      content,
      category: matchedCat.title,
      categoryKey: matchedCat.id,
      categoryEmoji: matchedCat.emoji,
      author: isAnonymous ? `สมาชิกนิรนาม ${user.anonymousTag}` : 'นิสิตผู้พักอาศัย',
      authorBuilding: isAnonymous ? `${user.realBuilding} • ${user.floor}` : user.realBuilding,
      imageUrl: attachedImageUrl.trim() ? attachedImageUrl.trim() : undefined,
      tags: tags.length > 0 ? tags : undefined,
    });

    // Reset
    setContent('');
    setAttachedImageUrl('');
    setShowImageInput(false);
    setTagsInput('');
    setShowTagInput(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111c2d]/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl flex flex-col gap-5 border border-[#e7eeff]">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-1 border-b border-[#f0f3ff]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#e1e0ff] text-[#4648d4] flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">edit_square</span>
            </div>
            <div>
              <h3 className="font-bold text-[#111c2d] text-lg">สร้างโพสต์ใหม่</h3>
              <p className="text-xs text-[#5a5e69]">แบ่งปันเรื่องราวหรือแจ้งปัญหาอย่างปลอดภัย</p>
            </div>
          </div>
          <button
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
                className="w-full h-11 px-3.5 pr-10 rounded-xl bg-[#f0f3ff] text-[#111c2d] text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#4648d4] cursor-pointer"
              >
                <option value="dorm">🏠 เรื่องหอพัก (น้ำ, ไฟ, ความเป็นอยู่)</option>
                <option value="food">🍜 อาหารและร้านค้าแถวหอ</option>
                <option value="study">📚 การเรียนและติวสอบ</option>
                <option value="maintenance">🛠️ แจ้งปัญหา / ซ่อมบำรุงห้อง</option>
                <option value="announcement">📢 ประกาศของหาย / นิติหอ</option>
                <option value="gaming">🎮 บันเทิงและหากลุ่มเล่นเกม</option>
                <option value="general">💬 เรื่องทั่วไป / บ่นเม้าท์นิรนาม</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-3 text-[#5a5e69] pointer-events-none">
                expand_more
              </span>
            </div>
          </div>

          {/* Post Text Area */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#111c2d]" htmlFor="postContentArea">
              ข้อความของคุณ
            </label>
            <textarea
              id="postContentArea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              placeholder="คุณกำลังคิดอะไรอยู่? แบ่งปันข้อมูล แจ้งปัญหา หรือสอบถามเพื่อนร่วมหอพัก..."
              required
              className="w-full p-3 rounded-xl bg-[#f0f3ff] text-[#111c2d] placeholder:text-[#5a5e69] text-sm focus:outline-none focus:ring-2 focus:ring-[#4648d4] focus:bg-white resize-none transition-all"
            />
          </div>

          {/* Optional Image URL Input */}
          {showImageInput && (
            <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-[#f0f3ff]">
              <label className="text-xs font-semibold text-[#111c2d]">URL รูปภาพประกอบ</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={attachedImageUrl}
                  onChange={(e) => setAttachedImageUrl(e.target.value)}
                  placeholder="https://... หรือเลือกภาพตัวอย่าง"
                  className="flex-1 h-9 px-3 text-xs rounded-lg bg-white border border-[#dee8ff] focus:outline-none focus:ring-2 focus:ring-[#4648d4]"
                />
                <button
                  type="button"
                  onClick={() =>
                    setAttachedImageUrl(
                      'https://lh3.googleusercontent.com/aida-public/AB6AXuDXxFYi6KbhSPNSG3UyvZEZyhcRLThFvpVVLL9VUhY9hzwk_BLFcKoior4RpCWkwywTxmq-SP6M9ZhzP9GikXOf59LMZC7_SaOz-X6yR7BhHjzOrOFP74BDzSwgXkqevFtf9isP74cOzfXWIbFp-WuPPwdkImsA9pJYS-TtlpZke2Lhpas809SlxQ_dxkKJCpIAVh57HFknYWD73zT-KfGtRwtgzk_yEQsqO-nM57ffs3fZJCiE2ecb'
                    )
                  }
                  className="px-2.5 py-1 text-xs bg-[#e1e0ff] text-[#4648d4] rounded-lg hover:bg-[#c0c1ff]"
                >
                  ภาพตัวอย่าง
                </button>
              </div>
            </div>
          )}

          {/* Optional Tags Input */}
          {showTagInput && (
            <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-[#f0f3ff]">
              <label className="text-xs font-semibold text-[#111c2d]">แท็ก (คั่นด้วยจุลภาค)</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="เช่น ซ่อมด่วน, ชั้น4, ปั๊มน้ำ"
                className="w-full h-9 px-3 text-xs rounded-lg bg-white border border-[#dee8ff] focus:outline-none focus:ring-2 focus:ring-[#4648d4]"
              />
            </div>
          )}

          {/* Anonymous Identity Toggle Switch (Default: ON) */}
          <div className="p-3.5 rounded-xl bg-[#f0f3ff] flex items-center justify-between border border-[#e7eeff]">
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
                <span className="font-semibold text-sm text-[#111c2d]">โพสต์แบบไม่ระบุตัวตน</span>
                <span className="text-xs text-[#5a5e69]">
                  {isAnonymous
                    ? `แสดงเป็น "สมาชิกนิรนาม ${user.anonymousTag}"`
                    : 'แสดงตัวตนห้องพัก'}
                </span>
              </div>
            </div>

            {/* Toggle Switch UI */}
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

          {/* Media & Tag Attachment Pills */}
          <div className="flex items-center gap-2 text-xs text-[#5a5e69]">
            <button
              type="button"
              onClick={() => setShowImageInput(!showImageInput)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border transition-colors ${
                showImageInput
                  ? 'bg-[#e1e0ff] text-[#4648d4] border-[#4648d4]'
                  : 'bg-[#f0f3ff] hover:bg-[#dee8ff] border-transparent'
              }`}
            >
              <span className="material-symbols-outlined text-[16px] text-[#006b2d]">image</span>
              <span>เพิ่มรูปภาพ</span>
            </button>

            <button
              type="button"
              onClick={() => setShowTagInput(!showTagInput)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border transition-colors ${
                showTagInput
                  ? 'bg-[#e1e0ff] text-[#4648d4] border-[#4648d4]'
                  : 'bg-[#f0f3ff] hover:bg-[#dee8ff] border-transparent'
              }`}
            >
              <span className="material-symbols-outlined text-[16px] text-[#4648d4]">tag</span>
              <span>แท็กตึก/ชั้น</span>
            </button>
          </div>

          {/* Modal Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#f0f3ff]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-[#5a5e69] hover:bg-[#f0f3ff] transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={!content.trim()}
              className="px-6 py-2.5 rounded-xl bg-[#4648d4] text-white hover:bg-[#6063ee] disabled:opacity-50 text-sm font-semibold shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
              <span>โพสต์</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
