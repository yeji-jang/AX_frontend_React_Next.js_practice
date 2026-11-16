'use client';
// Tiptap 에디터는 브라우저에서만 동작하므로 클라이언트 컴포넌트입니다.

import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

interface TodoContentViewerProps {
    /** Tiptap 에디터로 작성된 HTML 문자열 */
    content: string;
}

// 할 일 내용을 "읽기 전용"으로 보여주는 컴포넌트입니다.
// dangerouslySetInnerHTML로 HTML을 그대로 넣지 않고 Tiptap이 허용된 태그만 다시 그리게 해서
// <script> 같은 위험한 코드가 실행되지 않도록 합니다.
export default function TodoContentViewer({
    content,
}: TodoContentViewerProps): React.JSX.Element | null {
    const editor = useEditor({
        extensions: [StarterKit],
        content,
        editable: false, // 읽기 전용
        immediatelyRender: false, // 서버 렌더링(SSR) 시 Hydration 오류 방지
    });

    if (!editor) {
        return null;
    }

    return <EditorContent editor={editor} />;
}
