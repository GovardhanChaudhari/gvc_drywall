'use strict';

exports = module.exports = function(req, res) {
  var workflow = new (require('events').EventEmitter)();

  workflow.outcome = {
    success: false,
    errors: [],
    errfor: {},
    urls:{}
  };

  workflow.hasErrors = function() {
    return Object.keys(workflow.outcome.errfor).length !== 0 || workflow.outcome.errors.length !== 0;
  };

  workflow.on('exception', function(err) {
    workflow.outcome.errors.push('Exception: '+ err);
    return workflow.emit('response');
  });

  workflow.on('response', function() {
    workflow.outcome.success = !workflow.hasErrors();
      console.log("workflow response is called");
      //req.app.utility.view.showNotice(workflow.outcome);
      workflow.outcome.urls = req.app.config.urls;
    res.send(workflow.outcome);
  });

  return workflow;
};
