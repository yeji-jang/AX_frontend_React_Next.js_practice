// 서버 컴포넌트: 서버에서 Supabase로 할 일 1개를 조회해 HTML로 만들어 보냅니다.
// → 브라우저는 완성된 화면을 바로 받으므로 첫 화면이 빠르고, 조회 코드가 브라우저로 전송되지 않습니다.
import { notFound } from 'next/navigation';
import { TODO_STATUS_MAP } from '../constants/todoStatus';
import { getTodoById } from '../queries/getTodoById.query';
import TodoContentViewer from './TodoContentViewer';

interface TodoDetailProps {
    /** 주소창의 [id] 부분 (예: /todo/abc/view → 'abc') */
    id: string;
}

// 날짜를 한국 시간 기준 "2026. 11. 16. 오후 3:20" 형태로 바꿉니다.
// (Vercel 서버는 UTC 시간대라서 timeZone을 꼭 지정해야 합니다.)
function formatDate(value?: string): string {
    if (!value) return '-';
    return new Date(value).toLocaleString('ko-KR', {
        timeZone: 'Asia/Seoul',
        dateStyle: 'medium',
        timeStyle: 'short',
    });
}

export default async function TodoDetail({
    id,
}: TodoDetailProps): Promise<React.JSX.Element> {
    const todo = await getTodoById(id);

    // 없는 id이거나 다른 사람의 할 일이면 not-found.tsx 화면을 보여줍니다.
    if (!todo) {
        notFound();
    }

    return (
        <article className="rounded-2xl border p-6">
            <span className="mb-2 inline-block rounded-full bg-muted px-3 py-1 text-xs font-medium">
                {TODO_STATUS_MAP[todo.status]}
            </span>
            <h1 className="mb-4 text-2xl font-bold">{todo.title}</h1>

            <dl className="mb-6 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <dt>작성일</dt>
                <dd>{formatDate(todo.createdAt)}</dd>
                <dt>수정일</dt>
                <dd>{formatDate(todo.updatedAt)}</dd>
            </dl>

            <TodoContentViewer content={todo.content} />
        </article>
    );
}
