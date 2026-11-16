'use client';

import TiptabEditor from '@/shared/components/TiptabEditor';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { INITIAL_ACTION_STATE } from '@/shared/types/action.types';
import { useRouter } from 'next/navigation';
import { ChangeEvent, useActionState, useEffect, useState } from 'react';
import { FiAlertCircle } from 'react-icons/fi';
import { addTodoAction, updateTodoAction } from '../actions/todo.actions';
import type { Todo } from '../types/todo.types';

interface FormState {
    title: string;
    content: string;
}

interface TodoFormProps {
    /**
     * 수정할 할 일. 넘기면 "수정 모드", 넘기지 않으면 "등록 모드"로 동작합니다.
     * 폼에 필요한 값(id, title, content)만 받도록 Pick으로 타입을 좁혔습니다.
     */
    todo?: Pick<Todo, 'id' | 'title' | 'content'>;
}

// 할 일 등록 / 수정 겸용 폼
//   <TodoForm />               → 등록
//   <TodoForm todo={todo} />   → 수정 (기존 값이 채워진 상태로 시작)
export default function TodoForm({ todo }: TodoFormProps) {
    const router = useRouter();
    const isEditMode = todo !== undefined;

    // 모드에 따라 사용할 Server Action을 고릅니다. (두 Action은 모양이 같습니다)
    const [state, formAction, isPending] = useActionState(
        isEditMode ? updateTodoAction : addTodoAction,
        INITIAL_ACTION_STATE,
    );

    // 수정 모드면 기존 값으로, 등록 모드면 빈 값으로 시작합니다.
    const [form, setForm] = useState<FormState>({
        title: todo?.title ?? '',
        content: todo?.content ?? '',
    });

    const onChange = (e: ChangeEvent<HTMLInputElement> | string) => {
        setForm((prev) => {
            // Tiptap 에디터는 문자열(HTML)을, input은 이벤트 객체를 넘겨줍니다.
            if (typeof e === 'string') {
                return { ...prev, content: e };
            }
            return { ...prev, [e.target.name]: e.target.value };
        });
    };

    // 저장이 끝나면 이동할 주소: 등록 → 목록, 수정 → 그 할 일의 상세 페이지
    const redirectTo = isEditMode ? `/todo/${todo.id}/view` : '/';

    // state.success가 true로 바뀌었을 때만 실행됩니다. (의존성 배열에 사용하는 값을 모두 넣음)
    useEffect(() => {
        if (state.success) {
            router.replace(redirectTo);
            router.refresh();
        }
    }, [state.success, redirectTo, router]);

    return (
        <div>
            {state.message && !state.success && (
                <div className="mb-6 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs font-medium text-red-600">
                    <FiAlertCircle className="h-4 w-4 shrink-0" />
                    <span>{state.message}</span>
                </div>
            )}
            <form action={formAction} noValidate autoComplete="off">
                {/* 수정 모드에서는 어떤 할 일을 고칠지 알려주기 위해 id를 함께 보냅니다. */}
                {isEditMode && <input type="hidden" name="id" value={todo.id} />}
                <input type="hidden" name="content" value={form.content} />
                <div className="flex mb-2 items-center">
                    <label className="basis-30">할일</label>
                    <div className="grow">
                        <Input
                            type="text"
                            name="title"
                            value={form.title}
                            onChange={onChange}
                            className="grow"
                            placeholder="할일을 입력하세요..."
                        />
                        {state.errors?.title && (
                            <div className="mb-4">
                                <FiAlertCircle />
                                {state.errors.title}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex">
                    <label className="basis-30">내용</label>
                    <div className="grow">
                        <TiptabEditor
                            content={form.content}
                            onChange={onChange}
                        />
                        {state.errors?.content && (
                            <div className="mb-4">
                                <FiAlertCircle />
                                {state.errors.content}
                            </div>
                        )}
                    </div>
                </div>

                <Button type="submit" disabled={isPending}>
                    {isPending
                        ? '저장 중...'
                        : isEditMode
                          ? '수정하기'
                          : '등록하기'}
                </Button>
            </form>
        </div>
    );
}
