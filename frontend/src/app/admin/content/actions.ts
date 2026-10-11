"use server";

import { redirect } from "next/navigation";
import {
  archiveCategory,
  archiveProduct,
  createCategory,
  createProduct,
  publishCategory,
  publishProduct,
  updateCategory,
  updateProduct,
} from "@/lib/admin-content";
import { categoryInputFromForm, errorKind, productInputFromForm } from "./form-mapping";

export async function createCategoryAction(form: FormData) {
  try {
    await createCategory(categoryInputFromForm(form));
  } catch (error) {
    redirect(`/admin/categories/new?error=${errorKind(error)}`);
  }
  redirect("/admin/categories");
}

export async function updateCategoryAction(id: string, form: FormData) {
  try {
    await updateCategory(id, categoryInputFromForm(form));
  } catch (error) {
    redirect(`/admin/categories/${id}?error=${errorKind(error)}`);
  }
  redirect(`/admin/categories/${id}`);
}

export async function publishCategoryAction(id: string) {
  try {
    await publishCategory(id);
  } catch (error) {
    redirect(`/admin/categories/${id}?error=${errorKind(error)}`);
  }
  redirect(`/admin/categories/${id}`);
}

export async function archiveCategoryAction(id: string) {
  try {
    await archiveCategory(id);
  } catch (error) {
    redirect(`/admin/categories/${id}?error=${errorKind(error)}`);
  }
  redirect(`/admin/categories/${id}`);
}

export async function createProductAction(form: FormData) {
  try {
    await createProduct(productInputFromForm(form));
  } catch (error) {
    redirect(`/admin/products/new?error=${errorKind(error)}`);
  }
  redirect("/admin/products");
}

export async function updateProductAction(id: string, form: FormData) {
  try {
    await updateProduct(id, productInputFromForm(form));
  } catch (error) {
    redirect(`/admin/products/${id}?error=${errorKind(error)}`);
  }
  redirect(`/admin/products/${id}`);
}

export async function publishProductAction(id: string) {
  try {
    await publishProduct(id);
  } catch (error) {
    redirect(`/admin/products/${id}?error=${errorKind(error)}`);
  }
  redirect(`/admin/products/${id}`);
}

export async function archiveProductAction(id: string) {
  try {
    await archiveProduct(id);
  } catch (error) {
    redirect(`/admin/products/${id}?error=${errorKind(error)}`);
  }
  redirect(`/admin/products/${id}`);
}
