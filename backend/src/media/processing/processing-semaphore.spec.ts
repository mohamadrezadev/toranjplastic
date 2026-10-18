import { describe, expect, it } from 'vitest';
import { MediaProcessingBusyError } from './media-processing.errors.js';
import { ProcessingSemaphore } from './processing-semaphore.js';

describe('ProcessingSemaphore', () => {
  it('rejects work above configured capacity and releases capacity after completion', async () => {
    const semaphore = new ProcessingSemaphore(1);
    let release!: () => void;
    const blocked = new Promise<void>((resolve) => { release = resolve; });
    const first = semaphore.run(() => blocked);

    await expect(semaphore.run(async () => undefined)).rejects.toBeInstanceOf(MediaProcessingBusyError);
    release();
    await first;
    await expect(semaphore.run(async () => 'ready')).resolves.toBe('ready');
  });
});
