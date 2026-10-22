import type { Todo } from "./todo.types";


// 공유할 데이터 정의
export interface PinState {
    items: Todo[];
    _hasHydrated: boolean;
}

// 상태관리 함수 정의
export interface PinActions {
    setHasHydrated: (state: boolean) => void;
    add: (item: Todo) => void;
    remove: (id: string) => void;
}

// 전역 저장소
export type PinStore = PinState & PinActions;