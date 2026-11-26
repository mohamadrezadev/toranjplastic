import type { Metadata } from "next";
import { Card } from "@astryxdesign/core/Card";
import { HStack } from "@astryxdesign/core/HStack";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { AdminContentRow, AdminListPage, AdminStatusFilter } from "@/components/admin/AdminContent";
import { Button } from "@/components/ui";
import { listArticles, type ContentStatus } from "@/features/admin-content/article";

export const metadata: Metadata = { title: "مقالات", robots: { index: false, follow: false } };
export const instant = false;

const statuses: ContentStatus[] = ["DRAFT", "PUBLISHED", "ARCHIVED"];

function isContentStatus(value: string | undefined): value is ContentStatus {
  return value !== undefined && (statuses as string[]).includes(value);
}

export default async function AdminArticlesPage({ searchParams }: { searchParams: Promise<{ page?: string; status?: string }> }) {
  const params = await searchParams;
  const page = Number(params.page ?? "1") || 1;
  const status = isContentStatus(params.status) ? params.status : undefined;
  const result = await listArticles({ page, status });
  const query = status ? `&status=${status}` : "";

  return (
    <AdminListPage
      title="مقالات"
      total={result.pageInfo.total}
      createHref="/admin/articles/new"
      createLabel="مقاله جدید"
      emptyTitle="هیچ مقاله‌ای با این فیلتر یافت نشد."
      headers={["عنوان", "اسلاگ", "وضعیت", "به‌روزرسانی"]}
      before={
        <Card variant="muted">
          <HStack gap={4} hAlign="between" vAlign="center" wrap="wrap">
            <VStack gap={1} hAlign="start">
              <Text as="p" weight="bold" color="inherit">سامانه مدیریت تخصصی محتوا و مقالات (Strapi CMS)</Text>
              <Text as="p" type="supporting" color="secondary">مقالات دانشنامه عمومی با سامانه Strapi مدیریت و منتشر می‌شوند. برای ایجاد و ویرایش پیشرفته، مستقیماً وارد پنل شوید.</Text>
            </VStack>
            <Button href="http://localhost:1337/admin" target="_blank" rel="noreferrer" variant="secondary">ورود مستقیم به پنل استرپی (Strapi) ↗</Button>
          </HStack>
        </Card>
      }
      filters={<AdminStatusFilter value={status} />}
      rows={result.items.map((item) => (
        <AdminContentRow key={item.id} href={`/admin/articles/${item.id}`} name={item.title} slug={item.slug} status={item.status} updatedAt={item.updatedAt} />
      ))}
      pagination={{ basePath: "/admin/articles", page, totalPages: result.pageInfo.totalPages, query }}
    />
  );
}
