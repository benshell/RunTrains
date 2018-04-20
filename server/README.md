# **RunTrains**: A Web Based DCC Train Control System

## RunTrains Server

This is the Node.js/Express based server, typically running on the same
computer or LAN as JMRI, which connects with JMRI through the JMRI JSON API.

## Configuration

Defaults are configured in `src/constants.js` and can be overridden using
environment variables:

* PORT = 8000
* MOCK_JMRI = false // useful when testing without JMRI available
* JMRI_HOST = 'localhost'
* JMRI_PORT = 12080
* JMRI_HEARTBEAT_INTERVAL = 10000
* CLIENT_URLS = 'http://localhost:3000,http://localhost:8000' // for CORS
* DEBUGGING = false // adds additional console logging

## Running as a background task

I only have instructions for this using Arch Linux with systemd; please help
(send me notes, or a PR) if you've done this on other platforms:

### Arch Linux

1.  Install Node and npm:<br>
    `sudo pacman -Sy`<br>
    `sudo pacman -S nodejs npm`

2.  Create a user and group:<br>
    `sudo useradd -mrU runtrains`

3.  Switch to the new user, so that permissions will be correct:<br>
    `sudo su - runtrains`

4.  Clone the repository (or download a ZIP):<br>
    `git clone https://github.com/benshell/RunTrains.git`

5.  Install npm packages:<br>
    `cd RunTrains/server`<br>
    `npm install`

6.  Run the server manually, just to be sure it's working:<br>
    `npm start`<br>

7.  Exit back to your primary user account (with sudo):<br>
    `exit`

8.  Create systemd service with the following contents:<br>
    `sudo nano /etc/systemd/system/runtrains.service` (or `vi`, etc)

```
[Service]
ExecStart=/bin/bash -c "/home/runtrains/RunTrains/server/node_modules/.bin/babel-node /home/runtrains/RunTrains/server/src/app.js >> /home/runtrains/runtrains.log 2>&1"
Restart=always
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=runtrains
User=runtrains
Group=runtrains
Environment=NODE_ENV=production CLIENT_URLS=http://localhost:3000,http://localhost:8000,https://EXTERNALDOMAIN

[Install]
WantedBy=multi-user.target
```

9.  Install and run service:<br>
    `sudo systemctl enable runtrains && systemctl start runtrains`

10. View status and logs to ensure everything is working:<br>
    `sudo tail -f /home/runtrains/runtrains.log`<br>
    `sudo systemctl status runtrains`<br>
    `sudo journalctl -u runtrains.service --since today`<br>
    Edit and reinstall service as necessary:<br>
    `sudo systemctl disable runtrains && systemctl enable runtrains && systemctl start runtrains`

11. Bonus tip: unrelated to RunTrains, for running JMRI on Arch Linux I found
    it helpful to add the JRMI user (probably my user account) to the `uucp`
    group as otherwise JMRI wasn't able to access my DCC system over USB:<br>
    `sudo usermod -a -G uucp MYUSER`

## Running a local server over SSL

If you want to run the client (throttle app) as a PWA, it will need to be
hosted over HTTPS. That part can be easy enough when using a tools like Surge
(e.g. https://YOURAPP.surge.sh). However if the client is hosted over HTTPS,
the browser will require that your backend server is accessed over HTTPS as
well. If you host the server locally (likely on the same computer as JMRI),
here is how you can access it from the Internet over HTTPS.

### Arch Linux

1.  Setup dynamic DNS to point to your home. You can do this from your router
    or using a service running on a local computer. It will also depend on
    your DNS host. There are lots of ways to achieve this. Ultimately you
    need a record like HOME.EXAMPLE.COM pointing to home IP address.

2.  Setup your local computer/server running this app with a static IP.

3.  Setup port forwarding on your home router to forward port 443 (https) to
    the local static IP of your server with a destination PORT of your choosing
    (something over 1000). I'll use 4430 for the remained of this guide.

4.  Install nginx:<br>
    `sudo pacman -Sy`<br>
    `sudo pacman -S nginx`

5.  Add SSL certificates. It's easy and free to use Let's Encrypt. Follow the
    instructions at https://certbot.eff.org/. You may need to temporarily
    setup your router to forward port 80 to port 80 on your server. Be sure to
    setup autorenewal, as Let's Encrypt certificates expire in 90 days. Make a
    note of where the certificate is installed, e.g.
    `/etc/letsencrypt/live/HOME.EXAMPLE.COM/`

6.  Edit the nginx config:<br>
    `sudo nano /etc/nginx/nginx.conf`<br>
    At the very bottom, add something like this:

```
stream {
    server {
        listen              4430;
        proxy_pass          $x;
        ssl_preread         on;
    }

    map $ssl_preread_server_name $x {
        HOME.EXAMPLE.COM runtrains_backend;
    }

    upstream runtrains_backend {
        server localhost:4431;
    }

    server {
        listen              4431 ssl;
        proxy_pass          localhost:8000;

        ssl_certificate     /etc/letsencrypt/live/HOME.EXAMPLE.COM/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/HOME.EXAMPLE.COM/privkey.pem;
        ssl_protocols       TLSv1 TLSv1.1 TLSv1.2;
        ssl_ciphers         HIGH:!aNULL:!MD5;
    }
}
```

This configuration supports multiple local services on HTTPS using name-based
routing. For example, perhaps you might want runtrains.YOURDOMAIN.COM as well
as securitycameras.YOURDOMAIN.COM. If you only need one service, you can
simplify this configuration as ssl_preread and the map won't be necessary.

7.  Test the config. If no errors, restart nginx:<br>
    `sudo nginx -t`<br>
    `sudo systemctl restart nginx.service`

## See also the README in the root folder: `../README.md`
