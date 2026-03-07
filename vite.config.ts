import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite 插件：替换 three.js 中的废弃 Clock 为 Timer
function replaceThreeClock() {
  return {
    name: 'replace-three-clock',
    transform(code, id) {
      if (id.includes('three') || id.includes('@react-three')) {
        // 替换 new Clock() 为 new Timer()
        // 替换 THREE.Clock 为 THREE.Timer
        return code
          .replace(/new THREE\.Clock\(\)/g, 'new THREE.Timer()')
          .replace(/THREE\.Clock/g, 'THREE.Timer');
      }
      return code;
    }
  };
}

export default defineConfig({
  plugins: [react(), replaceThreeClock()],
  server: {
    port: 5173,
    host: true
  }
})
