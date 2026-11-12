import { VStack } from "@astryxdesign/core/VStack";
import { Button } from "@/components/ui";
import { Alert } from "./Alert";

export function ErrorState({ title = "امکان انجام این بخش وجود ندارد", message = "لطفاً دوباره تلاش کنید یا بعداً بازگردید.", onRetry }: { title?: string; message?: string; onRetry?: () => void }) {
  return <VStack gap={2} tabIndex={-1} data-error-state="true">
    <Alert variant="danger" title={title}>{message}{onRetry ? <Button variant="secondary" onClick={onRetry}>تلاش دوباره</Button> : null}</Alert>
  </VStack>;
}
