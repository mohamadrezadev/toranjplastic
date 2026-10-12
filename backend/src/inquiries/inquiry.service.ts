import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { CreateContactInquiryDto, CreateInjectionInquiryDto, CreateMaterialInquiryDto, CreateProductInquiryDto, InquiryListQueryDto } from './dto/inquiry.dto.js';
import { INQUIRY_REPOSITORY, type InquiryRepository } from './inquiry.repository.js';

const required = (value: string, label: string) => {
  const normalized = value.trim();
  if (!normalized) throw new BadRequestException(`${label} الزامی است.`);
  return normalized;
};

@Injectable()
export class InquiryService {
  constructor(@Inject(INQUIRY_REPOSITORY) private readonly inquiries: InquiryRepository) {}

  async createProduct(ownerId: string, dto: CreateProductInquiryDto) {
    const product = await this.inquiries.findPublishedProduct(dto.productId);
    if (!product) throw new BadRequestException('محصول انتخاب‌شده برای استعلام در دسترس نیست.');
    return this.inquiries.create(ownerId, { type: 'PRODUCT', ...dto, productId: product.id, catalogItemName: product.name });
  }

  async createInjection(ownerId: string, dto: CreateInjectionInquiryDto) {
    const service = dto.injectionServiceId ? await this.inquiries.findPublishedService(dto.injectionServiceId) : null;
    if (dto.injectionServiceId && !service) throw new BadRequestException('خدمت انتخاب‌شده برای درخواست در دسترس نیست.');
    return this.inquiries.create(ownerId, { type: 'INJECTION_SERVICE', ...dto, partDescription: required(dto.partDescription, 'شرح قطعه'), catalogItemName: service?.name });
  }

  async createMaterial(ownerId: string, dto: CreateMaterialInquiryDto) {
    const material = dto.materialId ? await this.inquiries.findPublishedMaterial(dto.materialId) : null;
    if (dto.materialId && !material) throw new BadRequestException('ماده انتخاب‌شده برای درخواست در دسترس نیست.');
    return this.inquiries.create(ownerId, { type: 'MATERIAL', ...dto, polymerName: required(dto.polymerName, 'نام ماده یا پلیمر'), catalogItemName: material?.name });
  }

  createContact(ownerId: string, dto: CreateContactInquiryDto) {
    return this.inquiries.create(ownerId, { type: 'GENERAL_CONTACT', description: required(dto.description, 'متن درخواست') });
  }

  list(ownerId: string, query: InquiryListQueryDto) {
    return this.inquiries.list(ownerId, query);
  }

  async get(ownerId: string, id: string) {
    const inquiry = await this.inquiries.getOwned(ownerId, id);
    if (!inquiry) throw new NotFoundException('درخواست پیدا نشد.');
    return inquiry;
  }
}
