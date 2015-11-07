// ==UserScript==
// @name         TagPro /testmap Enhancer
// @version      0.1.1
// @description  Make the /testmap page a little easier to use by adding drag-and-drop functionality
// @author       Some Ball -1
// @include      http://tagpro-maptest.koalabeast.com/testmap
// @include      http://*.newcompte.fr/testmap
// @grant        none
// ==/UserScript==

$('input').css('display','none').wrap('<div class="wrapped" style="border: 1px solid gray"><a class="fileHandler" style="vertical-align: middle; width: 100%; height: 100px; cursor: pointer; color: inherit"><pre style="width: 100%; height: 100%; margin: 0px; font: inherit; text-align: center; line-height: 50px; /*-webkit-text-stroke: 1px black;*/ font-size: 20px; color: inherit;">No File Chosen\nDrag and drop a file into this area or click to browse for files</pre></a></div>');
$('.fileHandler').on('click',function(event) {
    this.children[0].children[0].click();
});
$('.fileHandler').on('dragenter',function(event) {
    event.stopPropagation();
    event.preventDefault();
});
$('.fileHandler').on('dragover',function(event) {
    event.stopPropagation();
    event.preventDefault();
});
$('.fileHandler').on('drop',function(event) {
    event.stopPropagation();
    event.preventDefault();
    
    var files = event.originalEvent.dataTransfer.files; 
    var childinput = this.children[0].children[0];
    var $parent = $(this.parentNode);
    if(childinput.name==='layout')
    {
        if(files[0].type==='image/png')
        {
            $parent.css({backgroundColor: 'darkgreen',color: 'white'});
            this.children[0].childNodes[0].nodeValue = files[0].name+'\nDrag and drop or click to change files or click below to test the map';
            childinput.files = files;
        }
        else
        {
            $parent.css({background: 'none',color: 'red'});
            this.children[0].childNodes[0].nodeValue = 'Improper file type\nOnly .png files are an acceptable layout file input';
        }
    }
    else if(childinput.name==='logic')
    {
        if(files[0].type==='application/json')
        {
            $parent.css({backgroundColor: 'darkgreen',color: 'white'});
            this.children[0].childNodes[0].nodeValue = files[0].name+'\nDrag and drop or click to change files or click below to test the map';
            childinput.files = files;
        }
        else
        {
            $parent.css({background: 'none',color: 'red'});
            this.children[0].childNodes[0].nodeValue = 'Improper file type\nOnly .json files are an acceptable logic file input';
        }
    }
});