import SignOutButton from '@/domains/auth/components/SignOutButton';
import { getCurrentUser } from '@/domains/auth/queries/getCurrentUser.query';
import { Button } from '@/shared/components/ui/button';
import Link from 'next/link';
import { connection } from 'next/server';
import { FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import { FiUser } from 'react-icons/fi';

export default async function Header(): Promise<React.JSX.Element> {
    // 세션/쿠키를 읽기 전 요청 연결을 기다림 (Date.now 오류 해결)
    await connection();
    const { user } = await getCurrentUser();

    return (
        <header className="flex justify-between p-3 bg-indigo-100 mb-4 items-center">
            {/* 로고: 누르면 할 일 목록(홈)으로 이동 */}
            <Link href="/" className="text-lg font-bold text-indigo-900">
                📝 My Todo
            </Link>
            <div className="flex items-center gap-2 text-sm">
                {user ? (
                    <>
                        <FiUser className="h-3.5 w-3.5 text-blue-600" />
                        <span>{user.name}님</span>
                        <SignOutButton />
                    </>
                ) : (
                    <>
                        <Link href="/sign_in">
                            <Button
                                variant="outline"
                                className="cursor-pointer"
                            >
                                <FaSignInAlt /> 로그인
                            </Button>
                        </Link>
                        <Link href="/sign_up">
                            <Button
                                variant="secondary"
                                className="ml-1 cursor-pointer"
                            >
                                <FaUserPlus /> 회원가입
                            </Button>
                        </Link>
                    </>
                )}
            </div>
        </header>
    );
}
