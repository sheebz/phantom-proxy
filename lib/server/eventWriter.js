(function (module) {
    var EventWriter = function EventWriter(options) {
        var path  = options.eventStreamPath;
        this.triggerEvent = function (source, event) {

            event.source = source;

            try {
                var writeStream = require('fs').open(path, 'a');
                writeStream.writeLine(JSON.stringify(event));
                writeStream.flush();
                writeStream.close();
            }
            catch (exception) {
                console.error(exception.toString());
                throw(exception);
            }
        }
    };

    module.exports = {
        create:function (options) {
            return  new EventWriter(options);
        }
    };
}(module));
