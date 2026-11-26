import { VStack } from "@astryxdesign/core/VStack";
import { Button } from "@/components/ui";
import { Alert, type AlertHeadingLevel } from "./Alert";

/** `headingLevel` is opt-in (see Alert): callers that do not pass it keep their plain title. */
export function ErrorState({ title = "امکان انجام این بخش وجود ندارد", message = "لطفاً دوباره تلاش کنید یا بعداً بازگردید.", onRetry, headingLevel }: { title?: string; message?: string; onRetry?: () => void; headingLevel?: AlertHeadingLevel }) {
  return <VStack gap={2} tabIndex={-1} data-error-state="true">
    <Alert variant="danger" title={title} headingLevel={headingLevel}>{message}{onRetry ? <Button variant="secondary" onClick={onRetry}>تلاش دوباره</Button> : null}</Alert>
  </VStack>;
}
