import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  // 배포용 dist에 로컬 주소가 박히면 운영에서 모든 API가 실패하므로 빌드를 멈춘다
  if (command === "build" && /localhost|127\.0\.0\.1/.test(env.VITE_API_BASE_URL ?? "")) {
    throw new Error(
      `VITE_API_BASE_URL이 로컬 주소(${env.VITE_API_BASE_URL})입니다. .env.production 에 VITE_API_BASE_URL=/api 를 두고 다시 빌드하세요.`,
    );
  }

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
