'use strict';

exports.init = function(req, res, next){
  var sigma = {};
  var collections = req.app.config.models.names;
  var queries = [];

  collections.forEach(function(el, i, arr) {
    queries.push(function(done) {
      req.app.db.models[el].count({}, function(err, count) {
        if (err) {
          return done(err, null);
        }

        sigma['count'+ el] = count;

        console.log("creating urls: " + req.app.config.urls.admin[el.toLowerCase() + "Url"]);

        sigma['url'+ el] = req.app.config.urls.admin[el.toLowerCase() + "Url"];
        sigma['h'+ el] = el + "s";
        done(null, el);
      });
    });
  });

  var asyncFinally = function(err, results) {
    if (err) {
      return next(err);
    }

    res.render('admin/index', sigma);
  };

  require('async').parallel(queries, asyncFinally);
};
