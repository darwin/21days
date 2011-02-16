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

#### My nginx local config

        worker_processes  1;

        events {
            worker_connections  1024;
        }

        http {
            include       mime.types;
            default_type  application/octet-stream;
            sendfile        on;
            keepalive_timeout  65;

            server { 
                access_log off;
                listen 80;
                server_name dev.21dayshabit.com;

                location /daysdb {
                       proxy_pass http://localhost:5984;
                       proxy_redirect off;
                       proxy_set_header Host $host;
                       proxy_set_header X-Real-IP $remote_addr;
                       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                }
        
                location / {
                       proxy_pass http://localhost:5984/daysdb/_design/21days/;
                       proxy_redirect off;
                       proxy_set_header Host $host;
                       proxy_set_header X-Real-IP $remote_addr;
                       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                }

            }
        }


## Deployment

[cloudant.com](cloudant.com) is cool! is all you need to do is:

    cd app
    couchapp push cloudant

see also
   
   * .couchapprc
   * rewrites.json
   
## Admin

tomikk.cloudant.com

user:tomikk
pass:antonin

## Live version

[www.21dayshabit.com](http://www.21dayshabit.com)