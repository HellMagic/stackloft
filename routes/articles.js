/**

    TODO:
    - 统一对需要获取登录用户信息的资源做Authentication验证
    -

 */


var express = require('express');
var AV = require('leanengine');
var _ = require('lodash');

var router = express.Router();

var Article = global.Article = AV.Object.extend('Article');

/**
 * [description] 获取全部的文章的所有内容？还是只有title和description，而不包含content
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {[type]} next) {}          [description]
 * @return {[type]}       [description]
 */
router.get('/', function(req, res, next) {

});

/**
 * [description] 创建文章
 * @param  {[type]}  req    [description]
 * @param  {[type]}  res    [description]
 * @param  {Article} next)  {                          var article [description]
 * @param  {[type]}  error: function(_article, err) {                                   res.status(500).json(err);        }    });} [description]
 * @return {[type]}         [description]
 */
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

/**
 * [description] 获取指定文章，已经此文章关联的所有评论
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {AV}     next) {               var query [description]
 * @return {[type]}       [description]
 */
router.get('/:id', function(req, res, next) {
    var query = new AV.Query(Article);
    query.include(["comments"]);
    query.get(req.params.id).then(function(article) {
        res.status(200).json({ article: article, comments: article.get('comments')});
    }).catch(function(obj, err) {
        res.status(500).json(err);
    });
});

/**
 * 放在前端还是后端？要是前端：前端处理喜欢还是取消喜欢，后端拿到名单只做持久化。否则后端做逻辑，还是要返回给前端显示
 *
 * [description] 标记/取消喜欢一篇文章
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {[type]} next) {}          [description]
 * @return {[type]}       [description]
 */
router.put('/:id/like', function(req, res, next) {
    var query = new AV.Query(Article);
    query.get(req.params.id).then(function(article) {
        var likes = article.get('likes') || [];
        var find = _.some(likes, function(liker) {
            return liker.objectId == AV.User.current().objectId;
        });
        req.find = find;
        if (find) {
            article.remove('likes', AV.User.current());
        } else {
            article.addUnique('likes', AV.User.current());
        }
        return article.save();
    }).then(function(article) {
        // 如果是标记喜欢则返回true，如果是取消喜欢则返回false
        res.status(200).send(!!!req.find);
    }).catch(function(article, err) {
        res.status(500).json(err);
    })
});

module.exports = router;