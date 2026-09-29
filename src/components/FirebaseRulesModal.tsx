import React, { useState } from 'react';

interface FirebaseRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FIRESTORE_RULES_CONTENT = `rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    function isSignedIn() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }

    // Connectivity test
    match /test/{docId} {
      allow read, write: if true;
    }

    // User profiles
    match /users/{userId} {
      allow read: if true;
      allow write: if isOwner(userId) || !isSignedIn();
    }

    // Community posts
    match /posts/{postId} {
      allow read: if true;
      allow create: if true;
      allow update: if true;
      allow delete: if isSignedIn() && (resource.data.authorUid == request.auth.uid);

      // Threaded comments
      match /comments/{commentId} {
        allow read: if true;
        allow create: if true;
        allow update: if true;
        allow delete: if isSignedIn() && (resource.data.authorUid == request.auth.uid);
      }
    }
  }
}`;

export const FirebaseRulesModal: React.FC<FirebaseRulesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(FIRESTORE_RULES_CONTENT);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111c2d]/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl flex flex-col gap-4 border border-[#dee8ff] text-[#111c2d] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#f0f3ff]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#fff3e0] text-[#e65100] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[24px]">security</span>
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#111c2d]">
                Cloud Firestore Security Rules
              </h3>
              <p className="text-xs text-[#5a5e69]">
                สำหรับโปรเจกต์ Firebase: <span className="font-mono font-semibold text-[#4648d4]">dormtalk-131e0</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl hover:bg-[#f0f3ff] text-[#5a5e69] flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-4 rounded-xl bg-[#f0f7ff] border border-[#d0e5ff] text-xs leading-relaxed text-[#1a4971] flex flex-col gap-2">
          <div className="flex items-center gap-1.5 font-bold text-sm text-[#005fb0]">
            <span className="material-symbols-outlined text-[18px]">info</span>
            <span>ขั้นตอนการตั้งค่าสิทธิ์บน Firebase Console:</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 pl-1">
            <li>
              เปิดหน้า{' '}
              <a
                href="https://console.firebase.google.com/project/dormtalk-131e0/firestore/rules"
                target="_blank"
                rel="noreferrer"
                className="text-[#4648d4] font-semibold underline hover:text-[#3234a9]"
              >
                Firebase Console &gt; Firestore Database &gt; Rules
              </a>
            </li>
            <li>คัดลอกโค้ดด้านล่างนี้ไปวางแทนที่ของเดิมทั้งหมด</li>
            <li>คลิกปุ่ม <strong>&quot;Publish&quot; (เผยแพร่)</strong></li>
            <li>กลับมารีเฟรชหน้านี้ ข้อมูลโพสต์และคอมเมนต์จะซิงค์กับฐานข้อมูลจริงทันที</li>
          </ol>
        </div>

        <div className="relative rounded-xl overflow-hidden border border-[#d6e3ff] bg-[#1e2029]">
          <div className="flex items-center justify-between px-4 py-2 bg-[#171922] border-b border-white/10 text-xs text-white/80">
            <span className="font-mono">firestore.rules</span>
            <button
              onClick={handleCopy}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                copied
                  ? 'bg-[#6bff8f] text-[#003912]'
                  : 'bg-[#4648d4] hover:bg-[#6063ee] text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {copied ? 'check' : 'content_copy'}
              </span>
              <span>{copied ? 'คัดลอกสำเร็จ!' : 'คัดลอก Rules ทั้งหมด'}</span>
            </button>
          </div>
          <pre className="p-4 text-xs font-mono text-[#d6e3ff] overflow-x-auto max-h-72 leading-relaxed">
            {FIRESTORE_RULES_CONTENT}
          </pre>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#f0f3ff] text-xs">
          <span className="text-[#5a5e69]">
            * หากยังไม่ได้ Publish Rules ระบบจะแสดงข้อมูลจำลองในเครื่องให้ก่อนเพื่อความต่อเนื่อง
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#4648d4] text-white hover:bg-[#6063ee] transition-colors"
            >
              เข้าใจแล้ว ปิดหน้าต่าง
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
