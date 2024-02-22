import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import electron from 'vite-plugin-electron'
import { loadEnv } from "vite";
import { resolve } from 'path'
import { wrapperEnv } from "./build/getEnv";
import { createProxy } from "./build/proxy";
import { createVitePlugins } from "./build/plugins";
import conf from "./config/default.json";
import pkg from "./package.json"

const root = process.cwd();
const isBuild = process.argv.slice(2).includes('build')
const env = loadEnv(isBuild ? "production" : "development", root);
const viteEnv = wrapperEnv(env);

console.log(process.execArgv, process.argv, 'a ahaha')

export default defineConfig({
  main: {
    build: {
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: isBuild ? true : false,
          drop_debugger: true
        }
      },
      rollupOptions: {
        external: Object.keys(pkg.devDependencies),
      }
    },
    plugins: [externalizeDepsPlugin(),
    electron([
      {
        entry: './src/main/worker/worker.ts',
        onstart(options) { options.startup() },
        vite: {
          build: {
            sourcemap: false,
            minify: 'terser',
            terserOptions: {
              compress: {
                drop_console: isBuild ? true : false,
                drop_debugger: true
              }
            },
            outDir: './out/main',
            rollupOptions: {
              external: Object.keys(pkg.dependencies),
            },
          },
        }
      }
    ]),
    electron([
      {
        entry: "./src/server/index.ts",
        onstart(options) { options.startup() },
        vite: {
          build: {
            sourcemap: false,
            minify: 'terser',
            terserOptions: {
              compress: {
                drop_console: isBuild ? true : false,
                drop_debugger: true
              }
            },
            outDir: './out/server',
            rollupOptions: {
              external: Object.keys(pkg.dependencies),
            },
          },
        }
      }
    ])
    ],
    resolve: {
      alias: {
        "@conf": resolve("config"),
        "~": resolve("./")
      }
    }
  },
  preload: {
    resolve: {
      alias: {
        "@conf": resolve("config"),
        "~": resolve("./")
      }
    },
    build: {
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: isBuild ? true : false,
          drop_debugger: true
        }
      },
    },
    plugins: [externalizeDepsPlugin(), electron([
      {

        // apply:"serve",
        entry: './src/preload/webview.ts',
        onstart: (options) => {
          options.startup();
          options.reload();
        },
        vite: {

          build: {
            sourcemap: false,
            minify: 'terser',
            terserOptions: {
              compress: {
                drop_console: isBuild ? true : false,
                drop_debugger: true
              }
            },
            outDir: './out/preload',
            rollupOptions: {
              external: Object.keys(pkg.dependencies),
            },
          },
        }
      }
    ])]
  },
  renderer: {
    define: {
      'process.env': { 'BASE_API': "http://localhost:8021/api" }
    },
    base: viteEnv.VITE_PUBLIC_PATH,
    // root,

    server: {
      host: "0.0.0.0",
      port: conf.port,
      open: false,
      cors: true,
      // Load proxy configuration from .env.development
      proxy: createProxy(viteEnv.VITE_PROXY)
    },
    // define: {
    //   __APP_INFO__: JSON.stringify(__APP_INFO__)
    // },
    resolve: {
      alias: {
        "@": resolve("src/renderer/src"),
        "~": resolve("./"),
        '@renderer': resolve('src/renderer/src'),
        "@conf": resolve("config")

      },
    },

    plugins: [createVitePlugins(viteEnv)],
    build: {
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: isBuild ? true : false,
          drop_debugger: true
        }
      },

      // 禁用 gzip 压缩大小报告，可略微减少打包时间
      reportCompressedSize: false,
      // 规定触发警告的 chunk 大小
      chunkSizeWarningLimit: 500,
      rollupOptions: {
        // external: Object.keys(pkg.devDependencies),
        output: {
          // Static resource classification and packaging
          chunkFileNames: "assets/js/[name]-[hash].js",
          entryFileNames: "assets/js/[name]-[hash].js",
          assetFileNames: "assets/[ext]/[name]-[hash].[ext]"
        }
      }
    }
  },

})
