import { redirect } from 'next/navigation';
import { errorKind } from './form-primitives';

export async function runAdminMutation(work: () => Promise<unknown>, failurePath: string, successPath: string) {
  try {
    await work();
  } catch (error) {
    redirect(`${failurePath}?error=${errorKind(error)}`);
  }
  redirect(successPath);
}
