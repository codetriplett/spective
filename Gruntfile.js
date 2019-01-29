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
					'temp/set-attribute.js',
					'temp/set-sampler.js',
					'temp/create-canvas.js',
					'temp/Scene.js',
					'temp/update-item.js',
					'temp/calculate-matrix.js',
					'temp/calculate-normals.js',
					'temp/parse-file.js',
					'temp/load-geometry.js',
					'temp/load-asset.js',
					'temp/create-instance.js',
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
