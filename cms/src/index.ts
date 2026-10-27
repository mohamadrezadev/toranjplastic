export default {
  register(/* { strapi } */) {},

  async bootstrap({ strapi }: { strapi: any }) {
    // Automatically grant read-only permissions (find, findOne) to the Public role
    // for published articles, categories, and tags.
    try {
      const publicRole = await strapi
        .query('plugin::users-permissions.role')
        .findOne({ where: { type: 'public' } });

      if (publicRole) {
        const publicActions = [
          'api::article.article.find',
          'api::article.article.findOne',
          'api::category.category.find',
          'api::category.category.findOne',
          'api::tag.tag.find',
          'api::tag.tag.findOne',
        ];

        for (const action of publicActions) {
          const existing = await strapi
            .query('plugin::users-permissions.permission')
            .findOne({ where: { action, role: publicRole.id } });

          if (!existing) {
            await strapi.query('plugin::users-permissions.permission').create({
              data: {
                action,
                role: publicRole.id,
              },
            });
          }
        }
      }

      // Seed initial category, tag, and article if empty
      const articleCount = await strapi.documents('api::article.article').count();
      if (articleCount === 0) {
        const cat = await strapi.documents('api::category.category').create({
          data: {
            name: 'فناوری و تولید',
            slug: 'tech-production',
            description: 'فناوری‌های پیشرفته تولید و تزریق پلاستیک صنعتی',
          },
          status: 'published',
        });

        const tag = await strapi.documents('api::tag.tag').create({
          data: {
            name: 'تزریق پلاستیک',
            slug: 'plastic-injection',
          },
          status: 'published',
        });

        await strapi.documents('api::article.article').create({
          data: {
            title: 'راهنمای انتخاب مواد اولیه در قالب‌گیری تزریق پلاستیک',
            slug: 'plastic-injection-material-selection-guide',
            summary: 'بررسی جامع ویژگی‌های پلیمرهای مهندسی مانند پلی‌پروپیلن و پلی‌آمید برای بهینه‌سازی فرایند تولید صنعتی.',
            body: 'انتخاب ماده اولیه پلیمری در فرایند تزریق پلاستیک صنعتی یکی از حیاتی‌ترین گام‌ها برای تضمین کیفیت، دوام قطعه و کاهش هزینه‌های چرخه تولید است.\n\nدر صنایع بسته‌بندی، خودرو و قطعات صنعتی، ویژگی‌های مکانیکی نظیر استحکام کششی، مقاومت به ضربه و رفتار حرارتی تعیین‌کننده نوع رزین مصرفی هستند.',
            category: cat.documentId,
            tags: [tag.documentId],
            seo: {
              metaTitle: 'راهنمای انتخاب مواد اولیه در تزریق پلاستیک | ترنج پلاستیک',
              metaDescription: 'بررسی جامع و تخصصی انواع مواد اولیه تزریق پلاستیک، پلیمرهای مهندسی و نکات کلیدی تولید صنعتی در ترنج پلاستیک.',
            },
          },
          status: 'published',
        });
        strapi.log.info('Seeded sample category, tag, and published article in Strapi.');
      }

      // Ensure Revalidation Webhook exists
      const webhookUrl = process.env.FRONTEND_REVALIDATE_URL || 'http://localhost:3000/api/revalidate';
      const webhookSecret = process.env.STRAPI_REVALIDATE_SECRET || 'dev-revalidate-secret';

      const existingHook = await strapi.db.connection('strapi_webhooks').where({ name: 'Next.js Revalidation' }).first();
      if (!existingHook) {
        await strapi.db.connection('strapi_webhooks').insert({
          name: 'Next.js Revalidation',
          url: webhookUrl,
          headers: JSON.stringify({ 'x-strapi-revalidate-secret': webhookSecret }),
          events: JSON.stringify([
            'entry.publish',
            'entry.unpublish',
            'entry.update',
            'entry.delete',
          ]),
          enabled: true,
        });
        strapi.log.info('Inserted Next.js Revalidation webhook in strapi_webhooks table.');
      }
    } catch (err) {
      strapi.log.warn('Could not auto-configure public permissions or seed data:', err);
    }
  },
};
