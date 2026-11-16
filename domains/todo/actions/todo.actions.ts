'use server';
import { getCurrentUser } from '@/domains/auth/queries/getCurrentUser.query';
import { createServerClient } from '@/shared/lib/supabase';
import { ActionState } from '@/shared/types/action.types';
import { revalidatePath } from 'next/cache';
import type { TodoStatus } from '../types/todo.types';
import { validateTodoInput } from '../utils/todoValidation';

export async function addTodoAction(
    prevState: ActionState,
    formData: FormData,
): Promise<ActionState> {
    const title = (formData.get('title') as string) ?? '';
    const content = (formData.get('content') as string) ?? '';

    const { user } = await getCurrentUser();
    if (!user) {
        return {
            success: false,
            message: '로그인이 필요한 서비스 입니다.',
        };
    }

    // 필드별 유효성 검사
    const errors = validateTodoInput({ title, content });

    if (Object.keys(errors).length > 0) {
        return {
            success: false,
            errors,
        };
    }

    const supabase = createServerClient();

    // 할일 등록
    const { data: todo, error: todoError } = await supabase
        .from('todos')
        .insert({
            status: 'READY',
            title,
            content,
            user_id: user.id,
            user_name: user.name,
        })
        .select('id')
        .single();

    if (todoError) {
        return {
            success: false,
            message: `할일 등록에 실패했습니다: ${todoError.message}`,
        };
    }

    revalidatePath('/', 'page');

    return {
        success: true,
        message: '할일이 등록되었습니다.',
        data: { id: todo.id },
    };
}

// 할 일 수정 (제목, 내용)
// addTodoAction과 모양(prevState, formData)이 같아서 TodoForm에서 useActionState로 그대로 사용할 수 있습니다.
export async function updateTodoAction(
    prevState: ActionState,
    formData: FormData,
): Promise<ActionState> {
    const id = (formData.get('id') as string) ?? '';
    const title = (formData.get('title') as string) ?? '';
    const content = (formData.get('content') as string) ?? '';

    const { user } = await getCurrentUser();
    if (!user) {
        return { success: false, message: '로그인이 필요한 서비스 입니다.' };
    }

    // 필드별 유효성 검사 (id가 있으면 id도 함께 검사합니다)
    const errors = validateTodoInput({ id, title, content });
    if (Object.keys(errors).length > 0) {
        return { success: false, errors };
    }

    const supabase = createServerClient();

    const { data, error } = await supabase
        .from('todos')
        .update({
            title: title.trim(),
            content,
            updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id) // 내 할 일만 수정 가능
        .is('deleted_at', null) // 삭제된 할 일은 수정 불가
        .select('id')
        .maybeSingle();

    if (error || !data) {
        return {
            success: false,
            message: '할 일을 수정하지 못했습니다. 잠시 후 다시 시도해 주세요.',
        };
    }

    // 목록과 상세 페이지 모두 최신 내용이 보이도록 갱신합니다.
    revalidatePath('/', 'page');
    revalidatePath(`/todo/${id}/view`, 'page');

    return {
        success: true,
        message: '할 일이 수정되었습니다.',
        data: { id },
    };
}

// 할 일 삭제 (soft delete)
// 실제로 지우지 않고 deleted_at에 삭제 시각을 기록합니다.
// 조회 함수들이 deleted_at이 비어 있는 것만 가져오므로 화면에서는 사라집니다.
export async function deleteTodoAction(id: string): Promise<ActionState> {
    const { user } = await getCurrentUser();
    if (!user) {
        return { success: false, message: '로그인이 필요한 서비스 입니다.' };
    }

    const supabase = createServerClient();
    const now = new Date().toISOString();

    const { data, error } = await supabase
        .from('todos')
        .update({ deleted_at: now, updated_at: now })
        .eq('id', id)
        .eq('user_id', user.id) // 내 할 일만 삭제 가능
        .is('deleted_at', null) // 이미 삭제된 것은 제외
        .select('id')
        .maybeSingle();

    if (error || !data) {
        return {
            success: false,
            message: '할 일을 삭제하지 못했습니다. 잠시 후 다시 시도해 주세요.',
        };
    }

    // 목록 페이지의 캐시를 갱신해서 삭제 결과가 바로 반영되게 합니다.
    revalidatePath('/', 'page');

    return { success: true, message: '할 일이 삭제되었습니다.' };
}

export async function changeTodoStatus(
    id: string,
    status: TodoStatus,
): Promise<void> {
    const { user } = await getCurrentUser();
    if (!user) {
        throw new Error('인증되지 않은 사용자입니다.');
    }

    const supabase = createServerClient();

    const { data, error } = await supabase
        .from('todos')
        .update({
            status,
            updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .select('id')
        .single();

    if (error || !data) {
        throw new Error(
            error?.message ??
                `할일을 찾을 수 없거나 수정 권한이 없습니다. - ID: ${id}`,
        );
    }
}
