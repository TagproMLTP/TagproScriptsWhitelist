$('table.board tbody tr:nth-child(1)').append('<th>+-</th>');
var ribbonthreshold = [];
$("table.board").each(function() {
    var arrayOfThisRow = [];
    var tableData = $(this).find('tbody tr:nth-child(4) td:nth-child(3)');
    if (tableData.length > 0) {
        tableData.each(function() { arrayOfThisRow.push($(this).text()); });
        ribbonthreshold.push(arrayOfThisRow);
    }
});

$("#Day table.board").each(function() {
	var userscores = $(this).find('tbody td:nth-child(3)');
	if (userscores.length > 0) {
		var i = 0;
		userscores.each(function() { 
		var plusminus = $(this).text()-ribbonthreshold[0];
		if (i%2 == 0){
			$(this).after('<td>'+plusminus+'</td>');
		}else{
			$(this).after('<td class="alt">'+plusminus+'</td>');
		}
		i+=1;
		});
	}
});
$("#Week table.board").each(function() {
	var userscores = $(this).find('tbody td:nth-child(3)');
	if (userscores.length > 0) {
		var i = 0;
		userscores.each(function() { 
		var plusminus = $(this).text()-ribbonthreshold[1];
		if (i%2 == 0){
			$(this).after('<td class="alt">'+plusminus+'</td>');
		}else{
			$(this).after('<td>'+plusminus+'</td>');
		}
		i+=1;
		});
	}
});
$("#Month table.board").each(function() {
	var userscores = $(this).find('tbody td:nth-child(3)');
	if (userscores.length > 0) {
		var i = 0;
		userscores.each(function() { 
		var plusminus = $(this).text()-ribbonthreshold[2];
		if (i%2 == 0){
			$(this).after('<td>'+plusminus+'</td>');
		}else{
			$(this).after('<td class="alt">'+plusminus+'</td>');
		}
		i+=1;
		});
	}
});