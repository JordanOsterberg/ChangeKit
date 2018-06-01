# ChangeKit  ![version](https://img.shields.io/badge/version-1.0.9-red.svg)
 ChangeKit is a simple framework that integrates with your iOS and Android apps, along with your server, to make data usage efficient.
 
 **ChangeKit is a work in progress tool, and should not be deployed in production until specified in this README.**
 
 ChangeKit requires the `mysql` library. To initialize ChangeKit, simply:
 ```javascript
const changekit = require("changekit")({
    mysqlDatabase: database
});
```

The configuration object can use these properties:
* mysqlDatabase - The MySQL database that holds ChangeKit's data
* useExpress - Whether or not ChangeKit should use the `express` library for requests 

## Express Example

Whenever a data request is made, ChangeKit should be queried to see if the client's cached data is outdated. Using `express` integration would look like this:
```javascript
// Listen for localhost:3000/home/v1/get
app.get("/home/v1/get", function(req, res) {
    // Generally speaking, saving the stub in a variable that can be accessed later and in future subsequent requests is a good idea
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

## Other Example

If you aren't using express or need to use ChangeKit for more general purpose uses, the flow is very similar.
```javascript

let homeStub;

// Load the home stub and save it in the homeStub variable

changekit.stubForResource("home").then((stub) => {
    homeStub = stub; 
});

// ...
// Some time later, when ChangeKit needs to be queried 

if (!changekit.shouldUpdate(clientStubValue, homeStub)) {
    // Inform your client that no update is required
    return
}

```  

To reiterate, this is a work in progress tool, and it should not be deployed to production until specified in this README. Check back soon for updates.

Copyright © 2018 Jordan Osterberg. All rights reserved. Licensed under the MIT license.
