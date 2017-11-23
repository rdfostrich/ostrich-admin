var express = require('express');
var router = express.Router();
var ostrich = require('ostrich-bindings');
var getFolderSize = require('get-folder-size');

var path = process.argv[2];
if (!path) {
  throw new Error('No OSTRICH path was provided.');
}

var lastTotalCount = -1;

prepare(path, function (store) {
  router.get('/', function(req, res, next) {
    getStats(path, store).then(function (stats) {
      res.render('index', Object.assign({ title: 'OSTRICH Demo'}, stats));
    });
  });

  router.get('/qvm', function(req, res, next) {
    getStats(path, store).then(function (stats) {
      var query = Object.assign({
        subject: '',
        predicate: '',
        object: '',
        offset: 0,
        limit: 20,
        version: store.maxVersion,
      }, req.query);

      var startTime = getTimeMs();
      store.searchTriplesVersionMaterialized(query.subject, query.predicate, query.object,
        { version: query.version, offset: query.offset, limit: query.limit }, function (error, triples, count, exact) {
          var endTime = getTimeMs();
          res.render('qvm', Object.assign({ title: 'Version Materialization'}, stats,
            {
              query: query,
              triples: triples,
              currentCount: triples.length,
              count: count,
              countType: exact ? "Exact" : "Estimate",
              duration: (endTime - startTime).toFixed(3)
            }));
      });
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
    getTotalCount(store).then(function(triples) {
      getFolderSize(path, function (err, size) {
        if (err) {
          reject(err);
        }
        var stats = {
          path: path,
          versions: store.maxVersion,
          size: (size / 1024 / 1024).toFixed(2),
          totalTriples: triples,
        };

        resolve(stats);
      });
    }).catch(reject);
  });
}

function getTotalCount(store) {
  return new Promise(function (resolve, reject) {
    if (lastTotalCount > -1) {
      resolve(lastTotalCount);
    } else {
      store.countTriplesVersion(null, null, null, function (error, triples) {
        if (error) {
          reject(error);
        }
        resolve(lastTotalCount = triples);
      });
    }
  });
}

function getTimeMs() {
  var hrTime = process.hrtime();
  return hrTime[0] * 1000 + hrTime[1] / 1000000;
}

