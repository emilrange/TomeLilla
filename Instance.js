
/*********
/* An Instance is a object that binds a xmpp connection to a irc object (that later should being connected to irc server if xmpp object calls for it).
/* The xmpp connection should be established before create this Instance. The xmpp connection (or socket) is sent as paramter in constructor.
/* It also contain a list of contacts. (this list is mostly controlled by irc and and being sent to xmpp when updated)
/*  Params:
       @xmppSocket, A socket where xmpp instance on server sends data to its client
       @cid,        A id that should be unique for every instance. using for debug reason to check more easy keep track of different instances
       @config,     The config object
*********/

module.exports = function(xmppSocket,cid,config)
{
    this.xmpp = new Xmpp(this);
    this.xmpp.id = cid;
    this.xmpp.client = xmppSocket;
    this.irc = new Irc();
    this.irc.config = config;
    this.irc.instance = this;
    this.contactList = new Array();
    this.xmpp.irc = this.irc;
    this.irc.xmpp = this.xmpp;
    var xmpp = this.xmpp;

    //Call this function
    this.sendXmppSocketData = function(data)
    {
        xmpp.getData(data);
    }

    var contactList = this.contactList;
}
