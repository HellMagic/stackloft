var express = require('express');
var AV = require('leanengine');
var _ = require('lodash');

var Service = global.Service = AV.Object.extend('Service');

var router = express.Router();

router.post('/', function(req, res, next) {
    var service = new Service();
    service.set('content', req.body.content);
    service.save(null, {
        success: function(_service) {
            res.status(200).json(_service);
        },
        error: function(_service, err) {
            res.status(500).json(err);
        }
    });
})

router.put('/:id/like', function(req, res, next) {
    var query = new AV.Query(Service);
    query.get(req.params.id).then(function(service) {
        var likes = service.get('likes') || [];
        var find = _.some(likes, function(liker) {
            return liker.objectId == AV.User.current().objectId;
        });
        req.find = find;
        if (find) {
            service.remove('likes', AV.User.current());
        } else {
            service.addUnique('likes', AV.User.current());
        }
        return service.save();
    }).then(function(service) {
        // 如果是标记喜欢则返回true，如果是取消喜欢则返回false
        res.status(200).send(!!!req.find);
    }).catch(function(service, err) {
        res.status(500).json(err);
    })
});

module.exports = router;