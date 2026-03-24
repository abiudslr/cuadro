import type { ReactNode } from "react";

type Props = {
    sidebar: ReactNode;
    toolbar: ReactNode;
    content: ReactNode;
};

export function AppShell({ sidebar, toolbar, content }: Props) {
    return (
        <div className="h-full w-full grid grid-cols-[320px_1fr] grid-rows-[56px_1fr] bg-neutral-100">
            <div className="col-span-2 border-b bg-white">{toolbar}</div>
            <aside className="border-r bg-white overflow-auto">{sidebar}</aside>
            <main className="overflow-auto">{content}</main>
        </div>
    );
}