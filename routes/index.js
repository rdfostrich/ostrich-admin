var express = require('express');
var router = express.Router();
var ostrich = require('ostrich-bindings');
var getFolderSize = require('get-folder-size');
var fs = require('fs');
var _ = require('lodash');

var path = process.argv[2];
if (!path) {
  throw new Error('No OSTRICH path was provided.');
}
var prefixes = JSON.parse(fs.readFileSync(process.argv > 3 ? process.argv[3] : 'config/prefixes.json'));
var replacePrefixes = [];
Object.keys(prefixes).forEach(function (uri) {
  var reg = new RegExp('^' + uri.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'));
  replacePrefixes.push(function (full) {
    return full.replace(reg, prefixes[uri] + ':');
  });
});

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
        version: store.maxVersion
      }, req.query);

      var startTime = getTimeMs();
      store.searchTriplesVersionMaterialized(query.subject, query.predicate, query.object,
        { version: query.version, offset: query.offset, limit: query.limit }, function (error, triples, count, exact) {
          var endTime = getTimeMs();
          res.render('query', Object.assign({ title: 'Version Materialization', querytype: 'qvm' }, stats,
            {
              query: query,
              triples: compactTriples(triples),
              currentCount: triples.length,
              count: count,
              countType: exact ? "Exact" : "Estimate",
              duration: (endTime - startTime).toFixed(3)
            }));
      });
    });
  });

  router.get('/qdm', function(req, res, next) {
    getStats(path, store).then(function (stats) {
      var query = Object.assign({
        subject: '',
        predicate: '',
        object: '',
        offset: 0,
        limit: 20,
        versionStart: 0,
        versionEnd: store.maxVersion
      }, req.query);

      var startTime = getTimeMs();
      store.searchTriplesDeltaMaterialized(query.subject, query.predicate, query.object,
        { versionStart: query.versionStart, versionEnd: query.versionEnd, offset: query.offset, limit: query.limit }, function (error, triples, count, exact) {
          var endTime = getTimeMs();
          res.render('query', Object.assign({ title: 'Delta Materialization', querytype: 'qdm' }, stats,
            {
              query: query,
              triples: compactTriples(triples),
              currentCount: triples.length,
              count: count,
              countType: exact ? "Exact" : "Estimate",
              duration: (endTime - startTime).toFixed(3)
            }));
        });
    });
  });

  router.get('/qvq', function(req, res, next) {
    getStats(path, store).then(function (stats) {
      var query = Object.assign({
        subject: '',
        predicate: '',
        object: '',
        offset: 0,
        limit: 20
      }, req.query);

      var startTime = getTimeMs();
      store.searchTriplesVersion(query.subject, query.predicate, query.object,
        { offset: query.offset, limit: query.limit }, function (error, triples, count, exact) {
          var endTime = getTimeMs();
          // Compact triple versions
          triples.map(function (triple) {
            var lastVersion = -2;
            triple.versionsString = '[' + triple.versions[0];
            triple.versions.sort().forEach(function (version) {
              if (lastVersion !== -2 && version > lastVersion + 1) {
                triple.versionsString += '-' + lastVersion + '], [' + version;
              }
              lastVersion = version;
            });
            triple.versionsString += '-' + lastVersion +  ']';
            return triple;
          });
          res.render('query', Object.assign({ title: 'Version Query', querytype: 'qvq' }, stats,
            {
              query: query,
              triples: compactTriples(triples),
              currentCount: triples.length,
              count: count,
              countType: exact ? "Exact" : "Estimate",
              duration: (endTime - startTime).toFixed(3)
            }));
        });
    });
  });

  router.get('/stats', function(req, res, next) {
    getStats(path, store).then(function (stats) {

      var startTime = getTimeMs();
      var histograms = Promise.all([histogramVm(store)/*, histogramDm(store)*/]);
      histograms.then(function (hist) {
        var endTime = getTimeMs();
        res.render('stats', Object.assign({ title: 'Statistics', querytype: 'stats' }, stats,
          {
            histogramVm: hist[0],
            //histogramDm: hist[1],
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

function compactTriples(triples) {
  return triples.map(compactTriple);
}

function compactTriple(triple) {
  triple.subjectShort = compactTerm(triple.subject);
  triple.predicateShort = compactTerm(triple.predicate);
  triple.objectShort = compactTerm(triple.object);
  return triple;
}

function compactTerm(term) {
  replacePrefixes.forEach(function (prefixer) {
    term = prefixer(term);
  });
  return term;
}

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

function countVm(store, version) {
  return new Promise(function (resolve, reject) {
    store.countTriplesVersionMaterialized(null, null, null, version, function (error, triples) {
      if (error) {
        reject(error);
      }
      resolve(triples);
    });
  });
}

function histogramVm(store) {
  return _.range(store.maxVersion).reduce(function (p, v) {
    return p.then(function (results) {
      return countVm(store, v).then(function (result) {
        results.push(result);
        return results;
      });
    });
  }, Promise.resolve([]));
}

function countDm(store, versionStart, versionEnd) {
  return new Promise(function (resolve, reject) {
    store.countTriplesDeltaMaterialized(null, null, null, versionStart, versionEnd, function (error, triples) {
      if (error) {
        reject(error);
      }
      resolve(triples);
    });
  });
}

function histogramDm(store) {
  return Promise.all(_.range(store.maxVersion - 1).map(function (v) { return countDm(store, v, v + 1) }));
}

