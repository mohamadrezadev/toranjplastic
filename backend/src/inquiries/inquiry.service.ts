import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException, Optional } from '@nestjs/common';
import type { CreateContactInquiryDto, CreateInjectionInquiryDto, CreateMaterialInquiryDto, CreateProductInquiryDto, InquiryListQueryDto } from './dto/inquiry.dto.js';
import { INQUIRY_REPOSITORY, type InquiryRepository } from './inquiry.repository.js';
import { NotificationService } from '../notifications/notifications.service.js';
import type { CustomerInquiry } from './inquiry.types.js';

const required = (value: string, label: string) => {
  const normalized = value.trim();
  if (!normalized) throw new BadRequestException(`${label} الزامی است.`);
  return normalized;
};

@Injectable()
export class InquiryService {
  constructor(
    @Inject(INQUIRY_REPOSITORY) private readonly inquiries: InquiryRepository,
    @Optional() private readonly notifications?: NotificationService,
  ) {}

  private notifyCreated(created: CustomerInquiry) {
    if (this.notifications) {
      this.notifications
        .notifyInquiryCreated({
          inquiryId: created.id,
          type: created.type,
          customerName: 'کاربر ترنج پلاستیک',
          customerMobile: '',
        })
        .catch(() => {});
    }
  }

  async createProduct(ownerId: string, dto: CreateProductInquiryDto) {
    const product = await this.inquiries.findPublishedProduct(dto.productId);
    if (!product) throw new BadRequestException('محصول انتخاب‌شده برای استعلام در دسترس نیست.');
    const result = await this.inquiries.create(ownerId, { type: 'PRODUCT', ...dto, productId: product.id, catalogItemName: product.name });
    this.notifyCreated(result);
    return result;
  }

  async createInjection(ownerId: string, dto: CreateInjectionInquiryDto) {
    const service = dto.injectionServiceId ? await this.inquiries.findPublishedService(dto.injectionServiceId) : null;
    if (dto.injectionServiceId && !service) throw new BadRequestException('خدمت انتخاب‌شده برای درخواست در دسترس نیست.');
    const result = await this.inquiries.create(ownerId, { type: 'INJECTION_SERVICE', ...dto, partDescription: required(dto.partDescription, 'شرح قطعه'), catalogItemName: service?.name });
    this.notifyCreated(result);
    return result;
  }

  async createMaterial(ownerId: string, dto: CreateMaterialInquiryDto) {
    const material = dto.materialId ? await this.inquiries.findPublishedMaterial(dto.materialId) : null;
    if (dto.materialId && !material) throw new BadRequestException('ماده انتخاب‌شده برای درخواست در دسترس نیست.');
    const result = await this.inquiries.create(ownerId, { type: 'MATERIAL', ...dto, polymerName: required(dto.polymerName, 'نام ماده یا پلیمر'), catalogItemName: material?.name });
    this.notifyCreated(result);
    return result;
  }

  async createContact(ownerId: string, dto: CreateContactInquiryDto) {
    const result = await this.inquiries.create(ownerId, { type: 'GENERAL_CONTACT', description: required(dto.description, 'متن درخواست') });
    this.notifyCreated(result);
    return result;
  }

  list(ownerId: string, query: InquiryListQueryDto) {
    return this.inquiries.list(ownerId, query);
  }

  async get(ownerId: string, id: string) {
    const inquiry = await this.inquiries.getOwned(ownerId, id);
    if (!inquiry) throw new NotFoundException('درخواست پیدا نشد.');
    return inquiry;
  }

  async addMessage(ownerId: string, id: string, text: string) {
    const normalized = text.trim();
    if (!normalized) throw new BadRequestException({ code: 'INQUIRY_INVALID_MESSAGE', message: 'متن پیام نمی‌تواند خالی باشد.' });
    const result = await this.inquiries.customerAddMessage(ownerId, id, normalized, ownerId);
    if (result.kind === 'ok') return result.inquiry;
    if (result.kind === 'not_found') throw new NotFoundException('درخواست پیدا نشد.');
    if (result.kind === 'version_conflict') throw new ConflictException({ code: 'INQUIRY_VERSION_CONFLICT', message: 'درخواست هم‌زمان تغییر کرده است؛ صفحه را تازه‌سازی کنید.' });
    throw new ConflictException({ code: 'INQUIRY_MESSAGE_NOT_ALLOWED', message: 'ارسال پیام برای این درخواست مجاز نیست.' });
  }
}
