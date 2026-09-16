# Product Admin Dashboard

A responsive Product Admin Dashboard built with Next.js, React, Tailwind CSS, Axios, and the DummyJSON API.

The application provides authenticated product management with search, filtering, sorting, pagination, product details, and CRUD operations.

## Live Demo

https://product-dashboard-lac-seven.vercel.app/

## GitHub Repository

https://github.com/ChumbanBopche/Product_Dashboard

---

## Features

### Authentication

- Login using the DummyJSON authentication API.
- Demo credentials:
  - Username: `emilys`
  - Password: `emilyspass`
- Stores the authentication token in localStorage.
- Adds the token to API requests through a shared Axios instance.
- Protected product routes redirect unauthenticated users to the login page.
- Logout removes the stored authentication data.
- Login requests are protected against rapid duplicate submissions.

### Product Dashboard

- Responsive product table for desktop screens.
- Responsive product cards for mobile screens.
- Displays:
  - Product image
  - Title
  - Category
  - Price
  - Rating
  - Stock
- Product details page.
- View, edit, and delete actions.
- Add Product functionality.

### Search

- Product search using DummyJSON's search endpoint.
- 500ms debounce to avoid unnecessary API requests.
- Search automatically resets pagination to page 1.
- Search state is stored in the URL.
- Uses `AbortController` to cancel outdated requests.

### Category Filtering

- Categories are loaded from the DummyJSON categories endpoint.
- Category selection is stored in the URL.
- Category filtering uses DummyJSON's category endpoint.

### Search + Category Decision

DummyJSON does not support applying search and category filtering together through a single product endpoint.

Because of this, when a search term is active:

- Search takes priority.
- The category selector is disabled.
- Clearing the search enables the category selector again.

This keeps the UI behavior consistent with the API limitations.

### Sorting

Products can be sorted by:

- Title
- Price
- Rating

Both ascending and descending order are supported.

Sorting state is preserved in the URL.

### Pagination

- Supports page sizes:
  - 10
  - 20
  - 50
- Previous and Next controls.
- Page number navigation.
- Displays the current result range, for example:
  - `Showing 1–10 of 194`
- Uses DummyJSON's `limit` and `skip` parameters.
- Pagination state is stored in the URL.
- Invalid page values are normalized instead of breaking the application.

### Product Details

The product details page displays:

- Product images
- Product title
- Description
- Category
- Price
- Rating
- Stock
- Brand
- SKU
- Warranty information
- Shipping information
- Availability
- Reviews

Invalid product IDs display a Product Not Found state.

### Add / Edit / Delete

The dashboard supports:

- Adding products
- Editing products
- Deleting products
- Form validation
- Delete confirmation
- Duplicate-action protection
- Loading states during mutations

#### DummyJSON CRUD Limitation

DummyJSON does not provide persistent database storage for the application's POST, PUT, and DELETE operations.

The application therefore:

1. Sends the required CRUD request to DummyJSON.
2. Receives the API response.
3. Stores the resulting local change in localStorage.
4. Merges local changes with API data when the dashboard loads.

This allows CRUD changes to remain visible after refreshing the application.

In a production application with a real backend, this local persistence layer would be replaced by database-backed persistence.

---

## Race Condition Handling

Rapid search changes can create multiple API requests.

For example:

```text
phone
laptop
If the phone request takes longer than the laptop request, an outdated response could potentially replace the newer search results.

To prevent this, product requests use AbortController.

When a new product request starts:

The previous request is cancelled.
The latest request remains active.
Cancelled requests are ignored.
Older search results cannot replace newer results.

The implementation was tested using a delayed API request.

URL State

The following dashboard state is reflected in the URL:

Search
Category
Sort field
Sort order
Page
Page size

Example:
/products?page=1&pageSize=10&search=phone

This allows the current dashboard state to be refreshed or shared through the URL.
Invalid URL values such as invalid page numbers are handled without breaking the application.

Loading, Error and Empty States

The application includes:
Loading states
API error states
Retry functionality
Empty search results
Product not found state
Invalid URL handling
Tech Stack
Frontend
Next.js
React
TypeScript
Tailwind CSS
API
Axios
DummyJSON
Development
Git
GitHub
Vercel

Project Structure
src/
├── app/
│   ├── login/
│   │   └── page.tsx
│   ├── products/
│   │   ├── [id]/
│   │   │   ├── edit/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── add/
│   │   │   └── page.tsx
│   │   └── page.tsx
│   └── page.tsx
│
├── components/
│   ├── products/
│   │   ├── ProductCards.tsx
│   │   ├── ProductDashboard.tsx
│   │   ├── ProductForm.tsx
│   │   └── ProductTable.tsx
│   └── ui/
│       ├── ErrorState.tsx
│       └── LoadingState.tsx
│
├── hooks/
│   ├── useAuth.ts
│   └── useDebounce.ts
│
├── lib/
│   ├── axios.ts
│   └── productStorage.ts
│
├── services/
│   ├── auth.service.ts
│   └── product.service.ts
│
└── types/
    ├── auth.ts
    └── product.ts

Getting Started
1. Clone the repository
git clone <your-github-repository-url>
cd nexgensis-product-dashboard
2. Install dependencies
npm install
3. Configure environment variables

Create a .env.local file:
NEXT_PUBLIC_API_URL=https://dummyjson.com

4. Run the development server
npm run dev

Open:
http://localhost:3000

5. Login
Use:
Username: emilys
Password: emilyspass

Production Build
To create a production build:
npm run build

To run the production server:
npm start
The production build has been verified successfully.

API Endpoints Used

Authentication
POST /auth/login

Products
GET /products
GET /products/search
GET /products/category/{category}
GET /products/{id}
GET /products/categories
POST /products/add
PUT /products/{id}
DELETE /products/{id}

API Client
All API requests are centralized through Axios.

The shared Axios instance:

Uses the configured API base URL.
Adds the authentication token to requests.
Handles authentication-related errors centrally.
Supports request cancellation through AbortController.

AI Usage
AI assistance was used during development for:

Understanding the assignment requirements.
Planning the application structure.
Debugging implementation issues.
Reviewing edge cases.
Improving error handling.
Testing race-condition handling.
Reviewing implementation decisions.

Assignment Notes

Important implementation decisions:

DummyJSON is used as the API source.
Axios is used for API communication.
Search uses a 500ms debounce.
AbortController prevents outdated search responses from replacing newer results.
Search takes priority over category filtering because DummyJSON does not support combining both through the same endpoint.
CRUD API operations are performed, while localStorage maintains the visible application state because DummyJSON mutations are not persistent.
URL query parameters maintain search, filter, sort, pagination, and page-size state.
Invalid URL values are handled without breaking the dashboard.
Rapid login and mutation actions are protected against duplicate submissions.
The application is responsive for desktop and mobile layouts.

License
This project was created as a frontend development assignment for Nexgensis Technology.
