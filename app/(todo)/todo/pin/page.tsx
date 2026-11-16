'use client';
// 찜 목록은 브라우저 저장소(localStorage)에 있으므로 클라이언트 컴포넌트에서 읽습니다.
import { usePinStore } from '@/domains/todo/stores/usePinStore';
import EmptyState from '@/shared/components/EmptyState';

export default function TodoPinPage() {
    const _hasHydrated = usePinStore((state) => state._hasHydrated);
    const items = usePinStore((state) => state.items);

    // 로딩 상태: 브라우저 저장소에서 찜 목록을 아직 읽어오지 못했을 때
    if (!_hasHydrated) {
        return (
            <p role="status" className="p-4 text-sm text-muted-foreground">
                찜 목록을 불러오는 중...
            </p>
        );
    }

    // 빈 데이터 상태
    if (items.length === 0) {
        return (
            <EmptyState
                title="찜한 할 일이 없어요."
                description="할 일 목록에서 '찜하기'를 눌러 보세요."
                actionHref="/"
                actionLabel="할 일 목록으로"
            />
        );
    }

    // 성공 상태: 목록 렌더링 (key는 할 일의 고유 id)
    return (
        <ul>
            {items.map(({ id, title }, i) => (
                <li key={id}>
                    {i + 1}.{title}
                </li>
            ))}
        </ul>
    );
}
