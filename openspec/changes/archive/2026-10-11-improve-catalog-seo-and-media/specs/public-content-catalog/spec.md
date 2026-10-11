## ADDED Requirements

### Requirement: Approved catalog content import
The backend SHALL support a reversible, auditable import of product and category records whose names, descriptions, images, and SEO fields are supported by user-approved source catalogs. Imported records MUST use stable IDs and slugs, SHALL pass the existing effective-publication boundary, and MUST NOT add price, stock, capacity, delivery, certificate, or ecommerce fields.

#### Scenario: Catalog data migration is applied
- **WHEN** the catalog content migration runs against a supported database
- **THEN** catalog-backed categories and products SHALL become available through the existing read-only public content endpoints with normalized images and SEO fields

#### Scenario: Catalog data migration is rolled back
- **WHEN** the documented targeted rollback is executed after backup verification
- **THEN** only records with fixed IDs introduced by this catalog migration SHALL be removed
