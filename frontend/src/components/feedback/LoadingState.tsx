import { Spinner } from "@astryxdesign/core/Spinner";
import { VStack } from "@astryxdesign/core/VStack";

export function LoadingState({ label = "در حال بارگذاری…" }: { label?: string }) {
  return <VStack gap={3} padding={6} hAlign="center" role="status" aria-live="polite" aria-busy="true">
    <Spinner size="lg" label={label} />
  </VStack>;
}
