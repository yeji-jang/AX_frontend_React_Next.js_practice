'use client';

import { supabase } from '@/shared/lib/supabase';
import { useCallback, useEffect, useState } from 'react';
import type { Todo, TodoResponse } from '../types/todo.types';
import { toTodo } from '../utils/todoConverter';

export type FetchStatus = 'loading' | 'success' | 'error';

interface FetchResult {
    /** 어떤 요청에 대한 결과인지 구분하는 값 (id 목록 + 다시 시도 횟수) */
    key: string;
    todos: Todo[];
    error: string | null;
}

interface UsePinnedTodosResult {
    status: FetchStatus;
    todos: Todo[];
    error: string | null;
    /** 오류가 났을 때 다시 불러오기 */
    retry: () => void;
}

/**
 * 찜한 할 일의 "최신 정보"를 Supabase에서 불러오는 커스텀 훅입니다.
 *
 * 찜한 id 목록은 브라우저 저장소(localStorage)에만 있어서 서버 컴포넌트에서는 알 수 없습니다.
 * 그래서 브라우저에서 id를 읽은 뒤 useEffect로 데이터를 요청합니다.
 *
 * @param ids 찜한 할 일 id 목록
 */
export function usePinnedTodos(ids: string[]): UsePinnedTodosResult {
    // 배열은 렌더링할 때마다 새로 만들어져서 의존성 배열에 그대로 넣으면 매번 다시 요청합니다.
    // 내용이 같으면 값도 같은 "문자열"로 바꿔서, id 목록이 실제로 바뀔 때만 다시 요청하게 합니다.
    const idsKey = ids.join(',');

    // "다시 시도" 버튼을 누를 때마다 1씩 늘려서 새 요청을 만듭니다.
    const [retryCount, setRetryCount] = useState(0);
    const requestKey = `${idsKey}#${retryCount}`;

    const [result, setResult] = useState<FetchResult | null>(null);

    useEffect(() => {
        const targetIds = idsKey ? idsKey.split(',') : [];

        // 찜한 게 없으면 요청할 필요가 없습니다.
        if (targetIds.length === 0) {
            return;
        }

        // 클린업에서 요청을 취소하기 위한 컨트롤러
        const controller = new AbortController();

        supabase
            .from('todos')
            .select('*')
            .in('id', targetIds)
            .is('deleted_at', null) // 삭제된 할 일은 제외
            .order('created_at', { ascending: false })
            .abortSignal(controller.signal)
            .then(({ data, error }) => {
                // 이미 취소된 요청(화면을 떠났거나 id가 바뀜)의 결과는 무시합니다.
                if (controller.signal.aborted) return;

                setResult({
                    key: requestKey,
                    todos: error
                        ? []
                        : ((data ?? []) as TodoResponse[]).map(toTodo),
                    error: error ? '찜 목록을 불러오지 못했습니다.' : null,
                });
            });

        // 클린업 함수: 다음 요청을 보내기 전이나 화면을 떠날 때 실행됩니다.
        // 진행 중인 요청을 취소해서, 늦게 도착한 옛날 결과가 화면을 덮어쓰지 않게 합니다.
        return () => controller.abort();
    }, [idsKey, requestKey]);

    // useCallback: 렌더링할 때마다 새 함수가 만들어지지 않게 해서
    // 이 함수를 Props로 받는 컴포넌트가 불필요하게 다시 그려지지 않게 합니다.
    const retry = useCallback(() => setRetryCount((count) => count + 1), []);

    // 찜한 게 없으면 바로 "성공 + 빈 목록"
    if (idsKey === '') {
        return { status: 'success', todos: [], error: null, retry };
    }

    // 현재 요청에 대한 결과가 아직 없으면 "로딩 중"
    // (effect 안에서 setState('loading')을 바로 호출하지 않고, 결과의 key로 상태를 계산합니다.)
    if (result === null || result.key !== requestKey) {
        return { status: 'loading', todos: [], error: null, retry };
    }

    return {
        status: result.error ? 'error' : 'success',
        todos: result.todos,
        error: result.error,
        retry,
    };
}
