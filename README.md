Read LICENSE (you find it in root of this repo)

# TomeLilla
XMPP-Server to be run by NodeJS to work as a tunnel to a IRC-server.
Now it get contacts from defined channels that you can PM to.

## Run
Run run.js with nodeJs. Note that this will set up a server.

## Config
Config should contain a JSON with these fields and values.
* host (irc host)
* port (irc port)
* channels: (array of irc channels to get contacts from (that need to start with an #))
* xmpp_host: (accept connections on specified host)
* xmpp_port: (accept connections on specified port)

