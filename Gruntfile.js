module.exports = function (grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
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
						src: ['src/*.js'],
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
					'temp/calculate-matrix.js',
					'temp/expand-points.js',
					'temp/calculate-normals.js',
					'temp/create-instance.js',
					'temp/create-asset.js',
					'temp/create-geometry.js',
					'temp/set-attribute.js',
					'temp/set-sampler.js',
					'temp/resize-scene.js',
					'temp/initialize-render.js',
					'temp/create-canvas.js',
					'temp/parse-file.js',
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
		clean: {
			before: ['dist', 'temp'],
			after: ['temp']
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
