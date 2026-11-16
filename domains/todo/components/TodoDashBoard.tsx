'use client';

import { produce } from 'immer';
import EmptyState from '@/shared/components/EmptyState';
import { Button } from '@/shared/components/ui/button';
import Link from 'next/link';
import { useOptimistic, useState, useTransition } from 'react';
import { changeTodoStatus } from '../actions/todo.actions';
import type { Todo, TodoStatus } from '../types/todo.types';
import { STATUS_ORDER, TODO_STATUS_MAP } from '../constants/todoStatus';
import TodoItems from './TodoItems';

interface TodoDashBoardProps {
    initialItems: Todo[];
}

interface OptimisticUpdateType {
    id: string;
    nextStatus: TodoStatus;
}

export default function TodoDashBoard({
    initialItems,
}: TodoDashBoardProps): React.JSX.Element {
    const [items, setItems] = useState<Todo[]>(initialItems);
    const [isPending, startTransition] = useTransition();

    // 낙관적 상태 관리 훅
    const [optimisticItems, setOptimisticItems] = useOptimistic(
        items,
        (currentItems, { id, nextStatus }: OptimisticUpdateType) =>
            currentItems.map((item) =>
                item.id === id ? { ...item, status: nextStatus } : item,
            ),
    );

    const onClick = (id: string, status: TodoStatus) => {
        // 이미 동일한 상태인 경우 불필요한 요청 방지
        const currentItem = items.find((item) => item.id === id);
        if (currentItem && currentItem.status === status) {
            return;
        }

        startTransition(async () => {
            // UI 즉시 반영(낙관적 상태로 선반영)
            setOptimisticItems({ id, nextStatus: status });
            try {
                // 서버에 상태 반영
                await changeTodoStatus(id, status);

                // 서버에 반영 성공 시 실제 상태 동기화
                setItems(produce(draft => {
                    const item = draft.find(item => item.id === id) ;
                    if (item) item.status = status;
                }));

            } catch (error) {
                // 실패 시 startTransition이 종료 되면서 자동으로 items(원래 상태)로 롤백됨
                console.error('상태 변경 실패:', error);
                alert(
                    '할일 상태 변경에 실패하였습니다. 잠시 후 다시 시도하세요.',
                );
            }
        });
    };

    return (
        <>
            <div className="border-b pb-3 mb-4 flex justify-between">
                <Link href="/todo/pin">
                    <Button>찜목록</Button>
                </Link>

                <Link href="/todo/new">
                    <Button>할일 등록하기</Button>
                </Link>
            </div>
            {/* 백그라운드 동기화 상태 표시 */}
            {isPending && (
                <span className="text-sm text-muted-foreground animate-pulse">
                    서버와 동기화 중...
                </span>
            )}
            {/* 빈 데이터 상태: 할 일이 하나도 없으면 상태별 목록 대신 안내 화면을 보여줍니다. */}
            {optimisticItems.length === 0 ? (
                <EmptyState
                    title="아직 등록된 할 일이 없어요."
                    description="첫 번째 할 일을 등록해 보세요!"
                    actionHref="/todo/new"
                    actionLabel="할 일 등록하기"
                />
            ) : (
                // 목록 렌더링: 상태 3개(준비중/진행중/완료)를 map으로 반복해서 그립니다.
                // key에는 바뀌지 않는 고유값(status)을 사용합니다.
                STATUS_ORDER.map((status) => (
                    <section key={status} className="border-b p-4 m-4">
                        <h2>{TODO_STATUS_MAP[status]}</h2>
                        <TodoItems
                            status={status}
                            items={optimisticItems}
                            onClick={onClick}
                        />
                    </section>
                ))
            )}
        </>
    );
}
