module.exports = function(config, cbSuccess, cbFail) {
    var template = config.template, fields = config.data.fields;

    var fieldKeys = Object.keys(fields);
    for(var i = 0; i < fieldKeys.length; i++) {
        let key = fieldKeys[i];
        template = template.replace(new RegExp(`<%= @${key}+ %>`, "g"), fields[key]);
    }

    cbSuccess(template);
};