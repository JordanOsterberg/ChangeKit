const uuid = require("uuid");
let database;

module.exports = function(config) {
    database = config.mysqlDatabase;

    if (database === undefined || database === null) {
        throw "ChangeKit requires a MySQL database as input. See 'mysql' on npm";
    }

    database.query({
        sql: "CREATE TABLE IF NOT EXISTS `changekit` ( `resource` TEXT NOT NULL, `value` TEXT NOT NULL, `lastUpdated` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ) ENGINE=InnoDB"
    }, function (error) {
        if (error) {
            throw error;
        }
    });

    if (config.useExpress !== undefined && config.useExpress === false) {
        this.shouldUpdate = shouldUpdateGeneral;
    } else {
        this.shouldUpdate = shouldUpdateExpress;
    }

    this.stubForResource = stubForResource;
    this.Stub = Stub;

    return this;
};

function shouldUpdateGeneral(clientStubValue, stub) {
    return clientStubValue !== stub.value;
}

function shouldUpdateExpress(expressRequest, stub) {
    if (!stub instanceof Stub) {
        return;
    }

    const req = expressRequest.method === "POST" ? expressRequest.body : expressRequest.query;

    return req.ckStubValue !== stub.value;
}

function stubForResource(resource) {
    return new Promise(function(resolve) {
        const stub = new Stub(resource);

        stub.init().then(() => {
            resolve(stub)
        })
    });
}

function Stub(resource) {
    const stub = this;

    stub.init = function() {
        return new Promise(function (resolve) {
            database.query({
                sql: "SELECT * FROM changekit WHERE resource = ?",
                values: [resource]
            }, function (error, results) {
                if (error || results.length === 0) {
                    stub.resource = resource;
                    stub.value = uuid.v4();

                    database.query({
                        sql: "INSERT INTO changekit (`resource`, `value`) VALUES (?, ?)",
                        values: [stub.resource, stub.value]
                    });

                    resolve();
                    return;
                }

                stub.resource = resource;
                stub.value = results[0].value;
                resolve();
            });
        });
    };

    stub.update = function () {
        stub.value = uuid.v4();

        database.query({
            sql: "UPDATE changekit SET value = ?, lastUpdated = CURRENT_TIMESTAMP",
            values: [stub.value]
        });
    };
}

exports.shouldUpdate = shouldUpdate;
exports.stubForResource = stubForResource;
