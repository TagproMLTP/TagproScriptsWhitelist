

var vars = ["Map Width","Map Height","Total Area","Adjusted Area" ,"Shortest Path Between Flags","Percent Not Empty" ,"Empty Spaces","Walls","Walls (Square)","Walls (Diagonal)","Floor Tiles","Floor Tiles % of Interior","Flags (Red)","Flags (Blue)","Flags (Yellow)","Speed Pads (Total)","Speed Pads (Neutral)","Speed Pads (Red)","Speed Pads (Blue)","Power-Ups","Spikes","Buttons","Gates (Inactive)" ,"Gates (Green)" ,"Gates (Red)" ,"Gates (Blue)" ,"Bombs" ,"Team Tiles (Red)" ,"Team Tiles (Blue)" ,"Portals" ,"Goal Tiles (Red)" ,"Goal Tiles (Blue)" ,"Gravity Wells"],
    defaultTable = $("#defaultMetrics tbody")[0],
    index = 0;

function updateDefaultChecks() {
    var allCBs = $('#defaultMetrics').find(':checkbox'),
        checkStatuses = [];
    for(var i = 0; i < allCBs.length; i++) {
        checkStatuses.push(allCBs[i].checked);
    }
    chrome.storage.sync.set({defaultChecks: checkStatuses});
}

vars.forEach(function(e) {
    var tr = document.createElement('tr'),
        indexTd = document.createElement('td'),
        nameTd = document.createElement('td'),
        displayTd = $('<td style="text-align: center;">')[0],
        displayCB = $('<input type="checkbox">')[0];

    index += 1;
    indexTd.innerHTML = index;
    nameTd.id = 'field' + index;
    nameTd.innerHTML = e;
    displayCB.onclick = updateDefaultChecks;
    displayTd.appendChild(displayCB);
    [indexTd, nameTd, displayTd].forEach(function(i) {tr.appendChild(i);});
    defaultTable.appendChild(tr);
});

chrome.storage.sync.get('defaultChecks', function(result) {
    var checks = result.defaultChecks,
        checkboxes = $('#defaultMetrics').find(':checkbox');
    if(checks) {
        for(var i = 0; i < checks.length; i++) {
            checkboxes[i].checked = checks[i];
        }
    }
});

var userTable = $('#userMetrics tbody')[0],
    formulaInput = document.getElementById('formulaInput'),
    nameInput = document.getElementById('nameInput'),
    storedFormulas = [],
    numDefaultMetrics = defaultTable.children.length;


function removeFormula() {
    var thisTr = this;
    if(confirm("Are you sure you want to delete this formula?\nAll formulae that reference this formula will be broken!")) {
        chrome.storage.sync.get("formulas", function(result) {
            var formulas = result.formulas,
                thisId = thisTr.closest('tr').children[0].innerHTML;
            for(var i = 0; i < formulas.length; i++) {
                console.log(thisId, formulas[i]);
                if(formulas[i].index === thisId) {
                    formulas.splice(i, 1);
                    chrome.storage.sync.set({formulas: formulas}, function() {
                        window.location.href = "page_action.html";
                    });
                }
            }
        });
    }
}

function saveAllUserFormulae() {
    var formulae = [],
        trs = $('#userMetrics tbody tr');
    for(var i = 0; i < trs.length; i++) {
        formulae.push({
            index: trs[i].children[0].innerHTML,
            name: trs[i].children[1].innerHTML,
            formula: trs[i].children[2].innerHTML,
            actualFormula: trs[i].children[2].actualFormula,
            dontDisplay: $(trs[i]).find(':checkbox')[0].checked
        });
    }
    chrome.storage.sync.set({formulas: formulae});
}

function toggleRearrangeFormulae() {
    if($('#userMetrics tbody').hasClass('ui-sortable') && !$('#userMetrics tbody').sortable('option','disabled')) {
        this.textContent = 'Rearrange Formulae';
        $('#userMetrics td').css('cursor', 'auto');
        $('#userMetrics tbody').sortable('disable');
        $('#userMetrics tbody tr').ClassyWiggle('stop');
        saveAllUserFormulae();

    } else {
        this.textContent = 'Save Formulae Positions';
        if(!$('#userMetrics tbody').hasClass('ui-sortable')) {
            $('#userMetrics tbody').sortable({
                axis:'y',
                cursor: 'move'
            });
        } else {
            $('#userMetrics tbody').sortable('enable');
        }
        $('#userMetrics tbody tr').ClassyWiggle('start', {
            degrees:['-0.25', '-0.5', '-0.25', '0', '0.25', '0.5', '0.25', '0'], 
            delay:35
        });
        $('#userMetrics td').css('cursor', 'move');
    }
}
$('#moveButton').click(toggleRearrangeFormulae);


chrome.storage.sync.get("formulas", function(result) {
    storedFormulas = result.formulas;
    if(storedFormulas) {
        storedFormulas.forEach(function(d){
            var newRow = document.createElement('tr'),
                index = document.createElement('td'),
                name = document.createElement('td'),
                formula = document.createElement('td'),
                remove = document.createElement('button'),
                displayTd = $('<td style="text-align: center;">')[0],
                displayCB = $('<input type="checkbox">')[0];
            displayCB.onclick = saveAllUserFormulae;
            displayCB.checked = d.dontDisplay;
            displayTd.appendChild(displayCB);
            remove.textContent = 'Remove';
            remove.onclick = removeFormula;
            index.innerHTML = d.index;
            name.innerHTML = d.name;
            name.id  = 'field' + d.index;
            formula.innerHTML = d.formula;
            formula.actualFormula = d.actualFormula;
            [index, name, formula, displayTd, remove].forEach(function(i){newRow.appendChild(i);});
            userTable.appendChild(newRow);
        });
    } else {
        storedFormulas = [];
    }
});


document.getElementById('saveButton').addEventListener('click', function() {

    var name = document.createElement('td'),
        formula = document.createElement('td'),
        index = document.createElement('td'),
        newRow = document.createElement('tr'),
        remove = document.createElement('button'),
        displayTd = $('<td style="text-align: center;">')[0],
        displayCB = $('<input type="checkbox">')[0],
        inputtedName = nameInput.value,
        equation = formulaInput.value.replace(/[^\d \+\-\/\*\.\(\)\$]/g, ''),
        displayedEquation = equation,
        actualEquation = equation,
        regexp = /\$[0-9]{0,4}/g,
        match = [],
        matches = [];

    if(!inputtedName) return;

    while ((match = regexp.exec(equation)) !== null) {
        matches.push({index: match.index, value:match[0]});
    }

    matches.forEach(function(match) {
        var matchedField = document.getElementById('field' + match.value.replace('$', ''));
        if(!matchedField) {
            chrome.runtime.sendMessage({type:'error', message:'Cannot recognize ' + match.value});
        } 

        displayedEquation = displayedEquation.replace( match.value, '{'+matchedField.innerHTML+'}' );
        actualEquation = actualEquation.replace( match.value, 'mapInfo["' + matchedField.innerHTML + '"]');
    });

    var entries = userTable.children,
        lastIndex = 0;

    if( !entries.length || entries.length < 1) {
        lastIndex = numDefaultMetrics;
    } else {
        for(var i = 0; i < entries.length; i++) {
            lastIndex = Math.max(Number(entries[i].children[0].innerHTML), lastIndex);
        }
    }
    index.innerHTML = +lastIndex + 1;
    name.innerHTML = inputtedName;
    name.id = 'field' + index.innerHTML;
    formula.innerHTML = displayedEquation;
    formula.actualFormula = actualEquation;
    remove.textContent = 'Remove';
    remove.onclick = removeFormula;
    displayCB.onclick = saveAllUserFormulae;
    displayTd.appendChild(displayCB);
    [index, name, formula, displayTd, remove].forEach(function(i){newRow.appendChild(i);});
    userTable.appendChild(newRow);


    nameInput.value = '';
    formulaInput.value = '';
    storedFormulas.push({index: index.innerHTML,
                         name: name.innerHTML,
                         formula: formula.innerHTML,
                         actualFormula: actualEquation,
                         dontDisplay: displayCB.checked
                        });
    chrome.storage.sync.set({formulas: storedFormulas});

});

document.getElementById('reset').addEventListener('click', function(){
    if(confirm('Are you sure you want to delete all your formulae?\nThis cannot be undone.')) {
        chrome.storage.sync.clear(function(){
            window.location.href = "page_action.html";
        });
    }
});


