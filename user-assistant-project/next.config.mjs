/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // Module Federation configuration
    config.plugins.push(
      new config.webpack.container.ModuleFederationPlugin({
        name: 'pomoschnik',
        filename: 'static/chunks/remoteEntry.js',
        exposes: {
          './HelpWidget': './components/help-widget.tsx',
          './ChatDialog': './components/chat-dialog.tsx',
        },
        shared: {
          react: { 
            singleton: true, 
            requiredVersion: false 
          },
          'react-dom': { 
            singleton: true, 
            requiredVersion: false 
          },
        },
      })
    )

    return config
  },
}

export default nextConfig
