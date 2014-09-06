/**
 * Created by gvc1 on 03-09-2014.
 */

'use strict';

exports = module.exports = function (app, mongoose) {
    var entrySchema = new mongoose.Schema({
        type: { type: String },
        amount: {type: Number},
        description: { type: String },
        //owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        //for:{type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        timeCreated: { type: Date, default: Date.now },
        search: [String]
    });

    entrySchema.plugin(require('./plugins/pagedFind'));




    entrySchema.index({ type: 1 });
    entrySchema.index({ amount: 1 });
    entrySchema.index({ description: 1 });
    entrySchema.index({ timeCreated: 1 });
    entrySchema.index({ search: 1 });
    entrySchema.set('autoIndex', (app.get('env') === 'development'));
    app.db.model('Entry', entrySchema);
};