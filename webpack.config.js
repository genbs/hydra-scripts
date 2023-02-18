const path = require('path')

module.exports = {
	entry: './src/index.ts',
	output: {
		filename: 'index.js',
		path: path.resolve(__dirname, 'dist'),
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
		],
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
	},
	performance: {
		hints: false,
	},
	devServer: {
		port: 8080,
		static: {
			directory: path.join(__dirname, 'dist'),
		},
		historyApiFallback: {
			index: 'index.js',
		},
		allowedHosts: 'all',
		compress: false,
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
			'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
		},
	},
}
