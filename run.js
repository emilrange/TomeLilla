var net = require('net');
var fs = require('fs');
Irc = require('./Irc');
User = require('./User');
Methods = require('./Methods');
Xmpp = require('./Xmpp');
Instance = require('./Instance');


/*loads config file. should look something like this: {'host':'<address of host>','port':<port>,'xmpp_host':'<adress of your xmpp host>','xmpp_port':<port>}*/
var config = false;
fs.readFile("config",{encoding: 'utf-8'}, function(err,data){
    config = eval("("+data+")");
});
fs = false;

debug = false;

var cid = 1;

var server = net.createServer(function(socket){
    var xmppSocket = socket
    var instance = new Instance(xmppSocket,cid,config);
    xmppSocket.on('data',function(data){instance.sendXmppSocketData(data);});
    cid++;
});

setTimeout( function(){  server.listen(config.xmpp_port,config.xmpp_host); },1000);
