# 21Days App

### ★★★ Form better habits in 21 days ★★★

[http://ipo48.org/project.php?id=563](http://ipo48.org/project.php?id=563)

## What is this?

* frontend: HTML5 + javascript app powered by [backbone.js](http://documentcloud.github.com/backbone)
* backend: [couchdb app](http://guide.couchdb.org/editions/1/en/standalone.html)

## Local Development

* brew install couchdb
* brew install nginx
* put 127.0.0.1 dev.21dayshabit.com into /etc/hosts 
* configure nginx and dev.21dayshabit.com as vhost acording to [http://code.btbytes.com/2011/02/03/configuring_couchapp_with_nginx.html](http://code.btbytes.com/2011/02/03/configuring_couchapp_with_nginx.html)
* go to dev.21dayshabit.com (21dayshabit.com domain is important for facebook js library)

## Deployment

* couchdb app
* nginx as reverse proxy (or use anything you want)

[http://code.btbytes.com/2011/02/03/configuring_couchapp_with_nginx.html](http://code.btbytes.com/2011/02/03/configuring_couchapp_with_nginx.html)

## Live version

[21dayshabit.com](http://21dayshabit.com)