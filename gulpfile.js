import browserSync from 'browser-sync';
import {
    deleteAsync
} from 'del'; // Используем deleteAsync
import gulp from 'gulp';
import autoprefixer from 'gulp-autoprefixer';
import cleanCSS from 'gulp-clean-css';
import sass from 'gulp-dart-sass';
import imagemin from 'gulp-imagemin';
import pug from 'gulp-pug';
import mozjpeg from 'imagemin-mozjpeg';
import pngquant from 'imagemin-pngquant';

const path = {
    dest: 'pages',
    pug: {
        src: 'src/*.pug',
        dest: 'pages/',
        watch: 'src/**/*.pug'
    },
    sass: {
        src: 'src/css/*.{sass,css,scss}',
        dest: 'pages/css',
        watch: 'src/css/**/*.{sass,css,scss}'
    },
    img: {
        src: 'src/img/**/*.{jpg,jpeg,png,svg,gif,webp}',
        dest: 'pages/img'
    },
    js: {
        src: 'src/js/**/*.js',
        dest: 'pages/js'
    }
};

function pugTask() {
    return gulp.src(path.pug.src)
        .pipe(pug({
            pretty: true
        }))
        .pipe(gulp.dest(path.pug.dest))
        .pipe(browserSync.stream());
}

function sassTask() {
    return gulp.src(path.sass.src)
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(cleanCSS())
        .pipe(gulp.dest(path.sass.dest))
        .pipe(browserSync.stream());
}

function imgTask() {
    return gulp.src(path.img.src, {
            encoding: false,
            since: gulp.lastRun(imgTask)
        })
        .pipe(imagemin([
            mozjpeg({
                quality: 75,
                progressive: true
            }),
            pngquant({
                quality: [0.6, 0.8]
            }),
            imagemin.svgo({ // используем встроенный svgo
                plugins: [{
                        removeViewBox: false
                    },
                    {
                        cleanupIDs: true
                    }
                ]
            })
        ]))
        .pipe(gulp.dest(path.img.dest))
        .pipe(browserSync.stream({
            once: true
        }));
}


function jsTask() {
    return gulp.src(path.js.src)
        .pipe(gulp.dest(path.js.dest))
        .pipe(browserSync.stream());
}

const clean = () => deleteAsync(['pages/**', '!pages']);

function watchTask() {
    browserSync.init({
        server: {
            baseDir: 'pages',
            injectChanges: true
        }
    });
    gulp.watch(path.pug.watch, pugTask);
    gulp.watch(path.sass.watch, sassTask);
    gulp.watch(path.img.src, imgTask);
    gulp.watch(path.js.src, jsTask);
}

export const watch = gulp.series(gulp.parallel(pugTask, sassTask, imgTask, jsTask), watchTask);
export const build = gulp.series(clean, gulp.parallel(pugTask, sassTask, imgTask, jsTask));
export const html = gulp.series(pugTask);
export const images = gulp.series(imgTask);
export default watch;