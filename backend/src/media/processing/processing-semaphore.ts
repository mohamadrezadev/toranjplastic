import { MediaProcessingBusyError } from './media-processing.errors.js';

export class ProcessingSemaphore {
  private active = 0;

  constructor(private readonly capacity: number) {
    if (!Number.isInteger(capacity) || capacity < 1) throw new Error('Processing capacity must be positive.');
  }

  async run<T>(operation: () => Promise<T>): Promise<T> {
    if (this.active >= this.capacity) throw new MediaProcessingBusyError();
    this.active += 1;
    try {
      return await operation();
    } finally {
      this.active -= 1;
    }
  }
}
