var express = require('express');
var router = express.Router();
var ostrich = require('ostrich-bindings');
var getFolderSize = require('get-folder-size');

var path = process.argv[2];
if (!path) {
  throw new Error('No OSTRICH path was provided.');
}

prepare(path, function (store) {
  router.get('/', function(req, res, next) {
    getStats(path, store).then(function (stats) {
      res.render('index', Object.assign({ title: 'OSTRICH Demo'}, stats ));
    });
  });

  // Cleanup
  process.on('SIGINT', function() {
    store.close(function() { process.exit(); });
  });
  process.on('uncaughtException', function() {
    store.close(function() { process.exit(); });
  });
});

module.exports = router;

function prepare(path, cb) {
  ostrich.fromPath(path, function (error, store) {
    if (error) {
      throw error;
    }
    cb(store);
  });
}

function getStats(path, store) {
  return new Promise(function (resolve, reject) {
    getFolderSize(path, function (err, size) {
      if (err) {
        reject(err);
      }
      var stats = {
        path: path,
        versions: store.maxVersion,
        size: (size / 1024 / 1024).toFixed(2),
      };

      resolve(stats);
    });
  });
}

