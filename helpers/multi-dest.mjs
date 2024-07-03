import through from 'through2';
import gulp from 'gulp';
import async from 'async';

export default function (paths, options) {
    options = options || {};
    var writtenFiles = [];

    if (typeof paths === 'string') {
        paths = [paths];
    }

    var dests = paths.map(function (path) {
        return gulp.dest(path, options);
    });

    function writeFileToMultipleDestinations(file, encoding, done) {
        async.each(dests, function (dest, wroteFileToDest) {
            var fileClone = file.clone();
            dest.write(fileClone, function () {
                writtenFiles.push(fileClone);
                wroteFileToDest();
            });
        });
        done(null, file);
    }

    function flushCreatedFiles(done) {
        var stream = this;
        for (var i = 0; i < writtenFiles.length; i++) {
            var file = writtenFiles[i];
            stream.push(file);
        }
        done();
    }

    return through.obj(writeFileToMultipleDestinations, flushCreatedFiles);
};
