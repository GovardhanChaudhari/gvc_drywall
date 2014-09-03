'use strict';

exports.init = function(req, res){
  res.render('index',req.app.config.urls);
};
