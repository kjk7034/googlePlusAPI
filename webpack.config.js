module.exports = {
	entry: {
		index: './index'
	},
	module: {
		loaders: [
			{
				exclude: /node_modules/,
				loader: 'babel-loader'
			},
			{
				test:/\.css$/,
				loaders: ['style','css']
			}
		]
	},
	output: {
		filename: '[name].bundle.js'
	}
}
