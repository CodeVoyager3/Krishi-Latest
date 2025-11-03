# 🌾 Krishi Rakshak

**Krishi Rakshak** is a modern, multilingual web application designed to help farmers by providing AI-powered crop disease detection and a community platform. Users can upload images of their crops, receive instant diagnoses, and connect with other farmers and experts.

The platform is built with a modern tech stack including **React (Vite)**, **TypeScript**, and **Tailwind CSS** on the frontend, with **Supabase** serving as the backend for database, authentication, and serverless functions.

## ✨ Features

* **AI Disease Detection**: Core feature allowing users to upload an image of a crop leaf and get an AI-powered diagnosis. (Leverages `supabase/functions/detect-disease`)
* **Internationalization (i18n)**: Full multilingual support for English, Hindi, Marathi, Spanish, French, and Chinese. (Managed via `i18n/`)
* **User Authentication**: Secure login and registration for farmers and experts.
* **Community Forum**: A dedicated page for users to post questions, share insights, and interact. (`src/pages/Community.tsx`)
* **User Dashboard**: A personal dashboard for users to track their uploads and activity. (`src/pages/Dashboard.tsx`)
* **Static Pages**: Informative "About Us" and "How It Works" pages.
* **Responsive Design**: Fully responsive layout built with Tailwind CSS and Shadcn UI components.

## 💻 Tech Stack

* **Frontend**: React (Vite), TypeScript, Tailwind CSS
* **UI Components**: Shadcn UI
* **Backend-as-a-Service (BaaS)**: Supabase
    * **Database**: Supabase Postgres
    * **Auth**: Supabase Auth
    * **Serverless Functions**: Supabase Edge Functions (for disease detection)
* **Language & Translation**: `i18next`

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing.

### Prerequisites

You will need the following tools installed on your system:

* [Node.js](https://nodejs.org/) (v18 or later)
* [npm](https://www.npmjs.com/) or `bun`
* [Supabase CLI](https://supabase.com/docs/guides/cli) (for backend development)

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone [https://github.com/your-username/krishi-rakshak.git](https://github.com/your-username/krishi-rakshak.git)
    cd krishi-rakshak
    ```

2.  **Install frontend dependencies:**
    ```sh
    # Using npm
    npm install
    
    # Or using bun
    bun install
    ```

3.  **Set up Supabase:**
    * Link your local project to your Supabase project:
        ```sh
        supabase link --project-ref <YOUR-PROJECT-REF>
        ```
    * Push the database migrations:
        ```sh
        supabase db push
        ```
    * Deploy the Edge Functions:
        ```sh
        supabase functions deploy
        ```

4.  **Set up Environment Variables:**
    * Create a `.env` file in the root of the project.
    * Add your Supabase URL and Anon Key:
        ```env
        VITE_SUPABASE_URL=your-supabase-url
        VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
        ```

5.  **Run the development server:**
    ```sh
    # Using npm
    npm run dev
    
    # Or using bun
    bun run dev
    ```

The application should now be running on `http://localhost:5173`.

## 📜 Available Scripts

Inside the `package.json`, you will find the following scripts:

* `bun run dev`: Starts the Vite development server.
* `bun run build`: Builds the application for production.
* `bun run lint`: Lints the project files using ESLint.
* `bun run preview`: Serves the production build locally.

## 📁 Project Structure

```text
krishi-rakshak/
├── public/                 # Static assets
├── src/
│   ├── assets/             # Images and icons
│   ├── components/         # Reusable React components (UI, ImageUpload, Navbar)
│   ├── hooks/              # Custom React hooks
│   ├── i18n/               # Internationalization and translation JSON files
│   ├── integrations/       # Supabase client setup
│   ├── lib/                # Utility functions
│   ├── pages/              # Main page components (Index, About, Dashboard, etc.)
│   ├── App.tsx             # Main app component with routing
│   └── main.tsx            # React entry point
├── supabase/
│   ├── functions/
│   │   └── detect-disease/ # Serverless function for AI detection
│   └── migrations/         # Database schema migrations
└── package.json            # Project dependencies and scripts
