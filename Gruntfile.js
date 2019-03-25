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
			},
			other: {
				options: {
					patterns: [
						{
							match: /dist\//,
							replacement: ''
						},
						{
							match: /example/,
							replacement: 'prototype'
						}
					]
				},
				files: [
					{
						expand: true,
						flatten: true,
						src: ['preview/prototype.html'],
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
					'temp/format-properties.js',
					'temp/organize-animation.js',
					'temp/Animation.js',
					'temp/build-matrices.js',
					'temp/multiply-matrices.js',
					'temp/Instance.js',
					'temp/parse-color.js',
					'temp/Asset.js',
					'temp/generate-band.js',
					'temp/generate-primative.js',
					'temp/calculate-normals.js',
					'temp/parse-file.js',
					'temp/square-image.js',
					'temp/Geometry.js',
					'temp/vertex-code.js',
					'temp/fragment-code.js',
					'temp/Scene.js',
					'temp/create-canvas.js',
					'temp/organize-segments.js',
					'temp/Meter.js',
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
		},
		zip: {
			main: {
				router: function (filepath) {
					return filepath.slice(filepath.indexOf('/') + 1);
				},
				src: [
					'dist/spective.min.js',
					'preview/prototype.js',
					'temp/prototype.html',
					'preview/index.js'
				],
				dest: 'dist/prototype.zip'
			}
		}
	});

	grunt.loadNpmTasks('grunt-replace');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-babel');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-zip');

	grunt.registerTask('default', [
		'clean:before',
		'replace:before',
		'concat',
		'babel',
		'replace:after',
		'uglify',
		'replace:other',
		'zip:main',
		'clean:after'
	]);
};
