'use server';

import { getCurrentUser } from '@/domains/auth/queries/getCurrentUser.query';
import { createServerClient } from '@/shared/lib/supabase';
import type { Todo, TodoResponse } from '../types/todo.types';
import { toTodo } from '../utils/todoConverter';

export async function getTodos(): Promise<Todo[]> {
    const supabase = createServerClient();
    const { user } = await getCurrentUser();

    if (!user) return [];

    const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

    if (error) {
        // 빈 배열을 돌려주면 "할 일이 없음"과 "조회 실패"를 구분할 수 없으므로
        // 오류를 던져서 가장 가까운 error.tsx가 오류 화면을 보여주도록 합니다.
        console.error(`할일을 조회하지 못했습니다.`, error.message);
        throw new Error('할 일 목록을 불러오지 못했습니다.');
    }

    if (!data) return [];

    return (data as TodoResponse[]).map((item) => toTodo(item));
}
