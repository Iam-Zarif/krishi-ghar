# Frontend Existing Backend API Usage Report

Scope: targeted main frontend API alignment only. Backend code was not changed.

## Admin Supersaler Purchase Orders

- Page: dashboard admin purchase products view
- Frontend file:
  - `src/pages/dashboard/Admin/AdminPurchaseProducts.jsx`
- Existing backend APIs used:
  - `GET /api/v1/admin/view-supersaler-product`
  - `PATCH /api/v1/admin/update-status/:orderId`
- Removed frontend API usage:
  - `GET /api/v1/admin/view-supersaler-product?status=pending`
- Backend limitation:
  - Backend currently does not return pending supersaler orders from `/api/v1/admin/view-supersaler-product`.
  - Backend status filter support is needed later if this admin view must manage pending supersaler buy orders.

## Current Existing API Notes

- Public product APIs remain on:
  - `GET /api/v1/products/`
  - `GET /api/v1/products/categories`
  - `GET /api/v1/products/:productId`
- Supersaler buyer/order pages remain on:
  - `GET /api/v1/supersaler/orders/buy`
  - `GET /api/v1/supersaler/get-own-product`
- Supersaler product creation remains on:
  - `POST /api/v1/supersaler/product/create`
- No backend API routes were added or assumed.
