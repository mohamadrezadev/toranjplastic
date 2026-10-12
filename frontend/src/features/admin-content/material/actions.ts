'use server';
import { archiveMaterial, createMaterial, publishMaterial, updateMaterial } from './api';
import { runAdminMutation } from '../shared/run-action';
import { materialInputFromForm } from './form-mapping';

export async function createMaterialAction(form: FormData) { return runAdminMutation(() => createMaterial(materialInputFromForm(form)), '/admin/materials/new', '/admin/materials'); }
export async function updateMaterialAction(id: string, form: FormData) { return runAdminMutation(() => updateMaterial(id, materialInputFromForm(form)), `/admin/materials/${id}`, `/admin/materials/${id}`); }
export async function publishMaterialAction(id: string) { return runAdminMutation(() => publishMaterial(id), `/admin/materials/${id}`, `/admin/materials/${id}`); }
export async function archiveMaterialAction(id: string) { return runAdminMutation(() => archiveMaterial(id), `/admin/materials/${id}`, `/admin/materials/${id}`); }
