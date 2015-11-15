// ==UserScript==
// @name         Linker
// @author       Tangent (Idea from TaylorK)
// @description  Creates links from link text
// @include      *newcompte.fr:*
// @include      tagpro-*.koalabeast.com:*
// @include      *tagpro-*.koalabeast.com/groups*
// ==/UserScript==

tagpro.ready(function() {
    if (tagpro.group.socket && tagpro.group.socket.playerLocation == "page")
    {
        tagpro.group.socket.on('chat', function (message) {
        var startind=message.message.indexOf("http://");
        if(startind<0)
        {
            startind=message.message.indexOf("https://");
        }
        var endind=0;
        if(startind>-1)
        {
            if(message.message.indexOf(" ",startind)>-1)
            {
                endind=message.message.indexOf(" ",startind);
            }
            else
            {
                endind=message.message.length;
            }
            var pre=document.getElementById("chat");
            var childrenno=pre.children;
            var childrennum=0;
            for(var p=0;p<pre.children.length;p++)
            {
                if(childrenno[p].innerHTML.indexOf(message.message)>0)
                {
                    childrennum=p;
                }
            }
            var tempmess=message.message.substring(startind,endind);
            var fullmess=childrenno[childrennum].innerHTML;
            var posthtml=fullmess.substring(0,fullmess.lastIndexOf(message.message))+message.message.substring(0,startind)+"<a href=\""+tempmess+"\" style=\" color: cyan\" target=\"_blank\"><u>"+tempmess+"</u></a>"+message.message.substring(endind,message.message.length)+fullmess.substring(fullmess.lastIndexOf(message.message)+message.message.length,fullmess.length);
            document.getElementById("chat").children[childrennum].innerHTML=posthtml;
        }    
        });
    }
    else
    {
    tagpro.socket.on('chat', function (message) {
        var startind=message.message.indexOf("http://");
        if(startind<0)
        {
            startind=message.message.indexOf("https://");
        }
        var endind=0;
        if(startind>-1)
        {
            if(message.message.indexOf(" ",startind)>-1)
            {
                endind=message.message.indexOf(" ",startind);
            }
            else
            {
                endind=message.message.length;
            }
            var pre=document.getElementById("chatHistory");
            var childrenno=pre.children;
            var childrennum=0;
            for(var p=0;p<pre.children.length;p++)
            {
                if(childrenno[p].innerHTML.indexOf(message.message)>0)
                {
                    childrennum=p;
                }
            }
            var tempmess=message.message.substring(startind,endind);
            var fullmess=childrenno[childrennum].innerHTML;
            var posthtml=fullmess.substring(0,fullmess.lastIndexOf(message.message))+message.message.substring(0,startind)+"<a href=\""+tempmess+"\" style=\" color: cyan\" target=\"_blank\">"+tempmess+"</a>"+message.message.substring(endind,message.message.length)+fullmess.substring(fullmess.lastIndexOf(message.message)+message.message.length,fullmess.length);
            document.getElementById("chatHistory").children[childrennum].innerHTML=posthtml;
        }
    });
    }
});