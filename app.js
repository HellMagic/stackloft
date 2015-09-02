var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var AV = require('leanengine');

// 获取测试路由对象
var test = require('./routes/test');
var users = require('./routes/users');
var articles = require('./routes/articles');
var comments = require('./routes/comments');
var services = require('./routes/services');
// 加载测试hook
var cloud = require('./cloud');

var app = express();

// 基本的express初始化中间件
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'webapp', (app.get('env') == 'production') ? 'bin' : 'build')));

app.use(cloud);

app.use(AV.Cloud.CookieSession({ secret: 'stackloft1024', maxAge: 1000 * 60 * 60 * 24 * 3, fetchUser: true } ) );

app.use(methodOverride('_method'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//加载路由
app.use('/test', test);
app.use('/users', users);
app.use('/articles', articles);
app.use('/services', services);
app.use('/comments', comments);

app.get('/', function(req, res) {
    res.redirect('/test');
});

// 如果前面的路由都没有响应，那么就是404没有找到对应的路由
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

if(app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        console.log('Development Server Error: ===================================');
        console.log(JSON.stringify(err));
        console.log('===================================');
        res.status(err.status || 500);
        // 如果是401或者是403的话是不是需要特殊处理？比如给用户重定向到login，并给出flash提示
        res.render('error', {
            message: err.message,
            error: err
        });
    });
} else {
    app.use(function(err, req, res, next) {
        console.log('Production Server Error: ===================================');
        console.log(JSON.stringify(err));
        console.log('===================================');
        res.render('error', {
            message: err.message,
            error: {}
        });
    });
}

module.exports = app;