import { Button } from "@/components/ui";
import { Alert } from "./Alert";

export function ErrorState({ title = "امکان انجام این بخش وجود ندارد", message = "لطفاً دوباره تلاش کنید یا بعداً بازگردید.", onRetry }: { title?: string; message?: string; onRetry?: () => void }) {
  return <div tabIndex={-1} data-error-state>
    <Alert variant="danger" title={title}><p>{message}</p>{onRetry ? <Button variant="secondary" onClick={onRetry}>تلاش دوباره</Button> : null}</Alert>
  </div>;
}
