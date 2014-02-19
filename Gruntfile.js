module.exports = function(grunt) {
    require("load-grunt-tasks")(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),

        connect: {
            options: {
                port: 8080,
                base:"build/<%= grunt.config('version') %>/",
                keepalive: true
            },
            keepalive:true
        }, 
        
        requirejs: {
            compile: {
                options: {
                    baseUrl: "src",
                    mainConfigFile: "src/main.js",
                    name: "main",
                    optimize: "uglify",
                    out: "build/<%= grunt.config('version') %>/<%= grunt.config('version') %>/js/main.js"
                }
            }
        },

        preprocess: {
            options: {
                context: {
                    version:"<%= grunt.config('version') %>"
                }
            },
            main: {
                src: [
                    "build/<%= grunt.config('version') %>/<%= grunt.config('version') %>/css/frontend.css",
                    "build/<%= grunt.config('version') %>/<%= grunt.config('version') %>/css/vendor/bootstrap.css",
                    "build/<%= grunt.config('version') %>/<%= grunt.config('version') %>/html/navbar.html"
                ],
                options: {
                    inline: true
                } 
            },
            index: {
                src: "static/index.html",
                dest: "build/<%= grunt.config('version') %>/index.html"
            }
        },

        copy: {
            main: {
                files: [
                    { 
                        cwd: "static/", 
                        src: ["**/*","!index.html"], 
                        expand: true,  
                        dest: "build/<%= grunt.config('version') %>/<%= grunt.config('version') %>/" 
                    },
                    {
                        src: ["src/vendor/jquery-1.10.2.min.map"],
                        dest: "build/<%= grunt.config('version') %>/<%= grunt.config('version') %>/js/jquery-1.10.2.min.map"
                    }
                ]
            },
            dev: {
                files: [
                    {
                        cwd: "src/",
                        src: ["**/*"],
                        expand: true,
                        dest: "build/<%= grunt.config('version') %>/<%= grunt.config('version') %>/js"
                    }
                ]
            }
        },

        clean: ["build/<%= grunt.config('version') %>"],

        watch: {
            options: {
                livereload: true
            },
            js: {
                files: ['src/**/*', 'static/**/*' ],
                tasks: ['dev']
            }
        }

    });
   
    grunt.config("version", grunt.option('ver') || "dev"); 
    grunt.registerTask("dev", ["clean", "copy:main", "copy:dev", "preprocess"]);
    grunt.registerTask("build", ["clean", "requirejs", "copy:main", "preprocess"]);
    grunt.registerTask("default", "build");
};
