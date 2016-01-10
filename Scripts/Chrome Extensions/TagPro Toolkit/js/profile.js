var twins = $('table.board:first tbody tr:nth-child(5) td:nth-child(4)').text();
var needed = 0;
var hhmmss=$('table.board:first tbody tr:nth-child(4) td:nth-child(7)').text().split(':');
var timeneeded=((+hhmmss[0]) * 60 * 60 + (+hhmmss[1]) * 60 + (+hhmmss[2]))/(3600*$('table.board:first tbody tr:nth-child(4) td:nth-child(4)').text()); 
if (timeneeded<36000 || isNaN(timeneeded)) {
    hhmmss=$('table.board:first tbody tr:nth-child(5) td:nth-child(7)').text().split(':');
    timeneeded=((+hhmmss[0]) * 60 * 60 + (+hhmmss[1]) * 60 + (+hhmmss[2]))/(3600*twins); 
}
var neededscores=[];
if (twins<13){
    needed = 13-twins;
    $( "td:contains('Bacon (')" ).next().append(needed+' wins.');
    var timeneededmath=Math.round(timeneeded*needed);
    $( "td:contains('Bacon (')" ).next().next().append(timeneededmath+' hours.');
}
if (twins<32){
    needed = 32-twins;
    $( "td:contains('Moon (')" ).next().append(needed+' wins.');
    var timeneededmath=Math.round(timeneeded*needed);
    $( "td:contains('Moon (')" ).next().next().append(timeneededmath+' hours.');
}
if (twins<225){
    needed = 225-twins;
    $( "td:contains('Freezing (')" ).next().append(needed+' wins.');
    var timeneededmath=Math.round(timeneeded*needed);
    $( "td:contains('Freezing (')" ).next().next().append(timeneededmath+' hours.');
}
if (twins<407){
    needed = 407-twins;
    $( "td:contains('Dolphin (')" ).next().append(needed+' wins.');
    var timeneededmath=Math.round(timeneeded*needed);
    $( "td:contains('Dolphin (')" ).next().next().append(timeneededmath+' hours.');
}
if (twins<631){
    needed = 631-twins;
    $( "td:contains('Alien (')" ).next().append(needed+' wins.');
    var timeneededmath=Math.round(timeneeded*needed);
    $( "td:contains('Alien (')" ).next().next().append(timeneededmath+' hours.');
}
if (twins<1128){
    needed = 1128-twins;
    $( "td:contains('Sign (')" ).next().append(needed+' wins.');
    var timeneededmath=Math.round(timeneeded*needed);
    $( "td:contains('Sign (')" ).next().next().append(timeneededmath+' hours.');
}
if (twins<1246){
    needed = 1246-twins;
    $( "td:contains('Peace (')" ).next().append(needed+' wins.');
    var timeneededmath=Math.round(timeneeded*needed);
    $( "td:contains('Peace (')" ).next().next().append(timeneededmath+' hours.');
}
if (twins<2108){
    needed = 2108-twins;
    $( "td:contains('Flux')" ).next().append(needed+' wins.');
    var timeneededmath=Math.round(timeneeded*needed);
    $( "td:contains('Flux')" ).next().next().append(timeneededmath+' hours.');
}
if (twins<2631){
    needed = 2631-twins;
    $( "td:contains('Microphone (')" ).next().append(needed+' wins.');
    var timeneededmath=Math.round(timeneeded*needed);
    $( "td:contains('Microphone (')" ).next().next().append(timeneededmath+' hours.');
}
if (twins<2740){
    needed = 2740-twins;
    $( "td:contains('Boiling (')" ).next().append(needed+' wins.');
    var timeneededmath=Math.round(timeneeded*needed);
    $( "td:contains('Boiling (')" ).next().next().append(timeneededmath+' hours.');
}
if (twins<2796){
    needed = 2796-twins;
    $( "td:contains('Dalmatians (')" ).next().append(needed+' wins.');
    var timeneededmath=Math.round(timeneeded*needed);
    $( "td:contains('Dalmatians (')" ).next().next().append(timeneededmath+' hours.');
}
if (twins<4087){
    needed = 4087-twins;
    $( "td:contains('ABC (')" ).next().append(needed+' wins.');
    var timeneededmath=Math.round(timeneeded*needed);
    $( "td:contains('ABC (')" ).next().next().append(timeneededmath+' hours.');
}
if (twins<5352){
    needed = 5352-twins;
    $( "td:contains('Love (')" ).next().append(needed+' wins.');
    var timeneededmath=Math.round(timeneeded*needed);
    $( "td:contains('Love (')" ).next().next().append(timeneededmath+' hours.');
}
if (twins<5874){
    needed = 5874-twins;
    $( "td:contains('Pokemon (')" ).next().append(needed+' wins.');
    var timeneededmath=Math.round(timeneeded*needed);
    $( "td:contains('Pokemon (')" ).next().next().append(timeneededmath+' hours.');
}
if (twins<6603){
    needed = 6603-twins;
    $( "td:contains('Phi (')" ).next().append(needed+' wins.');
    var timeneededmath=Math.round(timeneeded*needed);
    $( "td:contains('Phi (')" ).next().next().append(timeneededmath+' hours.');
}
if (twins<7814){
    needed = 7814-twins;
    $( "td:contains('U Turn (')" ).next().append(needed+' wins.');
    var timeneededmath=Math.round(timeneeded*needed);
    $( "td:contains('U Turn (')" ).next().next().append(timeneededmath+' hours.');
}
if (twins<8903){
    needed = 8903-twins;
    $( "td:contains('World')" ).next().append(needed+' wins.');
    var timeneededmath=Math.round(timeneeded*needed);
    $( "td:contains('World')" ).next().next().append(timeneededmath+' hours.');
}
if (twins<16093){
    needed = 16093-twins;
    $( "td:contains('Bowling (')" ).next().append(needed+' wins.');
    var timeneededmath=Math.round(timeneeded*needed);
    $( "td:contains('Bowling (')" ).next().next().append(timeneededmath+' hours.');
}
if (twins<17065){
    needed = 17065-twins;
    $( "td:contains('Pi (')" ).next().append(needed+' wins.');
    var timeneededmath=Math.round(timeneeded*needed);
    $( "td:contains('Pi (')" ).next().next().append(timeneededmath+' hours.');
}

