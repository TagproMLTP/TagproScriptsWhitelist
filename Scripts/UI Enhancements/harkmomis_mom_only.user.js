// ==UserScript==
// @name           HarkMomis Mom only
// @namespace      http://tagpro.gg/
// @version        1.0
// @include        http://tagpro-*.koalabeast.com:*
// @include        http://tangent.jukejuice.com:*
// @include        http://*.newcompte.fr:*
// @description    Change the sounds of tagpro to Hark and his Mom.
// @author         RonSpawnson, HarkMollis, Hark's Mom, Cyanide, Seconskin
// @reference      https://www.reddit.com/r/TagPro/wiki/api
// ==/UserScript==
 
 
  var customSounds = {
    'drop':           'https://a.clyp.it/5m5wbzoy.mp3',
    'friendlydrop':   'https://a.clyp.it/5m5wbzoy.mp3',
    'cheering':       'https://a.clyp.it/5m5wbzoy.mp3',
    'sigh':           'https://a.clyp.it/5m5wbzoy.mp3',
    'burst':          'https://a.clyp.it/5m5wbzoy.mp3',
    'friendlyalert':  'https://a.clyp.it/5m5wbzoy.mp3',
    'alert':          'https://a.clyp.it/5m5wbzoy.mp3',
    'pop':            'https://a.clyp.it/5m5wbzoy.mp3',
    'click':          'https://a.clyp.it/5m5wbzoy.mp3',
    'explosion':      'https://a.clyp.it/5m5wbzoy.mp3',
  //'countdown':      'https://a.clyp.it/3jovmies.mp3',
  //'alertlong':      '',
  // 'go':             'https://a.clyp.it/1rklq1jz.mp3',
  //'degreeup':       '',
  //'teleport':       'https://a.clyp.it/euil2j42.mp3',
  //'burstOther':     '',
  //'powerup':        'https://a.clyp.it/bpp1mszq.mp3'
  };
 
  for (var snd in customSounds) {
    if (customSounds.hasOwnProperty(snd)) {
      var el = document.getElementById(snd);
      el.src = customSounds[snd];
      el.load();
    }
  }

  $("audio#countdown").get(0).src="https://a.clyp.it/5m5wbzoy.mp3";

tagpro.ready(function () {
 
    dropAudio = document.getElementById('powerup');  //Enemy FC returned
    dropAudio.src = 'https://a.clyp.it/5m5wbzoy.mp3';
    dropAudio.load();
   
    dropAudio2 = document.getElementById('teleport');  //Friendly FC returned
    dropAudio2.src = 'https://a.clyp.it/5m5wbzoy.mp3';
    dropAudio2.load();
   
    //dropAudio3 = document.getElementById('degreeup');  //Own team scores
    //dropAudio3.src = 'https://a.clyp.it/4asd25l4.mp3';
    //dropAudio3.load();
   
    dropAudio4 = document.getElementById('go');  //Other team scores
    dropAudio4.src = 'https://a.clyp.it/5m5wbzoy.mp3';
    dropAudio4.load();
   
    dropAudio5 = document.getElementById('countdown');  
    dropAudio5.src = 'https://a.clyp.it/5m5wbzoy.mp3';
    dropAudio5.load();
   
    //dropAudio6 = document.getElementById('alertlong');  //Enemy flag is grabbed
    //dropAudio6.src = 'https://a.clyp.it/ckqz0rbk.mp3';
    //dropAudio6.load();
 
   
})