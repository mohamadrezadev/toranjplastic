import { EmptyState as AstryxEmptyState } from "@astryxdesign/core/EmptyState";
import type { ReactNode } from "react";
import { Button } from "@/components/ui";

type EmptyAction = { label: string; href: `/${string}` } | { label: string; onAction: () => void };

function isSafePath(path: string) { return path.startsWith("/") && !path.includes("#") && !path.startsWith("//"); }

export function EmptyState({ title, description, action, icon }: { title: string; description: string; action?: EmptyAction; icon?: ReactNode }) {
  const validAction = action && ("onAction" in action || isSafePath(action.href)) ? action : undefined;
  const actions = validAction && "href" in validAction
    ? <Button href={validAction.href} variant="secondary">{validAction.label}</Button>
    : validAction && "onAction" in validAction
      ? <Button onClick={validAction.onAction}>{validAction.label}</Button>
      : undefined;

  return <AstryxEmptyState
    headingLevel={2}
    title={title}
    description={description}
    icon={icon}
    actions={actions}
  />;
}
