const gulp = require('gulp'),
      watch = require('gulp-watch'),
      imagemin = require('gulp-imagemin'),
      pngquant = require('imagemin-pngquant'),
      rename = require('gulp-rename'),
      pug = require('gulp-pug'),
      plumber = require('gulp-plumber'),
      pugLinter = require('gulp-pug-linter'),
      htmlValidator = require('gulp-w3c-html-validator'),
      sass = require('gulp-sass'),
      prefixer = require('gulp-autoprefixer'),
      sourcemaps = require('gulp-sourcemaps'),
      shorthand = require('gulp-shorthand'),
      cssmin = require('gulp-minify-css'),
      rimraf = require('rimraf'),
      request = require('request'),
      uglify = require('gulp-uglify-es').default,
      gcmq = require('gulp-group-css-media-queries'),
      concat = require('gulp-concat');
      browserSync = require("browser-sync"),
      reload = browserSync.reload;

var smartgrid = require('smart-grid');

/* It's principal settings in smart grid project */
var settings = {
    outputStyle: 'scss', /* less || scss || sass || styl */
    columns: 12, /* number of grid columns */
    offset: '30px', /* gutter width px || % || rem */
    mobileFirst: false, /* mobileFirst ? 'min-width' : 'max-width' */
    container: {
        maxWidth: '1170px', /* max-width оn very large screen */
        fields: '30px' /* side fields */
    },
    breakPoints: {
        lg: {
            width: '1100px', /* -> @media (max-width: 1100px) */
        },
        md: {
            width: '960px'
        },
        sm: {
            width: '780px',
            fields: '15px' /* set fields only if you want to change container.fields */
        },
        xs: {
            width: '560px'
        }
        /* 
        We can create any quantity of break points.
 
        some_name: {
            width: 'Npx',
            fields: 'N(px|%|rem)',
            offset: 'N(px|%|rem)'
        }
        */
    }
};
 
var projectPath = 'project',
    buildPath = 'docs'

var path = {
        build: {
            html: buildPath + '/',
            js: buildPath + '/js/',
            css: buildPath + '/css/',
            csslib: projectPath + '/scss/lib',
            img: buildPath + '/img/'
        },
        src: {
            html: projectPath + '/pug/*.pug',
            js: [
                projectPath + '/js/lib/*.js',
                projectPath + '/js/files/*.js',
                projectPath + '/js/main.js'
            ],
            sass: [
                projectPath + '/scss/lib/**/*.scss',
                projectPath + '/scss/files/**/*.scss',
                projectPath + '/scss/main.scss'
            ],
            img: projectPath + '/img/**/*.*'
        },
        watch: { 
            html: projectPath + '/pug/**/*.pug',
            js: projectPath + '/js/**/*.js',
            sass: projectPath + '/scss/**/*.scss',
            img: projectPath + '/img/**/*.{jpg,png,svg,gif,ico,webp,jpeg}',
            fonts: projectPath + '/fonts/**/*.ttf'
        },
        clean: buildPath + '/'
    };

var config = {
        server: {
            baseDir: buildPath + "/"
        },
        tunnel: true,
        host: 'localhost',
        notify: false
    };

gulp.task('html:build', function () {
    return gulp.src(path.src.html)
        .pipe(plumber())
        .pipe(pugLinter({reporter: 'default'}))
        .pipe(pug({
            pretty: true
        }))
        .pipe(gulp.dest(path.build.html))
        .pipe(reload({stream: true}));
});

gulp.task('sass:build', function () {
    return gulp.src(path.src.sass)
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(prefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
        .pipe(concat('main.min.css'))
        .pipe(shorthand())
        .pipe(cssmin())
        .pipe(sourcemaps.write(''))
        .pipe(gulp.dest(path.build.css))
        .pipe(reload({stream: true}));
});

gulp.task('js:build', function () {
    return gulp.src(path.src.js)
        .pipe(sourcemaps.init())
        .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write(''))
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({stream: true}));
});

gulp.task('image:build', function () {
    return gulp.src(path.src.img)
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img))
        .pipe(reload({stream: true}));
});

gulp.task('build', gulp.series(
    'html:build',
    'js:build',
    'sass:build',
    'image:build'
));

gulp.task('watch', function(){
    watch(path.watch.html, gulp.series('html:build'));
    watch(path.watch.sass, gulp.series('sass:build'));
    watch(path.watch.js, gulp.series('js:build'));
    watch(path.watch.img, gulp.series('image:build'));
});

gulp.task('webserver', function () {
    browserSync(config);
});

gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});

gulp.task('default', gulp.parallel('build',  'watch', 'webserver'));
smartgrid(path.build.csslib, settings);