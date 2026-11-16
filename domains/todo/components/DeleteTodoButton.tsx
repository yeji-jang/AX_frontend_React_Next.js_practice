'use client';
// 클릭, 확인 창, "삭제 중..." 표시 등 사용자 상호작용이 필요하므로 클라이언트 컴포넌트입니다.

import { Button } from '@/shared/components/ui/button';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { FiTrash2 } from 'react-icons/fi';
import { deleteTodoAction } from '../actions/todo.actions';
import { usePinStore } from '../stores/usePinStore';

interface DeleteTodoButtonProps {
    /** 삭제할 할 일의 id */
    id: string;
    /** 확인 창에 보여줄 할 일 제목 */
    title: string;
}

export default function DeleteTodoButton({
    id,
    title,
}: DeleteTodoButtonProps): React.JSX.Element {
    const router = useRouter();
    // isPending: 서버 요청이 진행 중인지 여부 (버튼 비활성화, 문구 변경에 사용)
    const [isPending, startTransition] = useTransition();
    // 실패했을 때 보여줄 오류 메시지
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    // 삭제된 할 일을 찜 목록(브라우저 저장소)에서도 빼기 위해 사용합니다.
    const removePin = usePinStore((state) => state.remove);

    const onDelete = () => {
        // 실수로 지우지 않도록 한 번 더 확인합니다.
        if (!confirm(`'${title}' 할 일을 삭제할까요?`)) {
            return;
        }

        setErrorMessage(null);
        startTransition(async () => {
            const result = await deleteTodoAction(id);

            if (result.success) {
                removePin(id);
                // 뒤로 가기로 삭제된 상세 페이지에 돌아오지 않도록 push 대신 replace를 사용합니다.
                router.replace('/');
                router.refresh();
            } else {
                setErrorMessage(result.message ?? '삭제에 실패했습니다.');
            }
        });
    };

    return (
        <div className="flex flex-col items-end gap-1">
            <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={isPending}
                onClick={onDelete}
            >
                <FiTrash2 />
                {isPending ? '삭제 중...' : '삭제'}
            </Button>
            {errorMessage && (
                <p role="alert" className="text-xs text-red-600">
                    {errorMessage}
                </p>
            )}
        </div>
    );
}
