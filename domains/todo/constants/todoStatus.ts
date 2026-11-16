import type { TodoStatus } from '../types/todo.types';

// 할 일 상태값 → 화면에 보여줄 이름
// 'use client' 파일 안에 두면 서버 컴포넌트에서 값을 읽을 수 없어서 별도 파일로 분리했습니다.
export const TODO_STATUS_MAP: Record<TodoStatus, string> = {
    READY: '준비중',
    PROGRESS: '진행중',
    DONE: '완료',
};

// 화면에 보여줄 상태 순서
export const STATUS_ORDER: TodoStatus[] = ['READY', 'PROGRESS', 'DONE'];
