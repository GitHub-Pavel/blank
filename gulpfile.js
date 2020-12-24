import gulp from 'gulp';
import watch from 'gulp-watch';
import imagemin from 'gulp-imagemin';
import pug from 'gulp-pug';
import plumber from 'gulp-plumber';
import pugLinter from 'gulp-pug-linter';
import sass from 'gulp-sass';
import prefixer from 'gulp-autoprefixer';
import sourcemaps from 'gulp-sourcemaps';
import cssmin from 'gulp-minify-css';
import rimraf from 'rimraf';
import uglify from 'gulp-uglify-es';
import gcmq from 'gulp-group-css-media-queries';
import concat from 'gulp-concat';
import browserSync from "browser-sync";
import svgSprite from 'gulp-svg-sprite';
import ttf2woff from 'gulp-ttf2woff';
import ttf2woff2 from 'gulp-ttf2woff2';
import fonter from 'gulp-fonter';
import fs from 'fs';
import pugbem from 'gulp-pugbem';
import smartgrid from 'smart-grid';



const reload = browserSync.reload;
const uglifyDefault = uglify.default;

/* It's principal settings in smart grid project */
const settings = {
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

const projectPath = 'project',
    buildPath = 'docs'

const path = {
    build: {
        html: buildPath + '/',
        fonts: buildPath + '/fonts/default/',
        plFonts: buildPath + '/fonts/plugins/',
        js: buildPath + '/js/',
        css: buildPath + '/css/',
        csslib: projectPath + '/scss/lib',
        cssfiles: projectPath + '/scss',
        img: buildPath + '/img/'
    },
    src: {
        html: projectPath + '/pug/*.pug',
        plFonts: projectPath + '/fonts/plugins/**/*.*',
        fonts: projectPath + '/fonts/default/**/*.ttf',
        otf: projectPath + '/fonts/default/**/*.otf',
        js: [
            projectPath + '/js/jquery.js',
            projectPath + '/js/lib/**/*.js',
            projectPath + '/js/main.js'
        ],
        sass: [
            projectPath + '/scss/lib/auto/**/*.scss',
            projectPath + '/scss/main.scss'
        ],
        img: projectPath + '/img/**/*.{svg,jpg,png,gif,ico,webp,jpeg}',
        svg: projectPath + '/svgSprite/**/*.svg'
    },
    watch: {
        html: projectPath + '/pug/**/*.pug',
        js: projectPath + '/js/**/*.js',
        sass: projectPath + '/scss/**/*.scss',
        img: projectPath + '/img/**/*.{svg,jpg,png,gif,ico,webp,jpeg}',
        svg: projectPath + '/svgSprite/**/*.svg',
        fonts: projectPath + '/fonts/default/**/*.ttf',
        plFonts: projectPath + '/fonts/plugins/**/*.*',
        fontsStyle: buildPath + '/fonts/default/**/*.{woff, woff2}'
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
    return gulp.src(path.src.sass)
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(prefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
        .pipe(concat('main.min.css'))
        .pipe(gcmq())
        .pipe(cssmin())
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
                    { prefixIds: true },
                    { removeDimensions: true },
                    { removeXMLNS: true }
                ]
            })
        ]))
        .pipe(gulp.dest(path.build.img))
        .pipe(reload({ stream: true }));
}

// svgSprite

export const sprite = () => {
    return gulp.src(path.src.svg)
        .pipe(svgSprite({
            mode: {
                stack: {
                    sprite: "../icons.svg"
                }
            }
        }))
        .pipe(gulp.dest(path.build.img))
        .pipe(reload({ stream: true }));
}

// fonts

export const fonts = () => {
    gulp.src(path.src.fonts)
        .pipe(ttf2woff2())
        .pipe(gulp.dest(path.build.fonts))
    return gulp.src(path.src.fonts)
        .pipe(ttf2woff())
        .pipe(gulp.dest(path.build.fonts))
        .pipe(reload({ stream: true }));
}

// exFonts

export const plugins_fonts = () => {
    return gulp.src(path.src.plFonts)
        .pipe(gulp.dest(path.build.plFonts))
        .pipe(reload({ stream: true }));
}

export const fonts_style = () => {

    fs.truncate(projectPath + '/scss/_fonts.scss', 0, function () {
        let file_content = fs.readFileSync(projectPath + '/scss/_fonts.scss');

        if (file_content == '') {
            fs.writeFile(projectPath + '/scss/_fonts.scss', '', cb);
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
                            fs.appendFile(projectPath + '/scss/_fonts.scss', '@include font("' + name[0] + '", "' + fontname + '", "' + weight + '", "' + style + '");\r\n', cb);
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
    watch(path.watch.sass, gulp.series(css));
    watch(path.watch.js, gulp.series(js));
    watch(path.watch.img, gulp.series(img));
    watch(path.watch.svg, gulp.series(sprite));
    watch(path.watch.fonts, gulp.series(fonts));
    watch(path.watch.fontsStyle, gulp.series(fonts_style));
    watch(path.watch.plFonts, gulp.series(plugins_fonts));
}

// from otf to ttf

export const otf = () => {
    return gulp.src(path.src.otf)
        .pipe(fonter({
            formats: ['ttf']
        }))
        .pipe(gulp.dest(path.src.otf))
}

// open server

export const server = () => {
    browserSync(config);
}

// clean build folder

export const clean = cb => {
    rimraf(path.clean, cb);
    rimraf(path.build.cssfiles + '/smart-grid.scss', cb);
    fs.truncate(projectPath + '/scss/_fonts.scss', 0, cb);
}

export default gulp.parallel(
    build,
    _watch,
    server
)

smartgrid(path.build.cssfiles, settings);
