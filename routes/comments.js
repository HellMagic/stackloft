/**
 * 评论Schema: content: xxx, user: xxx
 * 一篇文章有多条评论。每条评论有自己的内容和作者的信息：userId和userName
 * userId可以被前端用来判断当前评论是否可被当前用户删除，username作为评论的附属显示内容
 * 获取一篇文章的时候同样获取到此文章下的所有评论
 * 评论可被所有用户读取，但是只能被评论作者自己删除
 */

var express = require('express');
var router = express.Router();
var _ = require('lodash');

var AV = require('leanengine');
var Comment = global.Comment = AV.Object.extend('Comment');

// 给文章添加评论
router.post('/article/:articleId', function(req, res, next) {
    var articleId = req.params.articleId;
    var commentContent = req.body.content;
    var commentAuthor = AV.User.current();
    var query = new AV.Query(global.Article);
    query.get(articleId).then(function(article) {
        var comment = new Comment();
        comment.set('content', commentContent);
        comment.set('author', commentAuthor);
        if(req.AV.user) {
            var acl = new AV.ACL(req.AV.user);
            acl.setPublicReadAccess(true);
            comment.setACL(acl);
        }
        article.add('comments', comment);
        return article.save();
    }).then(function(article) {
        res.status(200).json(article);
    }).catch(function(err) {
        res.status(500).json(err);
    });
});

// 用户删除评论--前端可以利用comment.user.id和当前登录用户的id匹配来实现“只有用户可以删除的评论--即他自己的评论--才会显示删除按钮”功能
router.delete('/:id/:articleId', function(req, res, next) {
    //删除一条评论，并且要把它先从article中移除，并更新atricle

    // 怎么移除？使用针对数组的remove是否可以？前端remove的参数是？
    var dcomment = AV.Object.createWithoutData("Comment", req.params.id);
    var query = new AV.Query(global.Article);
    query.get(req.params.articleId).then(function(article) {
        article.remove('comments', dcomment);
        return article.save();
    }).then(function(article) {
        var cquery = new AV.Query(Comment);
        return cquery.get(req.params.id);
    }).then(function(comment) {
        comment.destroy({
            success: function(obj) {
                // res.redirect('/articles');
                res.status(200).send('ok');
            },
            error: function(obj, err) {
                res.status(500).json(err);
            }
        });
    });
});

module.exports = router;


