/* ******************************************* */
/*                 Modules                     */
/* ******************************************* */
import gulp from "gulp";
import browserSync from "browser-sync";
import cleancss from "gulp-clean-css";
import rename from "gulp-rename";
import uglify from "gulp-uglify";
import concat from "gulp-concat";
import autoprefixer from "gulp-autoprefixer";
import gcmq from "gulp-group-css-media-queries";
import notify from "gulp-notify";
import log from "fancy-log";
import colors from "colors";
import image from "gulp-image";
import sourcemaps from "gulp-sourcemaps";
import { deleteAsync } from "del";
import babel from "gulp-babel";
import htmlreplace from "gulp-html-replace";
import dartSass from 'sass';
import gulpSass from 'gulp-sass';

const sass = gulpSass(dartSass);

/* ******************************************* */
/*                  Settings                   */
/* ******************************************* */
const settings = {
  // Main settings
  files: {
    // Setup main files names
    mainStylesFile: "main", // Name of main styles file
    jsLibsName: "libs", // Name of file with all js libs
    mainJsFile: "main", // Name of file with custom scripts
    allScripts: "scripts" // Name of file with all scripts
  },
  path: {
    // Paths setup
    build: "dist", // Build directory
    src: "src" // Source directory
  }
};

/* ******************************************* */
/*                Gulp tasks                   */
/* ******************************************* */

// Starting local browser task
gulp.task("BrowserSync", function() {
  browserSync.init({
    server: {
      baseDir: `${settings.path.src}`
    },
    notify: false,
    ghostMode: false,
    cors: true
    // open: false,
    // online: false, // Work Offline Without Internet Connection
  });
});

// Less compiling task
gulp.task("styles", function() {
  // Log task
  log.info(colors.green(`Building styles`));

  // Return task instance
  return gulp
    .src(`./${settings.path.src}/scss/**/${settings.files.mainStylesFile}.scss`) // Get files
    .pipe(sourcemaps.init()) // Init sourcemaps
    .pipe(sass().on("error", notify.onError())) // Compiling styles
    .pipe(gcmq().on("error", notify.onError())) // Group media queries
    .pipe(autoprefixer(["last 15 versions"])) // Use autoprefixer
    .pipe(rename({ suffix: ".min" })) // Add ".min" suffix for files
    .pipe(cleancss({ level: { 1: { specialComments: 0 } } })) // Clean css
    .pipe(sourcemaps.write("./")) // Create sourcemaps file
    .pipe(gulp.dest(`./${settings.path.src}/css`)) // Get out files in dist directory
    .pipe(browserSync.reload({ stream: true })); // Reload browser
});

// Scripts compiling task
// ** Compiling JSLibs
gulp.task("JSLibs", function() {
  // Log task
  log.info(colors.green("Building js libraries"));

  const libs = [
    // List your js libraries
    "./node_modules/swiper/swiper-bundle.js",
  ];

  // Compile libs scripts
  return gulp
    .src(libs)
    .pipe(uglify().on("error", notify.onError())) // Miniify js files
    .pipe(concat(`${settings.files.jsLibsName}.min.js`)) // Concat files in one
    .pipe(gulp.dest(`./${settings.path.src}/js`)); // Get out file in dist directory
});

// ** Compile custom scripts
gulp.task("CustomJS", function() {
  // Log task
  log.info(colors.green("Minify scripts"));

  // Return task instance
  return gulp
    .src(`./${settings.path.src}/js/${settings.files.mainJsFile}.js`) // Get file
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(uglify().on("error", notify.onError())) // Minify code
    .pipe(
      // Add sufix for file
      rename({ suffix: ".min" })
    )
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(`./${settings.path.src}/js`)); // Get out file in dist directory
});

// ** Concat all scripts
gulp.task("ConcatJS", function() {
  // Log task
  log.info(colors.green("Concating all scripts"));

  // Return task instance
  return gulp
    .src([
      // Get js files
      `./${settings.path.src}/js/${settings.files.jsLibsName}.min.js`,
      `./${settings.path.src}/js/${settings.files.mainJsFile}.min.js`
    ])
    .pipe(concat(`${settings.files.allScripts}.min.js`)) // Concat js files
    .pipe(gulp.dest(`./${settings.path.src}/js`)) // get out scripts in dist directory
    .pipe(browserSync.reload({ stream: true })); // Reload browser
});

// Builld task
// ** Dest files
gulp.task("dest", function() {
  // Log task
  log.info(colors.green("Get out files in build directory"));

  // Dest images
  gulp.src(`./${settings.path.src}/img/**/*`).pipe(gulp.dest(`./${settings.path.build}/img`));
  // Dest fonts
  gulp.src(`./${settings.path.src}/fonts/**/*`).pipe(gulp.dest(`./${settings.path.build}/fonts`));
  // Dest styles
  gulp
    .src(`./${settings.path.src}/css/${settings.files.mainStylesFile}.min.css`)
    .pipe(gulp.dest(`./${settings.path.build}/css`));
  // dest sccripts
  gulp
    .src(`./${settings.path.src}/js/${settings.files.allScripts}.min.js`)
    .pipe(gulp.dest(`./${settings.path.build}/js`));
  // Dest html
  return gulp
    .src(`./${settings.path.src}/**/*.html`)
    .pipe(
      htmlreplace(
        {
          js: { src: "js/scripts.min.js", tpl: "<script src=\"%s\"></script>" }
        },
        {
          keepBlockTags: true
        }
      )
    )
    .pipe(gulp.dest(`./${settings.path.build}`));
});

// ** Clean build derictory
gulp.task("CleanDist", function() {
  // Log task
  log.info(colors.green("Cleaning build directory"));

  // Return task instance
  return deleteAsync(`./${settings.path.build}`);
});

// ** Images minifing
gulp.task("ImagesMinify", function() {
  // Log task
  log.info(colors.green("Minifing images"));

  // Return task instance
  return gulp
    .src(`./${settings.path.src}/img/**/*`) // Get images
    .pipe(image()) // Minify images
    .pipe(gulp.dest(`./${settings.path.src}/img`)); // Get out in dist directory
});

// ** Building project
gulp.task(
  "build",
  gulp.series("CleanDist", "styles", "JSLibs", "CustomJS", "ConcatJS", "ImagesMinify", "dest")
);

// Watch task
gulp.task("watch", function() {
  // Watch for html files changing
  gulp.watch(`./${settings.path.src}/**/*.html`).on("change", browserSync.reload);
  // Watch for styles files changing
  gulp.watch(`./${settings.path.src}/scss/**/*.scss`, gulp.parallel("styles"));
  gulp.watch(
    // Watch for js files changing
    `./${settings.path.src}/js/${settings.files.mainJsFile}.js`,
    gulp.series("CustomJS", "ConcatJS")
  );
});

// Default task
gulp.task(
  "default",
  gulp.series("styles", "JSLibs", "CustomJS", "ConcatJS", gulp.parallel("watch", "BrowserSync"))
);
