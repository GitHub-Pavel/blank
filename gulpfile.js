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
      reload = browserSync.reload,
      svgSprite = require('gulp-svg-sprite'),
      ttf2woff = require('gulp-ttf2woff'),
      ttf2woff2 = require('gulp-ttf2woff2'),
      fonter = require('gulp-fonter'),
      fs = require('fs');

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
        },
        xx: {
            width: '440px'
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
            fonts: buildPath + '/fonts/',
            js: buildPath + '/js/',
            css: buildPath + '/css/',
            csslib: projectPath + '/scss/lib',
            img: buildPath + '/img/',
            svg: buildPath + '/img/'
        },
        src: {
            html: projectPath + '/pug/*.pug',
            fonts: projectPath + '/fonts/**/*.ttf',
            otf: projectPath + '/fonts/**/*.otf',
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
            img: projectPath + '/img/**/*.{jpg,png,gif,ico,webp,jpeg}',
            svg: projectPath + '/img/icons/**/*.*'
        },
        watch: { 
            html: projectPath + '/pug/**/*.pug',
            js: projectPath + '/js/**/*.js',
            sass: projectPath + '/scss/**/*.scss',
            img: projectPath + '/img/**/*.{jpg,png,gif,ico,webp,jpeg}',
            img: projectPath + '/img/icons/**/*.svg',
            fonts: projectPath + '/fonts/**/*.ttf',
            fontsStyle: buildPath + '/fonts/**/*.{woff, woff2}'
        },
        clean: buildPath
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
            optimizationLevel: 3,
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img))
        .pipe(reload({stream: true}));
});

gulp.task('svg:build', function () {
    return gulp.src(path.src.svg)
        .pipe(svgSprite({
            mode: {
                stack: {
                    sprite: "../icons.svg"
                }
            }
        }))
        .pipe(gulp.dest(path.build.svg))
        .pipe(reload({stream: true}));
});

gulp.task('fonts:build', function () {
    gulp.src(path.src.fonts)
        .pipe(ttf2woff2())
        .pipe(gulp.dest(path.build.fonts))
    return gulp.src(path.src.fonts)
        .pipe(ttf2woff())
        .pipe(gulp.dest(path.build.fonts))
        .pipe(reload({stream: true}));
});

gulp.task('fontsStyle', function () {

    fs.truncate(projectPath + '/scss/files/_fonts.scss', 0, function() {
        let file_content = fs.readFileSync(projectPath + '/scss/files/_fonts.scss');

        if (file_content == '') {
            fs.writeFile(projectPath + '/scss/files/_fonts.scss', '', cb);
            return fs.readdir(path.build.fonts, function (err, items) {
                if (items) {
                    let c_fontname;
                    for (var i = 0; i < items.length; i++) {
                        let fontname = items[i].split('.');
                        
                        let style = 'normal',
                            weight = '400',
                            name = fontname[0];

                        if (name.includes('Italic')) {
                            style = 'italic';
                        }

                        if (name.includes('Black')) {
                            weight = '900';
                            name = items[i].split('-')
                        } else if (name.includes('ExtraBold')) {
                            weight = '800';  
                            name = items[i].split('-')
                        } else if (name.includes('Bold')) {
                            weight = '700'; 
                            name = items[i].split('-')
                        } else if (name.includes('SemiBold')) {
                            weight = '600';        
                            name = items[i].split('-')  
                        } else if (name.includes('Medium')) {
                            weight = '500';     
                            name = items[i].split('-')      
                        } else if (name.includes('-Italic') || name.includes('Regular')) {
                            weight = '400';     
                            name = items[i].split('-')      
                        } else if (name.includes('Light')) {
                            weight = '300'; 
                            name = items[i].split('-')
                        } else if (name.includes('ExtraLight')) {
                            weight = '200'; 
                            name = items[i].split('-')
                        } else if (name.includes('Thin')) {
                            weight = '100'; 
                            name = items[i].split('-')
                        }

                        fontname = fontname[0];
                        if (c_fontname != fontname) {
                        fs.appendFile(projectPath + '/scss/files/_fonts.scss', '@include font("' + name[0] + '", "' + fontname + '", "'+ weight +'", "'+ style +'");\r\n', cb);
                        }
                        c_fontname = fontname;
                    }
                }
            })
        }
    });
});

function cb() { 

}

gulp.task('build', gulp.series(
    'html:build',
    'js:build',
    'sass:build',
    'image:build',
    'svg:build',
    'fonts:build',
    'fontsStyle'
));

gulp.task('watch', function(){
    watch(path.watch.html, gulp.series('html:build'));
    watch(path.watch.sass, gulp.series('sass:build'));
    watch(path.watch.js, gulp.series('js:build'));
    watch(path.watch.img, gulp.series('image:build'));
    watch(path.watch.svg, gulp.series('svg:build'));
    watch(path.watch.fonts, gulp.series('fonts:build'));
    watch(path.watch.fontsStyle, gulp.series('fontsStyle'));
});

gulp.task('otf:build', function () {
    return gulp.src(path.src.otf)
        .pipe(fonter({
            formats: ['ttf']
        }))
        .pipe(gulp.dest(path.src.otf))
});

gulp.task('webserver', function () {
    browserSync(config);
});

gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});

gulp.task('default', gulp.parallel('webserver', 'watch', 'build'));
smartgrid(path.build.csslib, settings);