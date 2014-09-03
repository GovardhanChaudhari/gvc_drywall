/**
 * Created by gvc1 on 31-08-2014.
 */

exports.init = function(req, res) {
    var showSignOutLabel = false;
    if (req.isAuthenticated()) {
        showSignoutLabel = true;
    }
    res.render("./account");
};