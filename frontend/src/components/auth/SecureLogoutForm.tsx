import { LogoutSubmitButton } from "./LogoutSubmitButton";

interface SecureLogoutFormProps {
  /** The server action that revokes the session and redirects to login. */
  action: () => Promise<void>;
  label?: string;
}

/**
 * The single logout control for every private surface. Logout is always a
 * POST server action (never a link), and the submit button is disabled while
 * the request is pending so the revocation is not sent twice.
 */
export function SecureLogoutForm({ action, label = "خروج امن" }: SecureLogoutFormProps) {
  return <form action={action}><LogoutSubmitButton label={label} /></form>;
}
