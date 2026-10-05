import React from 'react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  itemName?: string;
  isDeleting?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'ยืนยันการลบกระทู้',
  itemName = 'กระทู้นี้',
  isDeleting = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111c2d]/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl flex flex-col gap-4 border border-[#ffdad6] text-[#111c2d] animate-in zoom-in-95 duration-150">
        <div className="w-12 h-12 rounded-2xl bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center self-center shadow-xs">
          <span className="material-symbols-outlined text-[28px]">delete_forever</span>
        </div>

        <div className="flex flex-col text-center gap-1.5">
          <h3 className="font-extrabold text-base text-[#111c2d]">{title}</h3>
          <p className="text-xs text-[#5a5e69] leading-relaxed">
            คุณต้องการลบ <span className="font-bold text-[#ba1a1a]">&quot;{itemName}&quot;</span> ใช่หรือไม่?
            การกระทำนี้จะลบข้อมูลออกจาก Cloud Firestore ทันทีและไม่สามารถกู้คืนได้
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="py-2.5 px-4 rounded-xl border border-[#dee8ff] text-xs font-semibold text-[#5a5e69] hover:bg-[#f0f3ff] transition-colors"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="py-2.5 px-4 rounded-xl bg-[#ba1a1a] hover:bg-[#93000a] text-white text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1.5"
          >
            {isDeleting ? (
              <span>กำลังลบ...</span>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">delete</span>
                <span>ยืนยันลบเลย</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
