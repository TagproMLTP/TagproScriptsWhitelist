// ==UserScript==
// @name      Polite Text
// @updateURL https://raw.githubusercontent.com/WitchTP/Tagpro-Userscripts/master/politeText.js
// @version   1.4b6
// @include   http://tagpro-*.koalabeast.com:*
// @include   http://tangent.jukejuice.com:*
// @include   http://maptest*.newcompte.fr:*
// @author    Witch
// ==/UserScript==

/*
 * Left-hand side of the map must be lowercase and without spaces or punctuation.
 * Right-hand side can be anything you want, but make sure that the syntax is valid.
 */

var politeMap = {
    'fuck': 'love',
    'fuk': 'love',
    'fucks': 'things',
    'fucked': 'messed',
    'fucking': 'loving',
    'fuckin': 'lovin',
    'fucken': 'lovin',
    'fuken': 'lovin',
    'fukin': 'lovin',
    'fak': 'love',
    'fook': 'love',
    'fookin': 'lovin',
    'fooking': 'loving',
    'fuc': 'love',
    'fucin': 'lovin',
    'fucing': 'loving',
    'feck': 'love',
    'feckin': 'lovin',
    'fecking': 'loving',
    'fk': '<3',
    'fck': 'love',
    'fckin': 'lovin',
    'fcking': 'loving',
    'fcken': 'lovin',
    'fken': 'lovin',
    'fckn': 'lovin',
    'fkn': 'lovin',
    'turd': 'cake',
    'turds': 'cakes',
    'shitting': 'hugging',
    'shit': 'sorry',
    'shat': 'apologized',
    'shits': 'sits',
    'shitface': 'pal',
    'shitfaced': 'happy',
    'bitch': 'lady',
    'bitches': 'ladies',
    'bitchy': 'lovely',
    'biatch': 'lady',
    'biatchs': 'ladies',
    'biatches': 'ladies',
    'hate': 'care about',
    'hates': 'cares about',
    'suck': 'win',
    'sucks': 'wins',
    'fucker': 'friend',
    'fuckers': 'friends',
    'nigger': 'juker',
    'niggers': 'jukers',
    'nig': 'juke',
    'nigs': 'jukes',
    'nigga':' juker',
    'niggas': 'jukers',
    'niggah': 'juker',
    'niggahs': 'jukers',
    'dick': 'bunny',
    'dicks': 'bunnies',
    'pussy': 'kitty',
    'puss': 'kitty',
    'pussies': 'kitties',
    'asshole': 'angel',
    'assholes': 'angels',
    'ass': 'posterior',
    'asses': 'posteriors',
    'gay': 'cool',
    'gays': 'cool people',
    'queer': 'cool',
    'queers': 'cool people',
    'fag': 'nice person',
    'fags': 'nice people',
    'faggot': 'nice person',
    'faggots': 'nice people',
    'fagit': 'nice person',
    'fagits': 'nice people',
    'fagtit': 'nice chest',
    'fagtits': 'nice chest',
    'fagot': 'nice person',
    'fagots': 'nice people',
    'fagott': 'nice person',
    'fagotts': 'nice people',
    'faggott': 'nice person',
    'faggotts': 'nice people',
    'faget': 'nice person',
    'fagets': 'nice people',
    'fagget': 'nice person',
    'faggets': 'nice people',
    'faggett': 'nice person',
    'faggetts': 'nice people',
    'fgt': 'nice person',
    'fgts': 'nice people',
    'fuckface': 'friend',
    'cunt': 'pro',
    'cunts': 'pros',
    'cuntface': 'buddy',
    'thundercunt': 'BFF',
    'motherfucker': 'pal',
    'motherfuckers': 'pals',
    'mofo': 'pal',
    'mofos': 'pals',
    'jew': 'buddy',
    'jews': 'buddies',
    'kike': 'friend',
    'gook': 'friend',
    'chink': 'friend',
    'bg': 'gg',
    'jewish': 'nice',
    'shithead': 'pal',
    'noob': 'newbie',
    'fucktard': 'fun person',
    'fucktards': 'fun people',
    'dicklicker': 'nice person',
    'dicklickers': 'nice people',
    'clit': 'bunny',
    'clits': 'bunnies',
    'stupid': 'smart',
    'moron': 'smart person',
    'morons': 'smart people',
    'idiot': 'smart person',
    'idiots': 'smart people',
    'dolt': 'smart person',
    'dolts': 'smart people',
    'dunce': 'smart person',
    'dunces': 'smart people',
    'retard': 'smart person',
    'retards': 'smart people',
    'retarded': 'smart',
    'loser': 'good sport',
    'losers': 'good sports',
    'tard': 'smart person',
    'tards': 'smart people',
    'insufferable': 'pretty',
    'douche': 'pal',
    'douchebag': 'companion',
    'douchecanoe': 'loveboat',
    'clitoris': 'bunny',
    'penis': 'bunny',
    'vagina': 'bunny',
    'penises': 'bunnies',
    'vaginas': 'bunnies',
    'vag': 'bunny',
    'slut': 'lovely person',
    'sluts': 'lovely people',
    'slutty': 'lovely',
    'whore': 'lady',
    'whores': 'ladies',
    'cancer': 'rich',
    'die': 'succeed',
    'dies': 'succeeds',
    'dumb': 'pretty',
    'anus': 'posterior',
    'crap': 'sorry',
    'crapped': 'apologized',
    'anal': 'charity',
    'piss': 'hug',
    'pisses': 'hugs',
    'wank': 'love',
    'wanker': 'friend',
    'wanking': 'loving',
    'wanks': 'loves',
    'poof': 'cool',
    'poofter': 'cool person',
    'poofters': 'cool people',
    'lesbian': 'cool',
    'lesbians': 'cool people',
    'lesbo': 'cool',
    'lesbos': 'cool people',
    'lesboes': 'cool people',
    'dyke': 'cool person',
    'dykes': 'cool people',
    'tranny': 'nice person',
    'scum': 'buddy',
    'scummy': 'beautiful',
    'motherfucking': 'loving',
    'motherfucken': 'loving',
    'motherfuckin': 'loving',
    'motherfuken': 'loving',
    'motherfukin': 'loving',
    'cock': 'bunny',
    'cocksucker': 'amigo',
    'cocksucking': 'beautiful',
    'dumbass': 'cool person',
    'dumass': 'cool person',
    'dummass': 'cool person',
    'bollock': 'apology',
    'bollocks': 'apologies',
    'bollok': 'apology',
    'bolloks': 'apologies',
    'bolock': 'apology',
    'bolocks': 'apologies',
    'bolok': 'apology',
    'boloks': 'apologies',
    'tit': 'bird',
    'tits': 'birds',
    'nipple': 'bead',
    'nipples': 'beads',
    'cum': 'milk',
    'cums': 'spills',
    'cummed': 'spilled',
    'cumguzzler': 'consumer',
    'semen': 'milk',
    'sex': 'fun',
    'cunnilingus': 'dinner',
    'blowjob': 'lunch',
    'blow': 'feed',
    'blows': 'feeds',
    'jizz': 'milk',
    'jizzes': 'spills',
    'jizzed': 'spilled',
    'boner': 'pencil',
    'boners': 'pencils',
    'smegma': 'butter',
    'labia': 'bunny',
    'twat': 'great person',
    'twats': 'great people',
    'felch': 'swallow',
    'felching': 'swallowing',
    'felches': 'swallows'
};

function addToTagproReady(fn) {
    if (typeof tagpro !== "undefined") {
        tagpro.ready(fn);
    } else {
        setTimeout(function() {
            addToTagproReady(fn);
        }, 0);
    }
}

function getPoliteText(message) {
    var politeText = message;
    var words = message.match(/\S+/g); // split up text based on whitespace
    for (var index in words) {
        var word = words[index].replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~\[\]()\+\'\"\\\?]/g,''); // strip punctuation
        var lowerWord = word.toLowerCase();
        if (lowerWord in politeMap) {
            politeText = politeText.replace(word, politeMap[lowerWord]);
        }
    }
    return politeText;
}

addToTagproReady(function() {
    var baseEmit = tagpro.socket.emit;
    tagpro.socket.emit = function(emitType, data) {
        if (emitType === 'chat') {
            var politemsg = getPoliteText(data['message']);
            return baseEmit(emitType, { message:politemsg, toAll:data['toAll'] });
        } else {
            return baseEmit(emitType, data);
        }
    };
});
