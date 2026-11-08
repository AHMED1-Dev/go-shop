# GoShop 🛒

GoShop is a responsive e-commerce front-end built with React. It lets users browse products, search, filter, save favorites, manage a cart, and go through a checkout flow. Product data comes from the public [DummyJSON](https://dummyjson.com/) API.

> Status: Front-end complete. A Node.js + SQL back-end is the next step (see [Roadmap](#roadmap)).

## Live Demo

👉 [ahmed1-dev.github.io/go-shop](https://ahmed1-dev.github.io/go-shop/)

## Screenshots

<!-- Take 4 screenshots, put them in docs/screenshots/, then uncomment: -->
<!--
| Home | Shop |
| ---- | ---- |
| ![Home](docs/screenshots/home.png) | ![Shop](docs/screenshots/shop.png) |

| Product Details | Cart |
| --------------- | ---- |
| ![Product](docs/screenshots/product.png) | ![Cart](docs/screenshots/cart.png) |
-->

_Screenshots coming soon._

## Features

- Home: hero slider and auto-playing product sliders for every category (Swiper)
- Shop: filter by category and sort by price, rating, or discount
- Deals & New Arrivals: dedicated pages for discounted and latest products
- Product details: image gallery, rating stars, stock availability, shipping/warranty/return info, related products
- Search: live suggestions with debounce, plus a full results page
- Cart: add, remove, change quantity, live total, saved in `localStorage`
- Favorites: add/remove from any product card, saved in `localStorage`
- Checkout: shipping form with validation, order summary, Cash on Delivery, order confirmation
- Forms: reusable `useForm` hook with custom validators (required, email, phone, min length, password match) for Contact, Sign In, and Register
- Blog: buying guides with top-rated products per category
- UX: loading skeletons, error states with retry, toast notifications, page transitions, scroll-to-top on navigation
- Responsive design for mobile, tablet, and desktop

## Tech Stack

| Area          | Tools                                  |
| ------------- | -------------------------------------- |
| UI            | React, Tailwind CSS                    |
| Build         | Vite                                   |
| Routing       | React Router                           |
| State         | React Context API (cart and favorites) |
| Animation     | Framer Motion, Swiper                  |
| Notifications | react-hot-toast                        |
| Icons         | react-icons                            |
| Data          | DummyJSON REST API                     |
| Deployment    | GitHub Pages (GitHub Actions)          |

## Getting Started

Prerequisites: Node.js (LTS) and npm.

```bash
# 1. Clone the repository
git clone https://github.com/AHMED1-Dev/go-shop.git

# 2. Go into the project folder
cd go-shop

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev
```

Then open the local URL printed in the terminal.

Other scripts:

```bash
npm run build     # production build
npm run preview   # preview the production build
npm run lint      # run ESLint
```

## Current Limitations

This is a front-end project, so some parts are intentionally not real yet:

- Sign In and Register validate the form but do not create real accounts.
- Checkout does not save orders anywhere; the order number is generated in the browser.
- The Contact form does not send messages.
- Cart and favorites live only in your browser's `localStorage`.

These are all covered by the roadmap below.

## What I Learned

- Sharing state across the app with Context API and persisting it in `localStorage`
- Building a reusable form hook with validation rules
- Debouncing API calls for live search
- Fetching data with `useEffect`, handling loading and error states
- Building responsive layouts with Tailwind CSS
- Deploying a Vite + React Router app to GitHub Pages

## Roadmap

- [ ] SQL database design (users, products, orders)
- [ ] Node.js + Express REST API
- [ ] Real authentication (register / login with hashed passwords and JWT)
- [ ] Save orders and favorites in the database
- [ ] Connect the React front-end to the new API
- [ ] Deploy front-end, back-end, and database

## Author

Ahmed Mohamed Abdel-Wareth — Junior Front-End Developer

[GitHub](https://github.com/AHMED1-Dev) · [LinkedIn](https://www.linkedin.com/in/ahmed-mohamed-88a336368) · abdelwareth369@gmail.com
