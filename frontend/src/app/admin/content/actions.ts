"use server";

import { redirect } from "next/navigation";
import {
  archiveArticle,
  archiveCategory,
  archiveInjectionService,
  archiveManagedPage,
  archiveMaterial,
  archiveProduct,
  createArticle,
  createCategory,
  createInjectionService,
  createManagedPage,
  createMaterial,
  createProduct,
  publishArticle,
  publishCategory,
  publishInjectionService,
  publishManagedPage,
  publishMaterial,
  publishProduct,
  updateArticle,
  updateCategory,
  updateInjectionService,
  updateManagedPage,
  updateMaterial,
  updateProduct,
} from "@/lib/admin-content";
import {
  articleInputFromForm,
  categoryInputFromForm,
  errorKind,
  injectionServiceInputFromForm,
  managedPageInputFromForm,
  materialInputFromForm,
  productInputFromForm,
} from "./form-mapping";

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

export async function createInjectionServiceAction(form: FormData) {
  try {
    await createInjectionService(injectionServiceInputFromForm(form));
  } catch (error) {
    redirect(`/admin/services/new?error=${errorKind(error)}`);
  }
  redirect("/admin/services");
}

export async function updateInjectionServiceAction(id: string, form: FormData) {
  try {
    await updateInjectionService(id, injectionServiceInputFromForm(form));
  } catch (error) {
    redirect(`/admin/services/${id}?error=${errorKind(error)}`);
  }
  redirect(`/admin/services/${id}`);
}

export async function publishInjectionServiceAction(id: string) {
  try {
    await publishInjectionService(id);
  } catch (error) {
    redirect(`/admin/services/${id}?error=${errorKind(error)}`);
  }
  redirect(`/admin/services/${id}`);
}

export async function archiveInjectionServiceAction(id: string) {
  try {
    await archiveInjectionService(id);
  } catch (error) {
    redirect(`/admin/services/${id}?error=${errorKind(error)}`);
  }
  redirect(`/admin/services/${id}`);
}

export async function createMaterialAction(form: FormData) {
  try {
    await createMaterial(materialInputFromForm(form));
  } catch (error) {
    redirect(`/admin/materials/new?error=${errorKind(error)}`);
  }
  redirect("/admin/materials");
}

export async function updateMaterialAction(id: string, form: FormData) {
  try {
    await updateMaterial(id, materialInputFromForm(form));
  } catch (error) {
    redirect(`/admin/materials/${id}?error=${errorKind(error)}`);
  }
  redirect(`/admin/materials/${id}`);
}

export async function publishMaterialAction(id: string) {
  try {
    await publishMaterial(id);
  } catch (error) {
    redirect(`/admin/materials/${id}?error=${errorKind(error)}`);
  }
  redirect(`/admin/materials/${id}`);
}

export async function archiveMaterialAction(id: string) {
  try {
    await archiveMaterial(id);
  } catch (error) {
    redirect(`/admin/materials/${id}?error=${errorKind(error)}`);
  }
  redirect(`/admin/materials/${id}`);
}

export async function createArticleAction(form: FormData) {
  try {
    await createArticle(articleInputFromForm(form));
  } catch (error) {
    redirect(`/admin/articles/new?error=${errorKind(error)}`);
  }
  redirect("/admin/articles");
}

export async function updateArticleAction(id: string, form: FormData) {
  try {
    await updateArticle(id, articleInputFromForm(form));
  } catch (error) {
    redirect(`/admin/articles/${id}?error=${errorKind(error)}`);
  }
  redirect(`/admin/articles/${id}`);
}

export async function publishArticleAction(id: string) {
  try {
    await publishArticle(id);
  } catch (error) {
    redirect(`/admin/articles/${id}?error=${errorKind(error)}`);
  }
  redirect(`/admin/articles/${id}`);
}

export async function archiveArticleAction(id: string) {
  try {
    await archiveArticle(id);
  } catch (error) {
    redirect(`/admin/articles/${id}?error=${errorKind(error)}`);
  }
  redirect(`/admin/articles/${id}`);
}

export async function createManagedPageAction(form: FormData) {
  try {
    await createManagedPage(managedPageInputFromForm(form));
  } catch (error) {
    redirect(`/admin/pages/new?error=${errorKind(error)}`);
  }
  redirect("/admin/pages");
}

export async function updateManagedPageAction(id: string, form: FormData) {
  try {
    await updateManagedPage(id, managedPageInputFromForm(form));
  } catch (error) {
    redirect(`/admin/pages/${id}?error=${errorKind(error)}`);
  }
  redirect(`/admin/pages/${id}`);
}

export async function publishManagedPageAction(id: string) {
  try {
    await publishManagedPage(id);
  } catch (error) {
    redirect(`/admin/pages/${id}?error=${errorKind(error)}`);
  }
  redirect(`/admin/pages/${id}`);
}

export async function archiveManagedPageAction(id: string) {
  try {
    await archiveManagedPage(id);
  } catch (error) {
    redirect(`/admin/pages/${id}?error=${errorKind(error)}`);
  }
  redirect(`/admin/pages/${id}`);
}
