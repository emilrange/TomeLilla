var net = require('net');
var Methods = require('./Methods');
var User = require('./User');

/****
/* A Irc class that handles input data (from the instance it was created in and that data should have come from an xmpp client). 
*/

module.exports = function()
{
    
    this.checkThese = false;

    this.isNAMREPLY = function(data)
    {
        data = ""+data;
        var t = data.split(" ");
        return t[1]==353; 
    };

    this.checkOnlineStatus = function()
    {
       var nickList = "";
       if(this.checkThese!==false)
       {
           //console.log(this);
           //throw "";
       }
       this.checkThese = Array();
       for(var i=0; i<this.instance.contactList.length; i++)
       {
           nickList += this.instance.contactList[i].userName+" ";
           this.checkThese.push(this.instance.contactList[i].userName); 
       }
       if(nickList=="")return;
       var str = "ISON "+nickList+"\r\n";
       str = str.substr(0,str.length-1);
       this.send(str);
    };

    this.send = function(data)
    {
       console.log(">"+data);
       this.dcConnection.write(data);
    };

    this.isRPLISON = function(data)
    {
        data = ""+data;
        var t = data.split(" ");
        return t[1]==303; 
    };

    this.decodeNAMREPLY = function(data,ignore)
    {
        var a = data.split(" ");       
        var channel = a[4];

        data = data.substr(1); 
        data = data.substr(data.indexOf(":")+1);
        var nickList = data.split(" ");
        var rNickList = new Array();
        for(var i=0; i<nickList.length; i++)
        {
            if(ignore.indexOf(nickList[i])==-1)
                rNickList.push( ( nickList[i].substr(0,1)=="@" ? nickList[i].substr(1) : nickList[i] ) );
        }
        var o = new Object();
        o.nickList = rNickList;
        o.channel = channel;
        return o;
    };

    this.decodePRIVMSG = function(data)
    {
        var nick = Methods.getValue(data,": ","!");
        data = data.substr(data.indexOf("PRIVMSG"));
        msg = data.substr(data.indexOf(":")+1);
        var rmsg = new Object();
        rmsg.nick = nick;
        rmsg.msg = msg;
        return rmsg;
    };

    this.decodeRPLISON = function(data)
    {
        data = data.substr(1); 
        data = data.substr(data.indexOf(":")+1);

        var nickList = data.split(" ");
        var rNickList = new Array();
        for(var i=0; i<nickList.length; i++)
        {
            rNickList.push( ( nickList[i].substr(0,1)=="@" ? nickList[i].substr(1) : nickList[i] ) );
        }
        return rNickList;
    };

    this.start = function()
    {
        this.hasJoined = false;
        var userName = this.instance.userName;
        var host = this.config.host;
        var port = this.config.port;
        if(!host) throw "host can not be false";
        if(!port) throw "port can not be false";
        dcConnection = new net.Socket();
        dcConnection.connect(port,host,function(){});
        var dc = this;
        dcConnection.on('data',function(data){
            dc.handleData(""+data);
        });
        this.dcConnection = dcConnection;
        var instance = this.instance;
        checkOnlineStatus = this.checkOnlineStatus;
        irc = this;
        setInterval(function(){irc.checkOnlineStatus();},10000);
    };

    this.sendMessage = function(who, message)
    {
        var from = this.instance.userName;
        var send = "PRIVMSG "+who+" :"+message+"\r\n";  //TODO: escape
        console.log(send);
        this.dcConnection.write(send);
    };

    this.handleData = function(data)
    {
        console.log(">"+data);

        var ds = ""+data;

        if(!this.hasJoined)
        {
            this.hasJoined = true;
            var t = "NICK "+this.instance.userName+"\r\n";
            this.dcConnection.write(t);

            var t = "USER "+this.instance.userName+" 0 * :"+this.instance.userName+"\r\n";
            this.dcConnection.write(t);

            for(var i=0; i<this.config.channels.length; i++)
            {
                var t = "JOIN "+this.config.channels[i]+"\r\n";
                this.dcConnection.write(t);
            }
       }

        var ff = data.split("\r\n"); 
        for(i=0; i<ff.length; i++)
            this.handle(ff[i]);
    },

    this.handle = function(dataString)
    {
       var ds = ""+dataString;
       if(ds.substr(0,1)==":" && ds.indexOf("PRIVMSG")!=-1)
       {
           var o = this.decodePRIVMSG(ds);
           this.instance.xmpp.sendMessage(o.nick,o.msg);
       }
 
       if(ds.substr(0,4)=="PING")
       {
           var ff = ds.split(' ');
           var pingvalue = ff[1];
           var t = "PONG "+pingvalue+"\r\n";
           console.log(t) 
           this.dcConnection.write(t);
            
       }

       if(this.isRPLISON(ds))
       {
           var nicks = this.decodeRPLISON(ds);

           for(var i=0; i<this.checkThese.length; i++)
           {
               var checkNick = this.checkThese[i];
               if(nicks.indexOf(checkNick)==-1)
               {
                   for(var t=0; t<this.instance.contactList.length; t++)
                   {
                       if(this.instance.contactList[t].userName == checkNick)
                       {
                           this.instance.contactList[t].online = false;
                       }

                   }
               }
               else
               {
                   for(var t=0; t<this.instance.contactList.length; t++)
                   {
                       if(this.instance.contactList[t].userName == checkNick)
                       {
                           this.instance.contactList[t].online = true;
                       }
                   }
               }
           }
           this.xmpp.updateRosterAndPresence();
           this.checkThese = false;
       }
 
       if(this.isNAMREPLY(ds))
       {
           var f = this.decodeNAMREPLY(ds,Array(this.instance.userName));
           for(i=0; i<f.nickList.length; i++)
           {
               this.instance.contactList.push(new User(f.nickList[i],"xa",""));
           }
           this.dcConnection.write("PART "+f.channel+"\r\n");
           this.xmpp.updateRosterAndPresence();
       }
    }

}
