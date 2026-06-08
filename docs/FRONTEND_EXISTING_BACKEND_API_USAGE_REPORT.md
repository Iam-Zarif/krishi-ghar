# Frontend Existing Backend API Usage Report

Scope: main frontend API alignment against the local backend under `/Users/zarif/Documents/krishighar/backend`. Backend code was not changed.

## Supersaler Orders

- Page: `/dashboard/superseller/orders`
- Pending payment tab uses:
  - `GET /api/v1/supersaler/orders/buy`
- Paid payment tab uses the existing backend purchased-orders route:
  - `GET /api/v1/supersaler/get-own-product`
- Removed/avoided frontend API usage:
  - `GET /api/v1/supersaler/get-supersaler-purchased-products`
- Backend limitation:
  - The requested `/api/v1/supersaler/get-supersaler-purchased-products` route is not defined in the local backend routes.
  - The existing `/api/v1/supersaler/get-own-product` route name is misleading, but its controller returns `{ message, orders }`.

## Supersaler Sell Post From Purchased Products

- Pages:
  - `/dashboard/superseller/sell-post`
  - `/dashboard/superseller/all-products`
- Existing backend API used:
  - `POST /api/v1/supersaler/sell-post/create`
- Request body:
  - `{ productId, sellType, quantity, unit, sellingPricePerKg }`
- Backend behavior:
  - Backend checks that the supersaler purchased the product before creating the sell post.
  - Backend returns `stock.newRemainingQty`, which frontend now uses to update the current card quantity after a successful sell post.
- Backend limitation:
  - Backend does not expose a supersaler `my-sell-posts` or stock-summary endpoint. After page reload, frontend can only rebuild stock from purchased orders, not from already created sell posts.
  - Backend subtracts previously posted quantity per `sellType`, so global stock across retail plus bulk is not fully protected by the frontend alone.

## Wholesaler APIs

- Existing backend APIs used:
  - `GET /api/v1/wholesaler/profile`
  - `PUT /api/v1/wholesaler/profile`
  - `PUT /api/v1/wholesaler/profile-image`
  - `PUT /api/v1/wholesaler/change-password`
  - `GET /api/v1/wholesaler/products/approved`
  - `PUT /api/v1/wholesaler/products/sell/:productId`
  - `GET /api/v1/wholesaler/bulk-posts`
- Backend limitation:
  - No backend wholesaler owned-products or wholesaler sell-post-create API exists in the inspected backend. Frontend must not invent one.

## Admin Supersaler Purchase Approval

- Existing admin APIs:
  - `GET /api/v1/admin/view-supersaler-product`
  - `PATCH /api/v1/admin/update-status/:orderId`
- Backend limitation:
  - `GET /api/v1/admin/view-supersaler-product` currently filters `orderStatus: "approved"`.
  - `PATCH /api/v1/admin/update-status/:orderId` validates only `pending`, `confirmed`, `processing`, `completed`, and `cancelled` for `orderStatus`.
  - Because of that mismatch, pending supersaler purchase approval cannot be fully implemented from frontend only.
