# CarMarket - Second-Hand Car Marketplace

CarMarket is a React-based second-hand car marketplace for the Indian market. Features include Google authentication, admin dashboard for inventory management, responsive design with mobile navigation, and WhatsApp integration. Built with TypeScript, Vite, shadcn/ui, Tailwind CSS, and Firebase services.

## Technology Stack

- **Frontend:** React, TypeScript, Vite
- **UI Components:** shadcn/ui
- **Styling:** Tailwind CSS
- **Backend Services:** Firebase
- **Authentication:** Google Sign-In
- **Storage:** Firebase Storage

## Features

- Public car listings with search/filter
- Admin dashboard for inventory management
- Mobile-responsive design
- WhatsApp integration
- Multi-image upload support
- Role-based access control
- `package.json` - NPM dependencies and scripts
- `src/app.tsx` - Root component of the project
- `src/main.tsx` - Project entry point
- `src/index.css` - Existing CSS configuration
- `src/pages/Index.tsx` - Home page logic

## Components

- All shadcn/ui components are pre-downloaded and available at `@/components/ui`

## Styling

- Add global styles to `src/index.css` or create new CSS files as needed
- Use Tailwind classes for styling components

## Development

- Import components from `@/components/ui` in your React components
- Customize the UI by modifying the Tailwind configuration

## Note

- The `@/` path alias points to the `src/` directory
- In your typescript code, don't re-export types that you're already importing

# Commands

**Install Dependencies**

```shell
pnpm i
```

**Add Dependencies**

```shell
pnpm add some_new_dependency

**Start Preview**

```shell
pnpm run dev
```

**To build**

```shell
pnpm run build
```

## Deployment on Vercel

1. Create a Vercel account at [vercel.com](https://vercel.com) if you haven't already
2. Install Vercel CLI globally:
   ```shell
   npm i -g vercel
   ```
3. Login to Vercel:
   ```shell
   vercel login
   ```
4. Deploy to Vercel:
   ```shell
   vercel
   ```
5. To deploy production build from main branch:
   ```shell
   vercel --prod
   ```

The deployment will automatically detect it's a Vite project and set up the build settings. Your site will be live at a URL like `https://your-project-name.vercel.app`.

