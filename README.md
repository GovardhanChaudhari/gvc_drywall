Drywall
=============

A website and user system for Node.js. What you create with Drywall is more important than Drywall. [See a bird's eye view.](http://jedireza.github.io/drywall/)

[![Dependency Status](https://david-dm.org/jedireza/drywall.svg?theme=shields.io)](https://david-dm.org/jedireza/drywall)
[![devDependency Status](https://david-dm.org/jedireza/drywall/dev-status.svg?theme=shields.io)](https://david-dm.org/jedireza/drywall#info=devDependencies)

Technology
------------

| On The Server | On The Client  | Development |
| ------------- | -------------- | ----------- |
| Express       | Bootstrap      | Grunt       |
| Jade          | Backbone.js    | Bower       |
| Mongoose      | jQuery         |             |
| Passport      | Underscore.js  |             |
| Async         | Font-Awesome   |             |
| EmailJS       | Moment.js      |             |

Live Demos
------------

| Platform                       | Username | Password |
| ------------------------------ | -------- | -------- |
| https://drywall.herokuapp.com/ | root     | h3r00t   |
| https://drywall.nodejitsu.com/ | root     | j1ts00t  |

__Note:__ The live demos have been modified so you cannot change the root user, the root user's linked Administrator role or the root Admin Group. This was done in order to keep the app ready to test at all times.

Requirements
------------

You need [Node.js](http://nodejs.org/download/) and [MongoDB](http://www.mongodb.org/downloads) installed and running.

We use [Grunt](http://gruntjs.com/) as our task runner. Get the CLI (command line interface).

```bash
$ npm install grunt-cli -g
```

We use [Bower](http://bower.io/) as our front-end package manager. Get the CLI (command line interface).

```bash
$ npm install bower -g
```

We use [`bcrypt`](https://github.com/ncb000gt/node.bcrypt.js) for hashing secrets. If you have issues during installation related to `bcrypt` then [refer to this wiki page](https://github.com/jedireza/drywall/wiki/bcrypt-Installation-Trouble).

Installation
------------

```bash
$ git clone git@github.com:jedireza/drywall.git && cd ./drywall
$ npm install && bower install
$ mv ./config.example.js ./config.js #set mongodb and email credentials
$ grunt
```

Setup
------------

You need a few records in the database to start using the user system.

Run these commands on mongo. __Obviously you should use your email address.__

```js
use drywall; //your mongo db name
```

```js
db.admingroups.insert({ _id: 'root', name: 'Root' });
db.admins.insert({ name: {first: 'Root', last: 'Admin', full: 'Root Admin'}, groups: ['root'] });
var rootAdmin = db.admins.findOne();
db.users.save({ username: 'root', isActive: 'yes', email: 'your@email.addy', roles: {admin: rootAdmin._id} });
var rootUser = db.users.findOne();
rootAdmin.user = { id: rootUser._id, name: rootUser.username };
db.admins.save(rootAdmin);
```

Now just use the reset password feature to set a password.

 - `http://localhost:3000/login/forgot/`
 - Submit your email address and wait a second.
 - Go check your email and get the reset link.
 - `http://localhost:3000/login/reset/:email/:token/`
 - Set a new password.

Login. Customize. Enjoy.

Philosophy
------------

 - Create a website and user system.
 - Write code in a simple and consistent way.
 - Only create minor utilities or plugins to avoid repetitiveness.
 - Find and use good tools.
 - Use tools in their native/default behavior.

Features
------------

 - Basic front end web pages.
 - Contact page has form to email.
 - Login system with forgot password and reset password.
 - Signup and Login with Facebook, Twitter, GitHub, Google and Tumblr.
 - Optional email verification during signup flow.
 - User system with separate account and admin roles.
 - Admin groups with shared permission settings.
 - Administrator level permissions that override group permissions.
 - Global admin quick search component.

Contributing
------------

Contributions welcome. Make sure your code passes `grunt lint` without error.

If you're changing something non-trivial or user-facing, you may want to submit an issue first.

License
------------

MIT

[![githalytics.com alpha](https://cruel-carlota.pagodabox.com/d41f60f22a2148e2e2dc6b705cd01481 "githalytics.com")](http://githalytics.com/jedireza/drywall)

Docs
----

Date created this doc: 3/9/2014(DD/MM/YYYY)

- TODOS
    - Create separate dir for controller code and move files.
    - Rename controller files according to model name
    - Move hardcoded values to config.js
    - Create template files for reusable view code, also use jade mixin wherever possible
    - Create proper for for creating new entity
    
    - Features
        - Decide witch client side view technology is best(current is backbonejs )
        - Create scaffold code generator
            - default routes
            - controller
            - model
            - views
                - CRUD

- Notes
    - Web framework used is express
    - View is implemented with jade template engine for server side and backbonejs for client side 
    
- Adding new entity (model,view,controller,routing)    
    
    - Routing
        - /config.js
            - Add model name in models collection
            - Add routing urls
                -Eg. entryUrl:"/entries"
        - /routes.js
            - Add routes for get,post,put,delete (CRUD)
                - Eg. app.get(app.config.urls.entryUrl, require('./views/entry/index').find);
            - Read action
                - Read single record
                - Read record collection
    
    - Model
        - /schema/<ModelName.js>
            - Add a schema variable
            - Add required attribute names, types and constraints
            - Add required associations
            - Add required instance and static functions
            - Add required plugin
            - Add indexing for required attributes
            - Set this schema model to app variable for global access
    
    - View
        - Server Side
            - path of root view folder is /views (this path is configurable)
            - Create dir with name of model in small case. Eg. for model with name 'Entry', dir name should be 'entry'
                - Create index.jade and details.jade template files
                - Also extend above template file with appropriate layout template files (/layouts)
                    - Eg. extends ../../layouts/account
            
            
        
        - Client Side
        
    - Controller
        - Currently controller file is created in /views<model name> directory with file name 'index.js' (this file should
         be moved to separate dir with name 'controllers/<model name>')
