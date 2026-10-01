/* eslint-disable @typescript-eslint/no-var-requires */
const CracoEsbuildPlugin = require('craco-esbuild')
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer')
const CompressionPlugin = require('compression-webpack-plugin')
const BrotliPlugin = require('brotli-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')

module.exports = {
  plugins: [
    {
      plugin: CracoEsbuildPlugin,
      options: {
        esbuildLoaderOptions: {
          loader: 'tsx',
          target: 'es2015',
        },
      },
    },
  ],
  jest: {
    configure: {
      testEnvironment: 'jsdom',
      transform: {
        '^.+\\.(js|jsx|ts|tsx)$': require.resolve('babel-jest'),
      },
      transformIgnorePatterns: [],
      moduleNameMapper: {
        '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
        '\\.(gif|ttf|eot|svg|png|jpg|jpeg|bmp|webp)$': require.resolve('./__mocks__/fileMock.js'),
        '^yet-another-react-lightbox/plugins/.+$': require.resolve(
          './__mocks__/lightboxPluginMock.js'
        ),
        '^three/examples/jsm/loaders/STLLoader(.js)?$': require.resolve(
          './__mocks__/stlLoaderMock.js'
        ),
        '^three/examples/jsm/.*$': require.resolve('./__mocks__/threeExamplesMock.js'),
      },
    },
  },
  webpack: {
    configure: (webpackConfig, {env}) => {
      const isProduction = env === 'production'

      // Remove ForkTsCheckerWebpackPlugin (to avoid crash)
      webpackConfig.plugins = webpackConfig.plugins.filter(
        (plugin) => plugin.constructor.name !== 'ForkTsCheckerWebpackPlugin'
      )

      // Ignore missing source-map warnings from third-party bundles
      webpackConfig.ignoreWarnings = [
        ...(webpackConfig.ignoreWarnings || []),
        (warning) =>
          typeof warning === 'string'
            ? warning.includes('@mediapipe/tasks-vision')
            : warning?.module?.resource?.includes('@mediapipe/tasks-vision'),
      ]

      // Advanced code splitting configuration
      if (isProduction) {
        webpackConfig.optimization = {
          ...webpackConfig.optimization,
          moduleIds: 'deterministic',
          runtimeChunk: 'single',
          splitChunks: {
            chunks: 'all',
            maxInitialRequests: 25,
            minSize: 20000,
            cacheGroups: {
              // Ant Design - large UI library
              antd: {
                test: /[\\/]node_modules[\\/]antd[\\/]/,
                name: 'antd',
                priority: 100,
                reuseExistingChunk: true,
              },
              // Three.js and related 3D libraries
              three: {
                test: /[\\/]node_modules[\\/](@react-three|three)[\\/]/,
                name: 'three',
                priority: 90,
                reuseExistingChunk: true,
              },
              // FullCalendar - large calendar library
              fullcalendar: {
                test: /[\\/]node_modules[\\/]@fullcalendar[\\/]/,
                name: 'fullcalendar',
                priority: 85,
                reuseExistingChunk: true,
              },
              // Chart.js
              charts: {
                test: /[\\/]node_modules[\\/](chart\.js|react-chartjs-2)[\\/]/,
                name: 'charts',
                priority: 80,
                reuseExistingChunk: true,
              },
              // Redux and related state management
              redux: {
                test: /[\\/]node_modules[\\/](@reduxjs|redux|react-redux|redux-persist)[\\/]/,
                name: 'redux',
                priority: 75,
                reuseExistingChunk: true,
              },
              // Firebase
              firebase: {
                test: /[\\/]node_modules[\\/]firebase[\\/]/,
                name: 'firebase',
                priority: 70,
                reuseExistingChunk: true,
              },
              // React Player and video libraries
              reactPlayer: {
                test: /[\\/]node_modules[\\/]react-player[\\/]/,
                name: 'react-player',
                priority: 65,
                reuseExistingChunk: true,
              },
              // Other large vendor libraries
              vendor: {
                test: /[\\/]node_modules[\\/]/,
                name: 'vendor',
                priority: 60,
                reuseExistingChunk: true,
              },
              // Common code shared between routes
              common: {
                minChunks: 2,
                priority: 50,
                reuseExistingChunk: true,
                enforce: true,
              },
            },
          },
          // Enhanced minification settings
          minimize: true,
          minimizer: [
            new TerserPlugin({
              terserOptions: {
                parse: {
                  ecma: 8,
                },
                compress: {
                  ecma: 5,
                  warnings: false,
                  comparisons: false,
                  inline: 2,
                  drop_console: true, // Remove console.logs in production
                  drop_debugger: true,
                  pure_funcs: ['console.log', 'console.info', 'console.debug'],
                },
                mangle: {
                  safari10: true,
                },
                output: {
                  ecma: 5,
                  comments: false,
                  ascii_only: true,
                },
              },
              parallel: true,
            }),
          ],
        }

        // Add compression plugins for production
        webpackConfig.plugins.push(
          // Gzip compression
          new CompressionPlugin({
            filename: '[path][base].gz',
            algorithm: 'gzip',
            test: /\.(js|css|html|svg)$/,
            threshold: 10240,
            minRatio: 0.8,
          }),
          // Brotli compression (better than gzip)
          new BrotliPlugin({
            asset: '[path].br[query]',
            test: /\.(js|css|html|svg)$/,
            threshold: 10240,
            minRatio: 0.8,
          })
        )

        // Add bundle analyzer only when ANALYZE env var is set
        if (process.env.ANALYZE === 'true') {
          webpackConfig.plugins.push(
            new BundleAnalyzerPlugin({
              analyzerMode: 'static',
              reportFilename: 'bundle-report.html',
              openAnalyzer: true,
            })
          )
        }
      }

      // Optimize tree shaking for Ant Design
      webpackConfig.resolve = {
        ...webpackConfig.resolve,
        alias: {
          ...webpackConfig.resolve.alias,
          // Ensure we're using ES modules for better tree shaking
          'antd/es': 'antd/es',
        },
      }

      return webpackConfig
    },
  },
}
