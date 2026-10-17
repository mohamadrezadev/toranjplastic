const value = (form: FormData, key: string) => String(form.get(key) ?? "").trim();

export function statusInputFromForm(form: FormData) { return { toStatus: value(form, "toStatus"), expectedVersion: Number(value(form, "expectedVersion")) }; }
export function assignmentInputFromForm(form: FormData) { return { assignedAdminId: value(form, "assignedAdminId") || null, expectedVersion: Number(value(form, "expectedVersion")) }; }
export function noteInputFromForm(form: FormData) { return { text: value(form, "text") }; }
export function messageInputFromForm(form: FormData) { return { text: value(form, "text"), requestMoreInfo: value(form, "requestMoreInfo") === "true", expectedVersion: Number(value(form, "expectedVersion")) }; }
