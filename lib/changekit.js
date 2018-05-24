const uuid = require("uuid");
let database;

exports = module.exports = init;

exports.shouldUpdate = shouldUpdate;
exports.stubForResource = stubForResource;

function init(mysqlDatabase) {
    if (mysqlDatabase === undefined || mysqlDatabase === null) {
        throw "ChangeKit requires a MySQL database as input. See 'mysql' on npm";
    }

    mysqlDatabase.query({
        sql: "CREATE TABLE IF NOT EXISTS `changekit` ( `resource` TEXT NOT NULL, `value` TEXT NOT NULL, `lastUpdated` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ) ENGINE=InnoDB"
    }, function (error) {
        if (error) {
            throw error;
        }
    });

    database = mysqlDatabase;
}

function shouldUpdate(clientValue, stub) {
    if (!stub instanceof Stub) {
        return;
    }

    return clientValue !== stub.value;
}

function stubForResource(resource) {
    const stub = new Stub(resource).then(() => {
         return stub;
    });
}

function Stub(resource) {
    const stub = this;

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
}