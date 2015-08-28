var router = require('express').Router();
var AV = require('leanengine');

var Test = AV.Object.extend('Test');

router.param('testId', function(req, res, next, id) {
    console.log('testId = ', id);
    next();
});

router.get('/', function(req, res, next) {
    var query = new AV.Query(Test);
    query.find({
        success: function(results) {
            res.status(200).json(results);
        },
        error: function(err) {
            next(err);
        }
    });
});

router.post('/', function(req, res, next) {
    var content = req.body.content;
    var test = new Test();
    test.set('content', content);
    test.save(null, {
        success: function(test) {
            res.status(200).json(test);
        },
        error: function(test, err) {
            next(err);
        }
    });
});

router.get('/:testId', function(req, res, next) {
    res.status(200).send('ok');
});

module.exports = router;
