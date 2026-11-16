import { updateSession } from '@/shared/lib/supabaseMiddleware';
import { type NextRequest } from 'next/server';

// Next.js 16부터 middleware.ts → proxy.ts 로 이름이 바뀌었습니다.
// 모든 요청이 페이지에 도착하기 "전에" 실행되어
// 1) Supabase 로그인 세션(쿠키)을 갱신하고
// 2) 로그인하지 않은 사용자를 /sign_in 으로 보냅니다.
export async function proxy(request: NextRequest) {
    return await updateSession(request);
}

export const config = {
    // 이미지, 정적 파일 등은 검사하지 않도록 제외
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
