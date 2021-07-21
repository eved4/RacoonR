var express = require('express');
var router = express.Router();
var results;

/* Include and use all the required routes*/
var register_routes = require('./register_routes');
router.use('/', register_routes);

var account_routes = require('./account_routes');
router.use('/', account_routes);

var additem_routes = require('./additem_routes');
router.use('/', additem_routes);

var browse_routes = require('./browse_routes');
router.use('/', browse_routes);

var browseloggedin_routes = require('./browseloggedin_routes');
 router.use('/', browseloggedin_routes);

var browsewated_routes = require('./browsewanted_routes');
router.use('/', browsewated_routes);

var community_routes = require('./community_routes');
router.use('/', community_routes);

var communities_routes = require('./communities_routes');
router.use('/', communities_routes);

var communityform_routes = require('./communityform_routes');
router.use('/', communityform_routes);

var eventpage_routes = require('./eventpage_routes');
router.use('/', eventpage_routes);

var events_routes = require('./events_routes');
router.use('/', events_routes);

var login_routes = require('./login_routes');
router.use('/', login_routes);

var indexloggedin_routes = require('./indexloggedin_routes');
router.use('/', indexloggedin_routes);

var offeritem_routes = require('./offeritem_routes');
router.use('/', offeritem_routes);

var wanteditem_routes = require('./wanteditem_routes');
router.use('/', wanteditem_routes);

/* GET the home page */
router.get('/', function (req, res) {
  return res.render('index');
});

module.exports = router;
module.exports = function(isLoggedIn);