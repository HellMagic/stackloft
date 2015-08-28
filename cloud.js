var AV = require('leanengine');


AV.Cloud.beforeSave('Test', function(request, response) {
    console.log('presave test', JSON.stringify(request.object));
    response.success();
});

module.exports = AV.Cloud;