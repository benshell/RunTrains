# **RunTrains**: A Web Based DCC Train Control System

RunTrains is a technology stack for running model trains, using a web server
application and a single-page web app / PWA that can be used on a mobile phone
or tablet.

### This is an alternative to the JMRI `WiThrottle` and `Engine Driver` apps.

This system was was built to work with JMRI, which would be interfaced with a
DCC command station. However this project is not in any way affliated with the
JMRI project or JMRI community. You can learn more about JMRI and download it
from <http://jmri.sourceforge.net/>.

## Technology Overview

There are three building blocks in this solution:

1.  **RunTrains Web App**: A React based client app, which can run directly
    on your local network, likely the same computer running JMRI and the
    RunTrains Server, or it can run from a static web host and connect in to
    your system over the Internet.

1.  **RunTrains Server**: A Node.js based server, typically running on the same
    computer or LAN as JMRI, which connects with JMRI through the JMRI JSON API.
    If remote access to running trains is desired,you will need to forward the
    appropriate port in your router, and if you to want to run the web app as a
    PWA then you will need to use HTTPS. You can get a free SSL certificate
    from Let's Encrypt, and use Nginx to handle SSL termination and stream
    proxying.

1.  **JMRI**: The Java Model Railroad Interface software is still necessary to
    connect to your DCC command station. JMRI throttles and apps can still
    be used as well.

Other technology details:

The server app is based on Express.js, using Babel to support ES6. The core
functionality of the server is state management, using Redux. Redux is most
often used on the client side, especially with React, but works great here as
well. The server uses Apollo Server to provide a GraphQL API, including GraphQL
Subscriptions for real-time updates. The server also a maintains a WebSocket
connections to JMRI's JSON API, and uses polling to re-establish the connection
if it is lost.

The client app was built using
[Create React App](https://github.com/facebookincubator/create-react-app). It
also uses Apollo Client for GraphQL communications with the server, Storybook
for component testing, and Prettier for automatic code formatting.

## History

I'm a software architect, focused on modern web technologies. And I'm a model
railroader, with a G-scale backyard garden railway. In the past I used JMRI
with WiThrottle for iPhone and Engine Driver for Android. But both have proven
to be unreliable for my unique needs. My backyard garden is too spread out for
solid coverage with a single 5GHz wireless access access point, and 2.4GHz is
too congested in my neighborhood. Unfortunately the JMRI WiThrottle API and/or
these JMRI apps is prone to failure during handoff between access points, and
I find I'm often losing control over the trains. Often I even need to exit the
app and restart, reconfiguring the current trains (consists) when I open it
again. I finally decided to do something about it, and I've written a new
throttle app and server component that currently connects to JMRI, but is
written in such a way that JMRI could be eliminated with a direct connection to
the layout control bus (in my case, MERG CBUS).

## Advantages

1.  Network interruptions have no affect over currently operating trains.
    (I've had plenty of embarrassing moments showing off my railroad and
    the train suddenly stops... not because it hit something, or lost power,
    but because my iPhone went to sleep.

1.  When the web app is opened, all currently operating trains are available
    and kept in sync between operators. There is no handoff of a throttle,
    although in the future a permissions system is planned to limit guest
    access. (Now, during a full-day ops session, I can put one device on the
    charger and seemlessly switch to another.)

1.  There is no difference between a single locomotive and a consist once the
    train configuration has been set up. Wireless packet loss could not cause
    once locomotive to perform differently than another. The server handles
    taking a single speed/direction command and sending it to each individual
    unit via JMRI, flipping the direction if a unit is configured to be
    reversed. (Consisting seems to work well with `Engine Driver`, but it seems
    very glitchy with `WiThrottle` for iPhone).

1.  The app can be used cross platform from any device, either directly via the
    web browser or as a PWA (progressive web app) in Android or iOS 11.3+.

## Risks

The #1 risk is the same as the #1 advantage:

1.  Network interruptions have no affect over currently operating trains. This
    means there is no failsafe. If connection is lost, it may be difficult to get
    the trains to safely come to a stop. Be prepared to pull the system power as a
    worst-case scenario. (If others are interested, this feature could be
    added. In my case, the network never seems to be truly lost, just interrupted
    long enough to break the JMRI WebSocket connection.)

## Running the project

First you will need to install Node.js. This varies by operating system, so Google
for the instructions for your platform.

Then run:

`npm install`

You can run both the server and client from this root directory:

### `npm start`

If you wish to make any configuration changes or run the server and web
throttle separately, you'll need to go into the `server` and `client` folders
and configure/run/build per their individual READMEs.

## Roadmap

I have a lot of ideas for the future:

1.  The very next step is to add authentication. This is both for security
    (when running in a way that the system is open to the Internet) and so that
    individual devices can be distinguished from one another.

1.  Use roles to limit the controls for certain devices, to the point where
    there is a simplified child-friendly interface that can run one train, at a
    maximum speed set by an admin.

1.  Basic automation: Although I don't need this app to even come close to
    what JMRI can do, I'd like to add some basic timer or trigger-based
    automation. Most basic of all, I'd like to be able to arm/disarm an
    automatic whistle/horn that would blow every 3 minutes (configurable), just
    to keep guests entertained.

1.  Routing / turnout control: This is personally a lower priority as none of
    my switches are powered (currently), but this is definitely something I'd
    like to have in the future (PRs welcome).

## Contact / Contributing

I built this for myself but hope others find it useful as well. I would love to
hear from you if this project interests you in any way. Needless to say, I also
welcome GitHub issues and pull requests. I would also be happy to try and help
you get things running, while also working to improve the documentation.

Ben Shell<br>
@benshell (GitHub, Twitter)<br>
http://www.benshell.com/
