// 讨论： 关于获取一篇文章的实现

var express = require('express');
var router = express.Router();

var AV = require('leanengine');

var Article = global.Article = AV.Object.extend('Article');

// 获取全部的文章的所有内容？还是只有title和description，而不包含content
router.get('/', function(req, res, next) {

})

router.post('/', function(req, res, next) {
    var article = new Article();
    article.set('content', req.body.content);
    article.save(null, {
        success: function(_article) {
            res.status(200).json(_article);
        },
        error: function(_article, err) {
            res.status(500).json(err);
        }
    });
});

router.get('/:id', function(req, res, next) {
    // 获取指定文章，已经此文章关联的所有评论
    var query = new AV.Query(Article);
    query.get(req.params.id).then(function(article) {
        return article.fetch();
    }).then(function(_article) {
        res.status(200).json(_article);
    }).catch(function(err) {
        res.status(500).json(err);
    });
});

module.exports = router;