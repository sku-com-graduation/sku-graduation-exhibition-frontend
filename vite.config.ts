import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), tsconfigPaths()],
    resolve: {
      alias: [
        { find: "@src", replacement: path.resolve(__dirname, "src") },
        { find: "@components", replacement: path.resolve(__dirname, "src/components") },
        { find: "@assets", replacement: path.resolve(__dirname, "src/assets") },
      ],
    },
    server: {
      // 백엔드 CORS가 와일드카드라 쿠키(withCredentials) 요청은 브라우저가 막는다.
      // 개발 중에는 VITE_API_BASE_URL=/api 로 두고 같은 출처 프록시를 거친다.
      proxy: env.VITE_DEV_API_TARGET ? { "/api": { target: env.VITE_DEV_API_TARGET, changeOrigin: true } } : undefined,
    },
  };
});
