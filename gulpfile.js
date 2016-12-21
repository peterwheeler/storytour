var gulp        = require("gulp");
var	gutil = require("gulp-util");
var browserSync = require("browser-sync").create();
var less        = require("gulp-less");
var sourcemaps = require("gulp-sourcemaps");
var codekit = require("gulp-codekit");
var uglify = require("gulp-uglify");
var cssnano = require("gulp-cssnano");
var gulpIf = require("gulp-if");
var concat = require("gulp-concat");
var rename = require("gulp-rename");
var useref = require("gulp-useref");
var historyApiFallback = require('connect-history-api-fallback');

// Compile less into css
gulp.task("less-scripts", function() {
    return gulp.src(["./build/less/app.less", "./build/less/storytour.less", "./build/less/VCO.StoryMap.less"])
        .pipe(less())
        .pipe(gulp.dest("./build/css/"))
        .pipe(gulp.dest("./dist/css/"))
        .pipe(browserSync.stream());
});

// Compile storytour
gulp.task("storytour", function() {
  gulp.src("./build/js/storymapJS/VCO.StoryMap.js")
    .pipe(codekit())
    .pipe(rename("storytour.js"))
    .pipe(gulp.dest("./build/js/storymapJS/"))
    .pipe(gulp.dest("./dist/js/storytour/"));  
});

// Compile angular
gulp.task("angular-scripts", function() {
  gulp.src("./build/js/angular/*.js")
    .pipe(gulp.dest("./dist/js/angular/"));  
});

// Compile config
gulp.task("config-script", function() {
  gulp.src("./build/js/app/config.js")
    .pipe(gulp.dest("./dist/js/app/"));  
});

// Compile app
gulp.task("app-script", function() {
  gulp.src("./build/js/app/app.js")
    .pipe(gulp.dest("./dist/js/app/"));  
});

gulp.task("js-watch", ["storytour", "angular-scripts", "config-script", "app-script"]);

// Check HTML & reload browsers
gulp.task("checkHTML", function() {
  gulp.src("./build/index.html")
    .pipe(gulp.dest("./dist/"));
});

gulp.task("useref", function() {
    return gulp.src("./build/*.html")
	    .pipe(useref())
	    // .pipe(sourcemaps.init({loadMaps: true}))
	    // Minifies only if it's a JavaScript file
	    .pipe(gulpIf("*.js", uglify()))
	    // Minifies only if it's a CSS file
    	.pipe(gulpIf('*.css', cssnano()))
    	// .pipe(sourcemaps.write('./dist/'))
	    .pipe(gulp.dest("./dist/"));
});

// Static server
gulp.task("serve", ["less-scripts", "storytour", "angular-scripts", "config-script", "app-script", "checkHTML"], function() {
        browserSync.init({
            server:{
                baseDir: ["./", "./dist"]
            },
            browser: "C://Users//pw8g08//AppData//Local//Google//Chrome SxS//Application//chrome.exe",
            middleware: [historyApiFallback()]
            // open: false,
        });
    gulp.watch("./build/less/**/*.less", ["less-scripts"]);
    gulp.watch("./build/js/**/*.js", ["js-watch"]);
    gulp.watch("./build/js/**/*.js").on("change", browserSync.reload);
    gulp.watch("./build/*.html", ["checkHTML"]);
    gulp.watch("./dist/*.html").on("change", browserSync.reload);
});

gulp.task("default", ["serve"]);
gulp.task("build", ["useref", "serve"]);