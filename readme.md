# ChangeKit  ![version](https://img.shields.io/badge/version-1.0.8-red.svg)
 ChangeKit is a simple framework that integrates with your iOS and Android apps, along with your server, to make data usage efficient.
 
 **ChangeKit is a work in progress tool, and should not be deployed in production until specified in this README.**
 
 ChangeKit requires the `mysql` library. To initialize ChangeKit, simply:
 ```javascript
const changekit = require("changekit")({
    mysqlDatabase: database
});
```

From here, whenever a data request is made, ChangeKit should be queried to see if the client's cached data is outdated. Using `express` would look like this:
```javascript
// Listen for localhost:3000/home/v1/get
app.get("/home/v1/get", function(req, res) {
    // If you have a resource that is frequently accessed, consider caching it
    changekit.stubForResource("home").then((stub) => {
        // If there is no update required, inform the client 
        if (!changekit.shouldUpdate(req, stub)) {
          res.status(200).json({updateRequired: false})
          return
        }

        // Now load data that is used to power this endpoint
        res.status(200).json({updateRequired: true})
    })
});
```  

If you aren't using `express`, there will be an alternative method for you to call soon.

Again, this is a work in progress tool, and it should not be deployed to production until specified in this README. Check back soon for updates.

Copyright © 2018 Jordan Osterberg. All rights reserved. Licensed under the MIT license.
