// (todo) 폴더 안의 페이지가 서버에서 데이터를 불러오는 동안 자동으로 보여지는 화면입니다.
// Next.js가 page.tsx를 <Suspense fallback={<Loading />}>로 감싸 주기 때문에
// 직접 로딩 상태(useState)를 관리하지 않아도 됩니다.
export default function Loading(): React.JSX.Element {
    return (
        <div role="status" aria-live="polite" className="p-4">
            <p className="mb-4 text-sm text-muted-foreground">
                할 일을 불러오는 중...
            </p>

            {/* 실제 목록과 비슷한 모양의 회색 상자(스켈레톤)로 화면이 덜컹거리지 않게 합니다. */}
            <div className="space-y-3">
                {[1, 2, 3].map((n) => (
                    <div
                        key={n}
                        className="h-20 animate-pulse rounded-2xl bg-muted"
                    />
                ))}
            </div>
        </div>
    );
}
