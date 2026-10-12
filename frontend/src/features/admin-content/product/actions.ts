'use server';
import { archiveProduct, createProduct, publishProduct, updateProduct } from './api';
import { runAdminMutation } from '../shared/run-action';
import { productInputFromForm } from './form-mapping';

export async function createProductAction(form: FormData) { return runAdminMutation(() => createProduct(productInputFromForm(form)), '/admin/products/new', '/admin/products'); }
export async function updateProductAction(id: string, form: FormData) { return runAdminMutation(() => updateProduct(id, productInputFromForm(form)), `/admin/products/${id}`, `/admin/products/${id}`); }
export async function publishProductAction(id: string) { return runAdminMutation(() => publishProduct(id), `/admin/products/${id}`, `/admin/products/${id}`); }
export async function archiveProductAction(id: string) { return runAdminMutation(() => archiveProduct(id), `/admin/products/${id}`, `/admin/products/${id}`); }
