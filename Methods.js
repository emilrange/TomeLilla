/***
/* A container for all generic "global" functions
****/

module.exports = 
{
    getValue: function(dataString,start,end)
    {
        var x = dataString.indexOf(start)+start.length;
        var t = dataString.substr(x);
        return t.substr(0,t.indexOf(end));
    },

    getRest: function(dataString,start)
    {
        var x = dataString.indexOf(start)+start.length;
        return dataString.substr(x);
    }


}
