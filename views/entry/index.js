/**
 * Created by gvc1 on 03-09-2014.
 */
'use strict';

exports.find = function(req, res, next){
    var outcome = {};

    var getResults = function(callback) {
        req.query.search = req.query.search ? req.query.search : '';
        req.query.status = req.query.status ? req.query.status : '';
        req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 20;
        req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
        req.query.sort = req.query.sort ? req.query.sort : '_id';

        var filters = {};
        if (req.query.search) {
            filters.search = new RegExp('^.*?'+ req.query.search +'.*$', 'i');
        }

        req.app.db.models.Entry.pagedFind({
            filters: filters,
            keys: 'description type amount',
            limit: req.query.limit,
            page: req.query.page,
            sort: req.query.sort
        }, function(err, results) {
            if (err) {
                return callback(err, null);
            }

            outcome.results = results;
            return callback(null, 'done');
        });
    };

    var asyncFinally = function(err, results) {
        if (err) {
            return next(err);
        }

        if (req.xhr) {
            res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
            outcome.results.filters = req.query;
            res.send(outcome.results);
        }
        else {
            outcome.results.filters = req.query;
            // server view
            res.render('entry/index', {
                data: {
                    results: escape(JSON.stringify(outcome.results))
                }
            });
        }
    };

    require('async').parallel([getResults], asyncFinally);
};

exports.read = function(req, res, next){
    var outcome = {};
    var getRecord = function(callback) {
        req.app.db.models.Entry.findById(req.params.id).exec(function(err, record) {
            if (err) {
                return callback(err, null);
            }

            console.log("found entry record:" + record);

            outcome.record = record;
            return callback(null, 'done');
        });
    };

    var asyncFinally = function(err, results) {
        if (err) {
            return next(err);
        }

        if (req.xhr) {
            res.send(outcome.record);
        }
        else {
            // server view
            res.render('entry/details', {
                data: {
                    record: escape(JSON.stringify(outcome.record))
                }
            });
        }
    };

    require('async').parallel([getRecord], asyncFinally);
};

exports.create = function(req, res, next){
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function() {
        if (!req.body['amount']) {
            workflow.outcome.errors.push('Please enter amount.');
            return workflow.emit('response');
        }

        if (!req.body['type']) {
            workflow.outcome.errors.push('Please enter type.');
            return workflow.emit('response');
        }

        workflow.emit('createEntry');
    });

    workflow.on('createEntry', function() {
        var fieldsToSet = {

            amount:req.body['amount'],
            type:req.body['type'],
            description:req.body['description']
            //TODO
            /*userCreated: {
                id: req.user._id,
                name: req.user.username,
                time: new Date().toISOString()
            }*/
        };
        fieldsToSet.search = [
            fieldsToSet.amount,
            fieldsToSet.type,
            fieldsToSet.description
        ];

        req.app.db.models.Entry.create(fieldsToSet, function(err, entry) {
            if (err) {
                return workflow.emit('exception', err);
            }

            workflow.outcome.record = entry;
            return workflow.emit('response');
        });
    });

    workflow.emit('validate');
};

exports.update = function(req, res, next){
    console.log("Called entry update .... ");

    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function() {
        if (!req.body.amount) {
            workflow.outcome.errfor.amount = 'required';
        }

        if (!req.body.type) {
            workflow.outcome.errfor.type = 'required';
        }

        if (workflow.hasErrors()) {
            return workflow.emit('response');
        }

        workflow.emit('patchEntry');
    });

    workflow.on('patchEntry', function() {



        var fieldsToSet = {
            amount:req.body['amount'],
            type:req.body['type'],
            description:req.body['description'],
            search: [
                req.body['amount'],
                req.body['type'],
                req.body['description']
            ]
        };

        req.app.db.models.Entry.findByIdAndUpdate(req.params.id, fieldsToSet, function(err, entry) {
            if (err) {
                return workflow.emit('exception', err);
            }

            workflow.outcome.entry = entry;
            return workflow.emit('response');
        });
    });

    workflow.emit('validate');
};

exports.linkUser = function(req, res, next){
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function() {
        if (!req.user.roles.admin.isMemberOf('root')) {
            workflow.outcome.errors.push('You may not link accounts to users.');
            return workflow.emit('response');
        }

        if (!req.body.newUsername) {
            workflow.outcome.errfor.newUsername = 'required';
            return workflow.emit('response');
        }

        workflow.emit('verifyUser');
    });

    workflow.on('verifyUser', function(callback) {
        req.app.db.models.User.findOne({ username: req.body.newUsername }).exec(function(err, user) {
            if (err) {
                return workflow.emit('exception', err);
            }

            if (!user) {
                workflow.outcome.errors.push('User not found.');
                return workflow.emit('response');
            }
            else if (user.roles && user.roles.account && user.roles.account !== req.params.id) {
                workflow.outcome.errors.push('User is already linked to a different account.');
                return workflow.emit('response');
            }

            workflow.user = user;
            workflow.emit('duplicateLinkCheck');
        });
    });

    workflow.on('duplicateLinkCheck', function(callback) {
        req.app.db.models.Account.findOne({ 'user.id': workflow.user._id, _id: {$ne: req.params.id} }).exec(function(err, account) {
            if (err) {
                return workflow.emit('exception', err);
            }

            if (account) {
                workflow.outcome.errors.push('Another account is already linked to that user.');
                return workflow.emit('response');
            }

            workflow.emit('patchUser');
        });
    });

    workflow.on('patchUser', function() {
        req.app.db.models.User.findByIdAndUpdate(workflow.user._id, { 'roles.account': req.params.id }).exec(function(err, user) {
            if (err) {
                return workflow.emit('exception', err);
            }

            workflow.emit('patchAccount');
        });
    });

    workflow.on('patchAccount', function(callback) {
        req.app.db.models.Account.findByIdAndUpdate(req.params.id, { user: { id: workflow.user._id, name: workflow.user.username } }).exec(function(err, account) {
            if (err) {
                return workflow.emit('exception', err);
            }

            workflow.outcome.account = account;
            workflow.emit('response');
        });
    });

    workflow.emit('validate');
};

exports.unlinkUser = function(req, res, next){
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function() {
        if (!req.user.roles.admin.isMemberOf('root')) {
            workflow.outcome.errors.push('You may not unlink users from accounts.');
            return workflow.emit('response');
        }

        workflow.emit('patchAccount');
    });

    workflow.on('patchAccount', function() {
        req.app.db.models.Account.findById(req.params.id).exec(function(err, account) {
            if (err) {
                return workflow.emit('exception', err);
            }

            if (!account) {
                workflow.outcome.errors.push('Account was not found.');
                return workflow.emit('response');
            }

            var userId = account.user.id;
            account.user = { id: undefined, name: '' };
            account.save(function(err, account) {
                if (err) {
                    return workflow.emit('exception', err);
                }

                workflow.outcome.account = account;
                workflow.emit('patchUser', userId);
            });
        });
    });

    workflow.on('patchUser', function(id) {
        req.app.db.models.User.findById(id).exec(function(err, user) {
            if (err) {
                return workflow.emit('exception', err);
            }

            if (!user) {
                workflow.outcome.errors.push('Entry was not found.');
                return workflow.emit('response');
            }

            user.roles.account = undefined;
            user.save(function(err, user) {
                if (err) {
                    return workflow.emit('exception', err);
                }

                workflow.emit('response');
            });
        });
    });

    workflow.emit('validate');
};

/*exports.newNote = function(req, res, next){
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function() {
        if (!req.body.data) {
            workflow.outcome.errors.push('Data is required.');
            return workflow.emit('response');
        }

        workflow.emit('addNote');
    });

    workflow.on('addNote', function() {
        var noteToAdd = {
            data: req.body.data,
            userCreated: {
                id: req.user._id,
                name: req.user.username,
                time: new Date().toISOString()
            }
        };

        req.app.db.models.Account.findByIdAndUpdate(req.params.id, { $push: { notes: noteToAdd } }, function(err, account) {
            if (err) {
                return workflow.emit('exception', err);
            }

            workflow.outcome.account = account;
            return workflow.emit('response');
        });
    });

    workflow.emit('validate');
};*/

/*exports.newStatus = function(req, res, next){
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function() {
        if (!req.body.id) {
            workflow.outcome.errors.push('Please choose a status.');
        }

        if (workflow.hasErrors()) {
            return workflow.emit('response');
        }

        workflow.emit('addStatus');
    });

    workflow.on('addStatus', function() {
        var statusToAdd = {
            id: req.body.id,
            name: req.body.name,
            userCreated: {
                id: req.user._id,
                name: req.user.username,
                time: new Date().toISOString()
            }
        };

        req.app.db.models.Account.findByIdAndUpdate(req.params.id, { status: statusToAdd, $push: { statusLog: statusToAdd } }, function(err, account) {
            if (err) {
                return workflow.emit('exception', err);
            }

            workflow.outcome.account = account;
            return workflow.emit('response');
        });
    });

    workflow.emit('validate');
};*/

exports.delete = function(req, res, next){
    var workflow = req.app.utility.workflow(req, res);

    //TODO
    workflow.on('validate', function() {
        /*if (!req.user.roles.admin.isMemberOf('root')) {
            workflow.outcome.errors.push('You may not delete accounts.');
            return workflow.emit('response');
        }*/

        workflow.emit('deleteAccount');
    });

    workflow.on('deleteEntry', function(err) {
        req.app.db.models.Entry.findByIdAndRemove(req.params.id, function(err, entry) {
            if (err) {
                return workflow.emit('exception', err);
            }

            workflow.outcome.entry = entry;
            workflow.emit('response');
        });
    });

    workflow.emit('validate');
};
