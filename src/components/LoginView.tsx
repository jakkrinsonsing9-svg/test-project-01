import React, { useState } from 'react';
import { ActiveTab, UserProfile } from '../types';
import {
  auth,
  googleProvider,
  saveUserProfileToFirestore,
  getUserProfileFromFirestore,
} from '../lib/firebase';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
} from 'firebase/auth';

interface LoginViewProps {
  user: UserProfile;
  setActiveTab: (tab: ActiveTab) => void;
  onLoginSuccess: (updatedProfile?: Partial<UserProfile>) => void;
  onShowToast: (msg: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  user,
  setActiveTab,
  onLoginSuccess,
  onShowToast,
}) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [role, setRole] = useState<'resident' | 'staff'>('resident');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentUser = auth.currentUser;

  // Helper to format identifier to email if entered as student ID
  const normalizeEmail = (val: string) => {
    const trimmed = val.trim();
    if (trimmed.includes('@')) return trimmed;
    // If student ID or alphanumeric, map to student domain
    return `${trimmed.toLowerCase()}@dormtalk.app`;
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setErrorMessage('กรุณากรอกรหัสนักศึกษา/อีเมล และรหัสผ่าน');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const email = normalizeEmail(identifier);

    try {
      if (authMode === 'signup') {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        const randomTag = `#${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        const newProfile: Partial<UserProfile> = {
          uid: userCred.user.uid,
          email: userCred.user.email || email,
          studentIdMasked: identifier.includes('@') ? identifier.slice(0, 4) + '****' : identifier.slice(0, 4) + '****',
          emailMasked: email.slice(0, 3) + '****@' + email.split('@')[1],
          realBuilding: role === 'staff' ? 'สำนักงานนิติหอพัก' : 'อาคาร 2 (หอพัก)',
          realRoom: role === 'staff' ? 'Office' : '101',
          anonymousTag: randomTag,
          floor: 'ชั้น 1',
          isVerified: true,
          defaultAnonymous: true,
        };
        await saveUserProfileToFirestore(userCred.user.uid, newProfile);
        onLoginSuccess(newProfile);
        onShowToast('ลงทะเบียนเข้าสู่ระบบ Firebase สำเร็จ 🎉');
      } else {
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        const existing = await getUserProfileFromFirestore(userCred.user.uid);
        if (existing) {
          onLoginSuccess(existing);
        } else {
          onLoginSuccess({
            uid: userCred.user.uid,
            email: userCred.user.email || email,
          });
        }
        onShowToast('เข้าสู่ระบบสำเร็จผ่าน Firebase Auth');
      }

      setActiveTab('home');
    } catch (err: any) {
      console.error('Firebase Auth error:', err);
      let msg = 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        msg = 'รหัสนักศึกษา/อีเมล หรือรหัสผ่านไม่ถูกต้อง';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'บัญชีนี้มีการลงทะเบียนแล้ว กรุณาเลือก "เข้าสู่ระบบ"';
      } else if (err.code === 'auth/weak-password') {
        msg = 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร';
      } else if (err.code === 'auth/user-not-found') {
        msg = 'ไม่พบบัญชีผู้ใช้นี้ กรุณาเลือก "ลงทะเบียนใหม่"';
      } else if (err.message) {
        msg = err.message;
      }
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  // Google Login Popup
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const existing = await getUserProfileFromFirestore(fbUser.uid);

      if (existing) {
        onLoginSuccess(existing);
      } else {
        const randomTag = `#${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        const newProfile: Partial<UserProfile> = {
          uid: fbUser.uid,
          email: fbUser.email || undefined,
          studentIdMasked: 'Google Auth',
          emailMasked: fbUser.email ? fbUser.email.slice(0, 3) + '****@' + fbUser.email.split('@')[1] : 'user@domain',
          realBuilding: 'อาคาร 2 (หอพัก)',
          realRoom: '305',
          anonymousTag: randomTag,
          floor: 'ชั้น 3',
          isVerified: true,
          defaultAnonymous: true,
        };
        await saveUserProfileToFirestore(fbUser.uid, newProfile);
        onLoginSuccess(newProfile);
      }

      onShowToast(`ยินดีต้อนรับ ${fbUser.displayName || fbUser.email}!`);
      setActiveTab('home');
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMessage('หน้าต่างล็อกอิน Google ถูกปิดก่อนทำรายการเสร็จสิ้น');
      } else {
        setErrorMessage(err.message || 'ไม่สามารถเข้าสู่ระบบด้วย Google ได้');
      }
    } finally {
      setLoading(false);
    }
  };

  // Anonymous Guest Sign-In
  const handleAnonymousSignIn = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await signInAnonymously(auth);
      const randomTag = `#GUEST${Math.floor(100 + Math.random() * 900)}`;
      const profile: Partial<UserProfile> = {
        uid: res.user.uid,
        anonymousTag: randomTag,
        studentIdMasked: 'ผู้เยี่ยมชมหอพัก',
        emailMasked: 'anonymous@guest.local',
        realBuilding: 'อาคารหอพักชั่วคราว',
        realRoom: 'Guest',
        floor: 'ชั้น 1',
        isVerified: false,
        defaultAnonymous: true,
      };
      await saveUserProfileToFirestore(res.user.uid, profile);
      onLoginSuccess(profile);
      onShowToast('เข้าใช้งานในฐานะผู้พักอาศัยชั่วคราว (Guest)');
      setActiveTab('home');
    } catch (err: any) {
      console.error('Anonymous Sign-In Error:', err);
      setErrorMessage(err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบชั่วคราว');
    } finally {
      setLoading(false);
    }
  };

  // Sign Out
  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      onShowToast('ออกจากระบบ Firebase สำเร็จ');
      setIdentifier('');
      setPassword('');
    } catch (err: any) {
      console.error('Sign Out Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 lg:px-8 pt-24 pb-20 flex flex-col gap-10">
      {/* Welcome Hero Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-[#4648d4] via-[#6063ee] to-[#7f82f8] p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-lg relative overflow-hidden">
        {/* Background decorative patterns */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>

        <div className="flex flex-col gap-4 max-w-xl z-10 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold self-center md:self-start">
            <span
              className="material-symbols-outlined text-[16px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              shield
            </span>
            <span>Cloud Firestore & Firebase Auth Real-Time</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            ยินดีต้อนรับสู่ หอคุย (DormTalk)
          </h1>
          <p className="text-sm text-white/90 leading-relaxed">
            เชื่อมต่อกับฐานข้อมูล Cloud Firestore จริง (Project: <span className="font-mono bg-white/20 px-1.5 py-0.5 rounded text-xs">dormtalk-131e0</span>)
            บันทึกและซิงค์กระทู้ ความคิดเห็น และผู้ใช้งานแบบเรียลไทม์
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-medium pt-2 justify-center md:justify-start">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#6bff8f]"></span>
              <span>Firebase Auth Connected</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#6bff8f]"></span>
              <span>Cloud Firestore Real-Time Ready</span>
            </div>
          </div>
        </div>

        {/* Firebase Live Status Card */}
        <div className="bg-white/15 backdrop-blur-xl p-5 rounded-2xl border border-white/20 flex flex-col gap-3 min-w-[280px] z-10 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm tracking-wide">สถานะการเชื่อมต่อ</span>
            <span className="px-2 py-0.5 rounded-full bg-[#6bff8f]/20 text-[#6bff8f] text-[10px] font-bold border border-[#6bff8f]/30">
              Online
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-white/80">Project ID:</span>
              <span className="font-mono font-semibold">dormtalk-131e0</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-white/80">Database:</span>
              <span className="font-semibold">Cloud Firestore</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-white/80">สถานะผู้ใช้:</span>
              <span className="font-semibold">
                {currentUser ? (currentUser.isAnonymous ? 'ผู้เยี่ยมชม (Guest)' : (currentUser.email || 'ล็อกอินแล้ว')) : 'ยังไม่ได้ล็อกอิน'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Already Logged In Panel */}
      {currentUser && (
        <div className="max-w-xl mx-auto w-full rounded-2xl bg-[#f0f3ff] p-5 border border-[#dee8ff] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#4648d4] text-white flex items-center justify-center font-bold text-sm">
              <span className="material-symbols-outlined text-[20px]">account_circle</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#111c2d]">
                เข้าสู่ระบบอยู่: {currentUser.email || 'บัญชีนิรนาม ' + user.anonymousTag}
              </span>
              <span className="text-[11px] text-[#5a5e69]">
                UID: <span className="font-mono">{currentUser.uid.slice(0, 10)}...</span>
              </span>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            disabled={loading}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-[#ba1a1a]/30 hover:bg-[#ffdad6] text-[#ba1a1a] text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span>ออกจากระบบ</span>
          </button>
        </div>
      )}

      {/* Login Card Grid */}
      <div className="max-w-xl mx-auto w-full rounded-3xl bg-white p-8 border border-[#e7eeff] shadow-sm flex flex-col gap-6">
        {/* Sign In vs Sign Up Toggle */}
        <div className="p-1 rounded-2xl bg-[#f0f3ff] grid grid-cols-2 gap-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setAuthMode('signin');
              setErrorMessage(null);
            }}
            className={`py-2.5 rounded-xl transition-all ${
              authMode === 'signin'
                ? 'bg-white text-[#4648d4] shadow-xs'
                : 'text-[#5a5e69] hover:text-[#111c2d]'
            }`}
          >
            เข้าสู่ระบบ (Sign In)
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('signup');
              setErrorMessage(null);
            }}
            className={`py-2.5 rounded-xl transition-all ${
              authMode === 'signup'
                ? 'bg-white text-[#4648d4] shadow-xs'
                : 'text-[#5a5e69] hover:text-[#111c2d]'
            }`}
          >
            ลงทะเบียนใหม่ (Sign Up)
          </button>
        </div>

        {/* Role Toggle Switch */}
        <div className="flex items-center justify-between text-xs px-1">
          <span className="text-[#5a5e69] font-medium">ประเภทสมาชิก:</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setRole('resident')}
              className={`px-3 py-1 rounded-lg transition-colors font-medium ${
                role === 'resident'
                  ? 'bg-[#e1e0ff] text-[#4648d4] font-bold'
                  : 'bg-[#f0f3ff] text-[#5a5e69]'
              }`}
            >
              ผู้พักอาศัย
            </button>
            <button
              type="button"
              onClick={() => setRole('staff')}
              className={`px-3 py-1 rounded-lg transition-colors font-medium ${
                role === 'staff'
                  ? 'bg-[#e1e0ff] text-[#4648d4] font-bold'
                  : 'bg-[#f0f3ff] text-[#5a5e69]'
              }`}
            >
              นิติ / เจ้าหน้าที่
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-[#ffdad6] border border-[#ffb4ab] text-[#ba1a1a] text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#111c2d]">
              {role === 'resident'
                ? 'รหัสนักศึกษา หรือ อีเมล'
                : 'รหัสเจ้าหน้าที่ หรือ อีเมลนิติ'}
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              placeholder={role === 'resident' ? 'เช่น 65014829 หรือ user@student.ac.th' : 'staff@dormtalk.app'}
              className="h-12 px-4 rounded-xl bg-[#f0f3ff] text-sm text-[#111c2d] focus:outline-none focus:ring-2 focus:ring-[#4648d4]"
            />
            <span className="text-[10px] text-[#5a5e69]">
              * หากใส่เป็นรหัสนักศึกษา ระบบจะบันทึกเป็นชื่อผู้ใช้งานผ่าน Firebase Auth โดยอัตโนมัติ
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#111c2d]">รหัสผ่าน</label>
              {authMode === 'signin' && (
                <button
                  type="button"
                  onClick={() => onShowToast('กรุณาติดต่อผู้ดูแลระบบหอพักหรือลองล็อกอินด้วย Google')}
                  className="text-xs text-[#4648d4] hover:underline"
                >
                  ลืมรหัสผ่าน?
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="รหัสผ่านอย่างน้อย 6 ตัวอักษร"
                className="w-full h-12 px-4 pr-12 rounded-xl bg-[#f0f3ff] text-sm text-[#111c2d] focus:outline-none focus:ring-2 focus:ring-[#4648d4]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-[#5a5e69] hover:text-[#111c2d]"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-[#5a5e69]">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-[#4648d4] accent-[#4648d4] rounded"
              />
              <span>จดจำการเข้าสู่ระบบไว้</span>
            </label>
            <span className="text-[11px] text-[#006b2d] font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">lock</span>
              Firebase Auth SSL
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-[#4648d4] hover:bg-[#6063ee] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
          >
            {loading ? (
              <span>กำลังประมวลผลกับ Firebase...</span>
            ) : (
              <>
                <span>{authMode === 'signup' ? 'สร้างบัญชีผู้ใช้ใหม่' : 'เข้าสู่ระบบ'}</span>
                <span className="material-symbols-outlined text-[18px]">
                  {authMode === 'signup' ? 'person_add' : 'login'}
                </span>
              </>
            )}
          </button>

          <div className="relative my-2 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#e7eeff]"></div>
            </div>
            <span className="relative bg-white px-3 text-xs text-[#5a5e69]">หรือ</span>
          </div>

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full h-12 rounded-xl border border-[#dee8ff] hover:bg-[#f0f3ff] text-[#111c2d] font-semibold text-xs transition-colors flex items-center justify-center gap-3 shadow-2xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>เข้าสู่ระบบด้วย Google (SSO)</span>
          </button>

          {/* Anonymous Guest Access */}
          <button
            type="button"
            onClick={handleAnonymousSignIn}
            disabled={loading}
            className="w-full h-11 rounded-xl bg-[#f0f3ff] hover:bg-[#dee8ff] text-[#5a5e69] hover:text-[#111c2d] font-medium text-xs transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">visibility_off</span>
            <span>เข้าใช้งานชั่วคราวแบบไม่ระบุตัวตน (Anonymous Guest)</span>
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-[#5a5e69]">
          มีคำถามหรือต้องการความช่วยเหลือ?{' '}
          <button
            type="button"
            onClick={() => setActiveTab('verify')}
            className="text-[#4648d4] font-bold hover:underline"
          >
            ติดต่อฝ่ายบริหารหอพัก
          </button>
        </div>
      </div>
    </div>
  );
};
