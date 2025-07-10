import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})

// //deployment
// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";
// import fs from "fs";

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   server: {
//     https: {
//       key: fs.readFileSync("./certs/localhost+1-key.pem"),
//       cert: fs.readFileSync("./certs/localhost+1.pem"),
//     },
//     host: "0.0.0.0",
//     port: 5173,
//   },
// });
