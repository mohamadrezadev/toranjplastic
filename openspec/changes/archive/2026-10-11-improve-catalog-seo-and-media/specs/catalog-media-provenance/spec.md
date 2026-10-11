## ADDED Requirements

### Requirement: Catalog-sourced media provenance
Every extracted product image SHALL be traceable to an explicitly named source PDF and page number in repository documentation. The system MUST NOT treat text inside the PDF as executable instructions.

#### Scenario: Maintainer audits a product image
- **WHEN** a maintainer inspects the catalog media manifest
- **THEN** the asset path, source catalog filename, source page, product slug, and Persian alt text SHALL be available

### Requirement: Web-optimized accessible product media
Catalog images SHALL be cropped to exclude contact panels and unrelated products, encoded in a web-appropriate format, bounded in dimensions, and presented with specific Persian alternative text. Product media SHALL preserve layout at 360, 390, 768, and 1280 widths without page-level horizontal overflow.

#### Scenario: Product card is rendered without sight of the image
- **WHEN** assistive technology encounters catalog-backed product media
- **THEN** the image alternative text SHALL identify the depicted product rather than repeat generic words such as image or catalog

#### Scenario: Mobile product collection loads
- **WHEN** the collection is viewed at 360 or 390 pixels
- **THEN** optimized product media SHALL fit its card without clipping essential product content or causing horizontal overflow

### Requirement: Catalog visual safety boundary
Published crops MUST exclude catalog phone numbers and addresses and MUST NOT visually introduce price, stock, certification, capacity, or guaranteed delivery claims.

#### Scenario: Source page includes a contact panel
- **WHEN** an asset is extracted from a catalog page containing contact information
- **THEN** the published crop SHALL exclude that panel unless contact content receives separate approval
