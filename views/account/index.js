'use strict';

exports.init = function(req, res){
  res.render('account/index',req.app.config.urls);
};