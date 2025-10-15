// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import preact from "@astrojs/preact";

// https://astro.build/config
export default defineConfig({
    // Vite config
    vite: {
        plugins: [tailwindcss()],
    },

    // Integrations
    integrations: [preact()],

    // Site config
    site: 'https://mypvu.github.io',
    base: '/GROUP-3200_51',

    // Static site generation (no server/API routes needed)
    output: 'static'
});