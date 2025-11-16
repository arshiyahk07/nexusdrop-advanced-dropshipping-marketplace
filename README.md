# NexusDrop: Advanced Dropshipping Marketplace

NexusDrop is a complete, production-grade dropshipping marketplace designed to connect suppliers with a global audience. The platform provides a visually stunning and intuitive user experience for buyers, alongside powerful dashboards for vendors, multi-level employee roles, and a comprehensive admin panel for full control.

The application features a sophisticated product showcase, advanced filtering, a seamless cart and checkout process, and robust user account management. Built on a modern serverless architecture, it leverages Cloudflare Workers for the backend API (Hono) and a single Durable Object for persistence. This approach demonstrates how a complex, stateful application can be built on the edge, offering incredible performance and scalability. The frontend is a masterpiece of modern UI/UX design, using React, Tailwind CSS, and Shadcn/ui to create an experience that is both beautiful and highly functional.

[cloudflarebutton]

## Key Features

-   **Modern Serverless Architecture:** High-performance backend running on Cloudflare Workers with data persistence via Durable Objects.
-   **Visually Stunning UI:** Crafted with Tailwind CSS and shadcn/ui for a beautiful, responsive, and intuitive user experience.
-   **Role-Based Access Control (RBAC):** Pre-defined roles for Admins, multi-level Employees, Vendors, and Buyers.
-   **Comprehensive Dashboards:** Dedicated portals for Vendors to manage products, Users to track orders, and Admins/Employees for platform management.
-   **Full E-commerce Flow:** Includes product listings, advanced filtering, a shopping cart, and a multi-step checkout process.
-   **Type-Safe:** End-to-end type safety with TypeScript across the frontend and backend.

## Technology Stack

-   **Frontend:** React, React Router, Zustand, Tailwind CSS, shadcn/ui, Framer Motion
-   **Backend:** Hono
-   **Platform:** Cloudflare Workers
-   **Storage:** Cloudflare Durable Objects
-   **Language:** TypeScript
-   **Build Tool:** Vite
-   **Package Manager:** Bun

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   [Node.js](https://nodejs.org/en/) (v18 or later recommended)
-   [Bun](https://bun.sh/)
-   [Cloudflare Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)

### Installation

1.  **Clone the repository:**
    ```sh
    git clone <repository-url>
    cd nexusdrop
    ```

2.  **Install dependencies:**
    This project uses Bun as the package manager.
    ```sh
    bun install
    ```

## Development

To start the local development server, which includes the Vite frontend and the Wrangler backend simultaneously, run:

```sh
bun dev
```

The application will be available at `http://localhost:3000` (or the next available port). The backend API will be accessible under the `/api` path.

## Deployment

This project is configured for seamless deployment to Cloudflare.

1.  **Login to Wrangler:**
    If you haven't already, authenticate the Wrangler CLI with your Cloudflare account.
    ```sh
    wrangler login
    ```

2.  **Deploy the application:**
    Run the deploy script to build the application and deploy it to your Cloudflare account.
    ```sh
    bun deploy
    ```

Wrangler will handle the process of building the frontend, bundling the worker, and publishing them to the Cloudflare network.

Alternatively, you can deploy directly from your GitHub repository using the button below.

[cloudflarebutton]

## Project Structure

The codebase is organized into three main directories:

-   `src/`: Contains the entire frontend React application, including pages, components, hooks, and styles.
-   `worker/`: Contains the backend Hono API that runs on Cloudflare Workers. This is where all business logic and data persistence is handled.
-   `shared/`: Contains TypeScript types and interfaces that are shared between the frontend and the backend to ensure type safety.

## License

This project is licensed under the MIT License.