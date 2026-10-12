'use server';
import { archiveInjectionService, createInjectionService, publishInjectionService, updateInjectionService } from './api';
import { runAdminMutation } from '../shared/run-action';
import { injectionServiceInputFromForm } from './form-mapping';

export async function createInjectionServiceAction(form: FormData) { return runAdminMutation(() => createInjectionService(injectionServiceInputFromForm(form)), '/admin/services/new', '/admin/services'); }
export async function updateInjectionServiceAction(id: string, form: FormData) { return runAdminMutation(() => updateInjectionService(id, injectionServiceInputFromForm(form)), `/admin/services/${id}`, `/admin/services/${id}`); }
export async function publishInjectionServiceAction(id: string) { return runAdminMutation(() => publishInjectionService(id), `/admin/services/${id}`, `/admin/services/${id}`); }
export async function archiveInjectionServiceAction(id: string) { return runAdminMutation(() => archiveInjectionService(id), `/admin/services/${id}`, `/admin/services/${id}`); }
