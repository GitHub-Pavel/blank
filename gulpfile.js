// gulp
import gulp from 'gulp';
import watch from 'gulp-watch';

// pug
import pug from 'gulp-pug';
import pugbem from 'gulp-pugbem';
import pugLinter from 'gulp-pug-linter';

// svg and img
import imagemin from 'gulp-imagemin';
import svgSprite from 'gulp-svg-sprite';
import svgmin from 'gulp-svgmin';
import cheerio from 'gulp-cheerio';
import replace from 'gulp-replace';

// css
import plumber from 'gulp-plumber';
import sass from 'gulp-sass';
import prefixer from 'gulp-autoprefixer';
import sourcemaps from 'gulp-sourcemaps';
import CleanCSS from 'gulp-clean-css';
import gcmq from 'gulp-group-css-media-queries';

// files
import concat from 'gulp-concat';
import fs from 'fs';

// js
import rimraf from 'rimraf';
import uglify from 'gulp-uglify-es';
const uglifyDefault = uglify.default;

//fonts
import fonter from 'gulp-fonter';
import ttf2woff from 'gulp-ttf2woff';
import ttf2woff2 from 'gulp-ttf2woff2';

// browser sync
import browserSync from "browser-sync";
const reload = browserSync.reload;

// default paths
const projectPath = 'project',
    buildPath = 'docs';

// paths
const path = {
    build: {
        html: buildPath + '/',
        js: buildPath + '/js/',
        css: buildPath + '/css/',
        fonts: {
            plugins: buildPath + '/fonts/plugins/',
            default: buildPath + '/fonts/default/'
        },
        img: buildPath + '/img/'
    },
    src: {
        html: projectPath + '/pug/*.pug',
        js: [
            projectPath + '/js/jquery.js',
            projectPath + '/js/files/**/*.js',
            projectPath + '/js/main.js'
        ],
        css: [
            projectPath + '/scss/files/**/*.scss',
            projectPath + '/scss/main.scss'
        ],
        fonts: {
            ttf: projectPath + '/fonts/default/**/*.ttf',
            otf: projectPath + '/fonts/default/**/*.otf',
            plugins: projectPath + '/fonts/plugins/**/*.*'
        },
        img: projectPath + '/img/**/*.{svg,jpg,png,gif,ico,webp,jpeg}',
        svg: projectPath + '/svgSprite/**/*.svg'
    },
    watch: {
        html: projectPath + '/pug/**/*.pug',
        js: projectPath + '/js/**/*.js',
        css: projectPath + '/scss/**/*.scss',
        img: projectPath + '/img/**/*.{svg,jpg,png,gif,ico,webp,jpeg}',
        svg: projectPath + '/svgSprite/**/*.svg',
        fonts: {
            ttf: projectPath + '/fonts/default/**/*.ttf',
            woff: buildPath + '/fonts/default/**/*.{woff, woff2}',
            plugins: projectPath + '/fonts/plugins/**/*.*'
        },
    },
    clean: buildPath
};

const config = {
    server: {
        baseDir: buildPath + "/"
    },
    // tunnel: true,
    host: 'localhost',
    notify: false
};


// html
export const html = () => {
    return gulp.src(path.src.html)
        .pipe(plumber())
        .pipe(pugLinter({ reporter: 'default' }))
        .pipe(pug({
            pretty: true,
            plugins: [pugbem]
        }))
        .pipe(gulp.dest(path.build.html))
        .pipe(reload({ stream: true }));
}

// css
export const css = () => {
    return gulp.src(path.src.css)
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(prefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
        .pipe(concat('main.min.css'))
        .pipe(gcmq())
        .pipe(CleanCSS({ level: { 1: { specialComments: 0 } } }))
        .pipe(sourcemaps.write(''))
        .pipe(gulp.dest(path.build.css))
        .pipe(reload({ stream: true }));
}

// js
export const js = () => {
    return gulp.src(path.src.js)
        .pipe(sourcemaps.init())
        .pipe(concat('main.min.js'))
        .pipe(uglifyDefault())
        .pipe(sourcemaps.write(''))
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({ stream: true }));
}

// image
export const img = () => {
    return gulp.src(path.src.img)
        .pipe(imagemin([
            imagemin.gifsicle({ interlaced: true }),
            imagemin.mozjpeg({ quality: 75, progressive: true }),
            imagemin.optipng({ optimizationLevel: 5 }),
            imagemin.svgo({
                plugins: [
                    { removeViewBox: false },
                    { cleanupIDs: true },
                    { removeDimensions: true },
                    { removeElementsByAttr: true }
                ]
            })
        ]))
        .pipe(gulp.dest(path.build.img))
        .pipe(reload({ stream: true }));
}

// svgSprite
export const sprite = () => {
    return gulp.src(path.src.svg)
        .pipe(svgmin({
            js2svg: {
                pretty: true
            }
        }))
        .pipe(cheerio({
            run: function ($) {
                $('[fill]').removeAttr('fill');
                $('[stroke]').removeAttr('stroke');
                $('[style]').removeAttr('style');
            },
            parserOptions: { xmlMode: true }
        }))
        .pipe(replace('&gt;', '>'))
        .pipe(svgSprite({
            mode: {
                symbol: {
                    sprite: "../icons.svg"
                }
            },
            svg: {
                namespaceClassnames: false
            }
        }))
        .pipe(gulp.dest(path.build.img))
        .pipe(reload({ stream: true }));
}

// fonts
export const fonts = () => {
    gulp.src(path.src.fonts.ttf)
        .pipe(ttf2woff2())
        .pipe(gulp.dest(path.build.fonts.default))
    return gulp.src(path.src.fonts.ttf)
        .pipe(ttf2woff())
        .pipe(gulp.dest(path.build.fonts.default))
        .pipe(reload({ stream: true }));
}

export const plugins_fonts = () => {
    return gulp.src(path.src.fonts.plugins)
        .pipe(gulp.dest(path.build.fonts.plugins))
        .pipe(reload({ stream: true }));
}

export const fonts_style = () => {

    fs.truncate(projectPath + '/scss/_fonts.scss', 0, function () {
        let file_content = fs.readFileSync(projectPath + '/scss/_fonts.scss');

        if (file_content == '') {
            fs.writeFile(projectPath + '/scss/_fonts.scss', '', cb);
            return fs.readdir(path.build.fonts.default, function (err, items) {
                if (items) {
                    let c_fontname;
                    for (var i = 0; i < items.length; i++) {
                        let fontname = items[i].split('.');

                        let style = 'normal',
                            weight = '400',
                            name = fontname[0].split('-')[0];
                        
                        if (fontname[0].includes('Black') || fontname[0].includes('black')) {
                            weight = '900';
                        } else if (fontname[0].includes('ExtraBold') || fontname[0].includes('extrabold')) {
                            weight = '800';
                        } else if (fontname[0].includes('SemiBold') || fontname[0].includes('semibold')) {
                            weight = '600';
                        } else if (fontname[0].includes('Bold') || fontname[0].includes('bold')) {
                            weight = '700';
                        } else if (fontname[0].includes('Medium') || fontname[0].includes('medium')) {
                            weight = '500';
                        } else if (fontname[0].includes('-Italic') || fontname[0].includes('-italic') || fontname[0].includes('Regular') || fontname[0].includes('regular')) {
                            weight = '400';
                        } else if (fontname[0].includes('ExtraLight') || fontname[0].includes('extralight')) {
                            weight = '200';
                        } else if (fontname[0].includes('Light') || fontname[0].includes('light')) {
                            weight = '300';
                        } else if (fontname[0].includes('Thin') || fontname[0].includes('thin')) {
                            weight = '100';
                        }

                        if (fontname[0].includes('Italic') || fontname[0].includes('italic')) {
                            style = 'italic';
                        }
                        
                        

                        fontname = fontname[0];
                        if (c_fontname != fontname) {
                            fs.appendFile(projectPath + '/scss/_fonts.scss', '@include font("' + name + '", "' + fontname + '", "' + weight + '", "' + style + '");\r\n', cb);
                        }
                        c_fontname = fontname;
                    }
                }
            })
        }
    });
}

function cb() {

}

// build all project
export const build = gulp.series(
    gulp.parallel(
        html,
        js,
        css,
        img,
        sprite,
        fonts
    ),
    fonts_style
)

// watch for files project
export const _watch = () => {
    watch(path.watch.html, gulp.series(html));
    watch(path.watch.css, gulp.series(css));
    watch(path.watch.js, gulp.series(js));
    watch(path.watch.img, gulp.series(img));
    watch(path.watch.svg, gulp.series(sprite));
    watch(path.watch.fonts.ttf, gulp.series(fonts));
    watch(path.watch.fonts.woff, gulp.series(fonts_style));
    watch(path.watch.fonts.plugins, gulp.series(plugins_fonts));
}

// from otf to ttf
export const otf = () => {
    return gulp.src(path.src.fonts.otf)
        .pipe(fonter({
            formats: ['ttf']
        }))
        .pipe(gulp.dest(path.src.fonts.otf))
}

// open server
export const server = () => {
    browserSync(config);
}

// clean build folder
export const clean = cb => {
    rimraf(path.clean, cb);
    fs.truncate(projectPath + '/scss/_fonts.scss', 0, cb);
}

export default gulp.parallel(
    build,
    _watch,
    server
)