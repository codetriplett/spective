module.exports = function (grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		clean: {
			before: ['dist', 'temp'],
			after: ['temp']
		},
		replace: {
			before: {
				options: {
					patterns: [
						{
							match: /(^|[ \r\n]*)import[^;]*;([ \r\n]*|$)/g,
							replacement: ''
						},
						{
							match: /(^|[\r\n]*)export default /g,
							replacement: '\nvar spective = '
						},
						{
							match: /(^|[\r\n]*)export (?!default)/g,
							replacement: '\n'
						}
					]
				},
				files: [
					{
						expand: true,
						flatten: true,
						src: [
							'src/**/*.js',
							'!src/**/__tests__/*.js'
						],
						dest: 'temp/'
					}
				]
			},
			after: {
				options: {
					patterns: [
						{
							match: /^/,
							replacement: '(function () {\n'
						},
						{
							match: /$/,
							replacement: '\nwindow.spective = spective;\n\nif (typeof define === \'function\' && define.amd) {\n\tdefine(\'spective\', function () { return spective; });\n}\n})();'
						}
					]
				},
				files: [
					{
						expand: true,
						flatten: true,
						src: ['temp/spective.js'],
						dest: 'temp/'
					}
				]
			}
		},
		concat: {
			options: {
				separator: '\n',
			},
			dist: {
				src: [
					'temp/organize-animations.js',
					'temp/format-properties.js',
					'temp/build-matrices.js',
					'temp/multiply-matrices.js',
					'temp/Instance.js',
					'temp/parse-color.js',
					'temp/Asset.js',
					'temp/calculate-normals.js',
					'temp/parse-file.js',
					'temp/Geometry.js',
					'temp/Scene.js',
					'temp/create-canvas.js',
					'temp/spective.js'
				],
				dest: 'temp/spective.js',
			}
		},
		babel: {
			dist: {
				files: {
					'temp/spective.js': 'temp/spective.js'
				}
			}
		},
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			build: {
				src: 'temp/spective.js',
				dest: 'dist/spective.min.js'
			}
		}
	});

	grunt.loadNpmTasks('grunt-replace');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-babel');
	grunt.loadNpmTasks('grunt-contrib-uglify');

	grunt.registerTask('default', [
		'clean:before',
		'replace:before',
		'concat',
		'babel',
		'replace:after',
		'uglify',
		'clean:after'
	]);
};
