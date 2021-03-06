
/****
/* A Xmpp class that handles input data (from should be a xmpp client). 
/* Example is get a message from client and redirect to to irc connection it is bind to OR authorize a login.
/* It sends roster to xmpp client if requested/called
/*   @instance, The instance this xmpp object is bind to. the instance should have what irc object this xmpp is bind to.
*/

//TODO: escape values being used so no value can "break" the xml
 
module.exports = function(instance)
{
    this.instance = instance,

    this.getUniqueId = function()
    {
        //TODO: keep track of what values been sent to not same be sent twice. Also keep track of incoming id values generated by client.
        return "q"+Math.floor(Math.random()*7000+1000);
    }

    this.sendMessage = function(from,message)
    {
       var xmppServer = "localhost";
        var userName = this.instance.userName;
        var messageXml = "<message to='"+userName+"@"+xmppServer+"' from='"+from+"@"+xmppServer+"'>"+
                         "<body>"+message+"</body></message>"
        this.client.write(messageXml);
    }

    this.updateRosterAndPresence = function()
    {
        var userName = this.instance.userName;
        var userList = this.instance.contactList;
        var xmppServer = "localhost";
        var client = this.client; 
        var id = this.getUniqueId();
        var respons = '<iq type="result" id="'+id+'">'+
                      '<query xmlns="jabber:iq:roster">';
                      for(var i=0; i<userList.length; i++)
                      {
                          var user = userList[i];
                          respons += '<item jid="'+user.userName+'@'+xmppServer+'" name="'+user.userName+
                                     '" subscription="both"/>';
                      }
                      respons += '</query>'+'</iq>';

        client.write(respons);
        respons = "";
        for(var i=0; i<userList.length; i++)
        {
            var user = userList[i];
            if(user.online)
            {
                respons += '<presence from="'+user.userName+'@'+xmppServer+'">" to="'+userName+'@'+xmppServer+'">'+
                           '<show>chat</show><status>'+user.userStatus+'</status></presence>';
            }
            else
            {
                respons += '<presence from="'+user.userName+'@'+xmppServer+'" to="'+userName+'@'+xmppServer+'" '+
                           'type="unavailable"/>';
            }
        }
        client.write(respons);
    }

    this.getData = function(data)
    {
        var xmppServer = "localhost";
        var features = '<stream:features><mechanisms xmlns="">'+
                       '<mechanism>PLAIN</mechanism><required/></mechanisms></stream:features>';
        var features2 = '<stream:features><bind xmlns="urn:ietf:params:xml:ns:xmpp-bind">'+
                        '<session xmlns="urn:ietf:params:xml:ns:xmpp-session"><optional/></session>'+
                        '<required/></bind></stream:features>';
        var dataString = ""+data;

        if(debug)
        {
            console.log("=========================== "+this.id);
            console.log(dataString);
            console.log("");
        }
        var client = this.client;
        /* First package of from xmpp client */
        if(dataString.indexOf("<stream:stream")!=-1 && !this.firstHeaderSent)
        {
            this.firstHeaderSent = true;
            client.write('<?xml version="1.0"?><stream:stream from="'+xmppServer+'" id="75678"'+
                         ' version="1.0" xmlns="jabber:client" xmlns:stream="http://etherx.jabber.org/streams">'+features);
 
        }

        /* Second package from xmpp client. Auth, we always accept because there are no accounts and passwords */
        else if(dataString.substr(0,5)=="<auth")
        {
            var tt = ""+new Buffer(Methods.getValue(dataString,">","</auth>"),'base64');
            var ff = tt.split('\0');
            this.instance.userName = ff[1];
            client.write('<success xmlns="urn:ietf:params:xml:ns:xmpp-sasl"/>');
            
        }
        else if(dataString.substr(0,14) == '<stream:stream')
        {
            client.write('<?xml version="1.0"?><stream:stream from="'+xmppServer+'" id="'+this.getUniqueId()+'" '+
                         'version="1.0" xmlns="jabber:client" xmlns:stream="http://etherx.jabber.org/streams">'+features2);
 
        }
        else if(dataString.substr(0,3)=="<iq" && dataString.indexOf("<bind")!=-1)
        {
            var userName = this.instance.userName;
            if(!userName) throw "No username defined here. weird"+dataString+"___"+this.id;
            clientId = dataString.substr(dataString.indexOf("id='")+4,14);
            client.write('<iq id="'+clientId+'" type="result"><bind xmlns="urn:ietf:params:xml:ns:xmpp-bind">'+
                         '<jid>'+userName+'@'+xmppServer+'</jid></bind></iq>');
        }
        else if(dataString.indexOf("<session")!=-1)
        {
            clientId = dataString.substr(dataString.indexOf("id='")+4,14);
            client.write('<iq id="'+clientId+'" type="result"/>');
            this.irc.start();
        }
        else if(dataString.indexOf("<query xmln")!=-1)
        {
            clientId = dataString.substr(dataString.indexOf("id='")+4,14);
            var respons = '<iq from="'+xmppServer+'" id="'+clientId+'" type="result"><query/></iq>';
            client.write(respons);
        }
        else if(dataString.substr(0,21)=="<message type='chat' ")
        {
            var nick = Methods.getValue(dataString,"to='","@");   
            var message = Methods.getValue(dataString,"<body>","</body>");
            this.irc.sendMessage(nick,message);
        }
        else 
        {
            //unhandled dataString from xmpp client. What could it be?
            console.log(dataString);
        }
    }
}
