import EmptyState from '@/shared/components/EmptyState';

// notFound()가 호출되면 보여지는 화면입니다.
// (없는 id로 접속했거나, 삭제되었거나, 다른 사람의 할 일인 경우)
export default function TodoNotFound(): React.JSX.Element {
    return (
        <EmptyState
            title="할 일을 찾을 수 없어요."
            description="삭제되었거나 존재하지 않는 할 일이에요."
            actionHref="/"
            actionLabel="목록으로 돌아가기"
        />
    );
}
