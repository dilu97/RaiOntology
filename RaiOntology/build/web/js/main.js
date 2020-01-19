//URL richieste Graphdb
//var urlGRAPHDB = 'http://localhost:8000/repositories/raiontology';
var urlGRAPHDB = 'http://localhost:7200/repositories/raiontology';

$(document).ready(function() {
    $("#groupBtnQuery .btn").click(function(){
        $("#result").html("");
        $("#result").append("<table id=\"tabResult\" class=\"table\"></table>");
        $(".alert").hide();
        $($(this).data("target")).toggle();
        
        if(!$("#q7").is(":visible") && !$("#q9").is(":visible")) $("#dropdown").hide();
        else{
            $("#dropdown").show();
        }
    });
    
    //Selezione su dropdown
    $("body").on('click', '.dropdown-menu li a', function () {
        if($("#q7").is(":visible"))
            requestQ7(this.id);
        if($("#q9").is(":visible"))
            requestQ9(this.text);
    });
});

function requestWikidata(label){
    var base = "https://query.wikidata.org/sparql?query=";
    var endpointUrl = "SELECT ?item WHERE {?item rdfs:label \""+ label + "\"@it.}",

        settings = {
            headers: { Accept: 'application/json'}
        };

    $.ajax(base + "" + endpointUrl, settings).then(function (data) {
        var res = data;
        var id = res.results.bindings[0].item.value.split('/')[4];
        var link = "https://www.wikidata.org/wiki/Special:EntityData/" + id;
        $.ajax(link + ".json", { Accept: 'application/json'}).then(function (data) {
            var res = data;
            console.log(res.entities);
            //console.log(res.entities[id].sitelinks["itwiki"].url);
            $("#" + label.replace(/\s/g, '') + "WK").append("<a href=" + res.entities[id].sitelinks["itwiki"].url + ">Wikipedia</a>");
            $("#" + label.replace(/\s/g, '') + "WD").append("<a href=" + link + ">WikiData</a>");
        });                
    });
}

function requestDbPedia(label){
    //sparql query
    var query = [
        "SELECT ?item WHERE {",
        "?item rdfs:label '" + label + "'@en .",
        "}  LIMIT 100"
    ].join(" ");
    //url for the query
    var url = "http://dbpedia.org/sparql";
    var queryUrl = url + "?query=" + encodeURIComponent(query);

    $.ajax({
        url: queryUrl,
        data: {
            format: 'json'
        },
        dataType: 'json',
        success: function(data) {
            console.log(JSON.stringify(data));
            if (data.results.bindings.length > 0) {
                for (var i = 0; i < data.results.bindings.length; i++) {
                    var link = data.results.bindings[i].item.value;
                    $("#" + label.replace(/\s/g, '') + "DP").append("<a href=" + link + ">Link " + (i+ 1) + "</a>");
                }
            }
            else {
                $("#" + label.replace(/\s/g, '') + "DP").append("No dbPedia results found");
            }
        },
        type: 'GET'
    });
}

/******************Query 1**********************************/

function requestQ1(){
    var query = "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>PREFIX : <http://www.purl.org/ontologies/raiontology/>SELECT distinct ?programma ?rating ?label WHERE {	?programma a :Brand; rdfs:label ?label; :ratingProgramme ?rating.        	?p2 a :Brand; :ratingProgramme ?r2. FILTER (?rating>?r2)}";
    $.ajax(urlGRAPHDB, {headers: { Accept: 'application/sparql-results+json'},data: { query: query }}).then(function (data) {
        var res = data;
        console.log(res);
        var paesi = res.results.bindings;
        for(var i = 0; i < paesi.length; i++)
        {
            console.log(paesi[i].programma.value);
            $("#tabResult").append("<tr><td id=\"" +paesi[i].label.value.replace(/\s/g, '') + "\">"  + paesi[i].label.value + "</td><td>" + paesi[i].rating.value+"</td><td id=\"" + paesi[i].label.value.replace(/\s/g, '') + "WK\"></td><td id=\"" + paesi[i].label.value.replace(/\s/g, '') + "WD\"> </td><td id=\"" + paesi[i].label.value.replace(/\s/g, '') + "DP\"></td></tr>");
            requestWikidata(paesi[i].label.value);
            requestDbPedia(paesi[i].label.value);
        }
    });        
}

/******************Query 2**********************************/

function requestQ2(){
    var query = "PREFIX : <http://www.purl.org/ontologies/raiontology/> PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> SELECT ?brand (COUNT(?episode) AS ?numEpisodi) ?label WHERE { 	?brand a :Brand; :hasSeries ?series; rdfs:label ?label.	?series :hasEpisode ?episode.} GROUP BY ?brand ?label ORDER BY DESC(?numEpisodi) LIMIT 1";
    $.ajax(urlGRAPHDB, {headers: { Accept: 'application/sparql-results+json'},data: { query: query }}).then(function (data) {
        var res = data;
        console.log(res);
        var paesi = res.results.bindings;
        for(var i = 0; i < paesi.length; i++)
        {
            $("#tabResult").append("<tr><td id=\"" +paesi[i].label.value.replace(/\s/g, '') + "\">"  + paesi[i].label.value + "</td><td>" + paesi[i].numEpisodi.value+"</td><td id=\"" + paesi[i].label.value.replace(/\s/g, '') + "WK\"></td><td id=\"" + paesi[i].label.value.replace(/\s/g, '') + "WD\"> </td><td id=\"" + paesi[i].label.value.replace(/\s/g, '') + "DP\"></td></tr>");
            requestWikidata(paesi[i].label.value);
            requestDbPedia(paesi[i].label.value);
        }
    });        
}

/******************Query 3**********************************/

function requestQ3(){
    var query = "PREFIX prov: <http://www.w3.org/ns/prov#> PREFIX : <http://www.purl.org/ontologies/raiontology/> PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>SELECT distinct ?actor ?label ?num WHERE {	{SELECT ?actor ?label (COUNT(?episode) AS ?num)	WHERE {        ?actor a :Person; rdfs:label ?label.        ?assoc prov:agent ?actor.        ?assoc prov:hadRole ?role.        ?activity prov:qualifiedAssociation ?role.        ?episode prov:wasInfluencedBy ?activity.        ?episode :hasGenre ?genre.        ?role a :ActorRole. 	}	GROUP BY ?actor ?label}    {SELECT (MAX(?num2) as ?max)	WHERE {		{SELECT ?actor (COUNT(?episode) AS ?num2)		WHERE {            ?actor a :Person.              ?assoc prov:agent ?actor.            ?assoc prov:hadRole ?role.            ?activity prov:qualifiedAssociation ?role.            ?episode prov:wasInfluencedBy ?activity.            ?episode :hasGenre ?genre.            ?role a :ActorRole.         } GROUP BY ?actor}        }    }	FILTER (?num = ?max)}";
    $.ajax(urlGRAPHDB, {headers: { Accept: 'application/sparql-results+json'},data: { query: query }}).then(function (data) {
        var res = data;
        console.log(res);
        var paesi = res.results.bindings;
        for(var i = 0; i < paesi.length; i++)
        {
            $("#tabResult").append("<tr><td id=\"" +paesi[i].label.value.replace(/\s/g, '') + "\">"  + paesi[i].label.value + "</td><td>" + paesi[i].num.value+"</td><td id=\"" + paesi[i].label.value.replace(/\s/g, '') + "WK\"></td><td id=\"" + paesi[i].label.value.replace(/\s/g, '') + "WD\"> </td><td id=\"" + paesi[i].label.value.replace(/\s/g, '') + "DP\"></td></tr>");
            requestWikidata(paesi[i].label.value);
            requestDbPedia(paesi[i].label.value);
        }
    });        
}

//



/************QUERY 4 *****************/
function requestQ4() {
    var query = "PREFIX prov: <http://www.w3.org/ns/prov#>PREFIX : <http://www.purl.org/ontologies/raiontology/>PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>SELECT ?labelActor (COUNT(?genre) AS ?numGeneri)WHERE {	SELECT DISTINCT ?labelActor ?genre	WHERE { 		?actor a :Person; rdfs:label ?labelActor.		?assoc prov:agent ?actor.		?assoc prov:hadRole ?role.		?activity prov:qualifiedAssociation ?role.		?episode prov:wasInfluencedBy ?activity.		?episode :hasGenre ?genre.		?role a :ActorRole.	}	ORDER BY ?labelActor ?genre}GROUP BY ?labelActor HAVING (?numGeneri > 1)ORDER BY ?numGeneri";
    console.log(query);
    $.ajax(urlGRAPHDB, {headers:{ Accept: 'application/sparql-results+json'},data: { query: query }}).then(function (data) {
        var res = data;
        var attori = res.results.bindings;
        console.log(attori);
        for(var i=0; i<attori.length; i++)
        {
            $("#tabResult").append("<tr><td id=\"" +attori[i].labelActor.value.replace(/\s/g, '') + "\">"  + attori[i].labelActor.value + "</td><td>" + attori[i].numGeneri.value+"</td><td id=\"" + attori[i].labelActor.value.replace(/\s/g, '') + "WK\"></td><td id=\"" + attori[i].labelActor.value.replace(/\s/g, '') + "WD\"> </td><td id=\"" + attori[i].labelActor.value.replace(/\s/g, '') + "DP\"></td></tr>");
            requestWikidata(attori[i].labelActor.value);
            requestDbPedia(attori[i].labelActor.value);
        }
        
    });
}
/********QUERY 7******************/

function prerequestQ7() {
    //Prendo tutti i generi
    $("#dropdown li").remove();
    var query = "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>PREFIX : <http://www.purl.org/ontologies/raiontology/> SELECT ?label ?genre WHERE{?genre a :Genre; rdfs:label ?label}";
    $.ajax(urlGRAPHDB, {headers:{ Accept: 'application/sparql-results+json'},data: { query: query }}).then(function (data) {
        var res = data;
        console.log(res);
        var generi = res.results.bindings;
        $("#dropdownText").text("Generi");
        for(var i = 0; i < generi.length; i++)
        {
            $("#dropdown .dropdown-menu").append("<li><a id="+ generi[i].label.value+" href=\"#\">"+ generi[i].label.value + "</a></li>");
        }
        $("#dropdown").removeAttr("hidden");
    });
}

function requestQ7(genere){
    //query 7
    var query = "PREFIX prov: <http://www.w3.org/ns/prov#>PREFIX : <http://www.purl.org/ontologies/raiontology/>PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>SELECT distinct ?director ?sum ?label WHERE{ 	{SELECT ?director (SUM(?rating) AS ?sum) 	WHERE { 		?director a :Person.		?assoc prov:agent ?director.		?assoc prov:hadRole ?role.		?role a :DirectorRole. 		?activity prov:qualifiedAssociation ?role.		?programme prov:wasInfluencedBy ?activity.		?genre :nameGenre \""+ genere + "\"^^xsd:string.		?programme :hasSeries ?series.		?series :hasEpisode ?episode.		?episode :hasGenre ?genre.		?programme :ratingProgramme ?rating.	}    	GROUP BY ?director}    {SELECT ?director1 (SUM(?rating) AS ?sum2) 	WHERE {		?director1 a :Person.		?assoc prov:agent ?director1.		?assoc prov:hadRole ?role.		?role a :DirectorRole.		?activity prov:qualifiedAssociation ?role.		?programme prov:wasInfluencedBy ?activity.		?genre :nameGenre \""+ genere + "\"^^xsd:string.		?programme :hasSeries ?series.		?series :hasEpisode ?episode.		?episode :hasGenre ?genre.		?programme :ratingProgramme ?rating.	}    GROUP BY ?director1}     {?director rdfs:label ?label}FILTER (?sum>?sum2)}";
    $.ajax(urlGRAPHDB, {headers:{ Accept: 'application/sparql-results+json'},data: { query: query }}).then(function (data) {
        var res = data;
        var registi = res.results.bindings;
        for(var i = 0; i < registi.length; i++) {
            $("#tabResult").append("<tr><td id=\"" +registi[i].label.value.replace(/\s/g, '') + "\">"  + registi[i].label.value + "</td><td>" + registi[i].sum.value+"</td><td id=\"" + registi[i].label.value.replace(/\s/g, '') + "WK\"></td><td id=\"" + registi[i].label.value.replace(/\s/g, '') + "WD\"> </td><td id=\"" + registi[i].label.value.replace(/\s/g, '') + "DP\"></td></tr>");
            requestWikidata(registi[i].label.value);
            requestDbPedia(registi[i].label.value);
        }
    });
}

/********QUERY 9******************/

function prerequestQ9() {
    //Prendo tutti i generi
    $("#dropdown li").remove();
    var query = "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> PREFIX prov: <http://www.w3.org/ns/prov#> PREFIX : <http://www.purl.org/ontologies/raiontology/> SELECT distinct ?director ?label	WHERE {        ?director a :Person; rdfs:label ?label.        ?assoc prov:agent ?director.        ?assoc prov:hadRole ?role.        ?activity prov:qualifiedAssociation ?role.        ?programme prov:wasInfluencedBy ?activity; rdfs:label ?labelProgramme.        ?programme :ratingProgramme ?rating.        ?role a :DirectorRole.    }";
    $.ajax(urlGRAPHDB, {headers:{ Accept: 'application/sparql-results+json'},data: { query: query }}).then(function (data) {
        var res = data;
        var registi = res.results.bindings;
        console.log(registi);
        $("#dropdownText").text("Registi");
        for(var i = 0; i < registi.length; i++)
        {
            $("#dropdown .dropdown-menu").append("<li><a id="+ registi[i].label.value+" href=\"#\">"+ registi[i].label.value + "</a></li>");
        }
        $("#dropdown").removeAttr("hidden");
    });
}

function requestQ9(regista){
    //query 9
    var query = "PREFIX prov: <http://www.w3.org/ns/prov#> PREFIX : <http://www.purl.org/ontologies/raiontology/> PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> SELECT ?director ?label ?rating ?labelProgramme WHERE {	{SELECT ?director ?label ?rating ?programme ?labelProgramme	WHERE {        ?director a :Person; rdfs:label ?label.        ?assoc prov:agent ?director.        ?assoc prov:hadRole ?role.        ?activity prov:qualifiedAssociation ?role.        ?programme prov:wasInfluencedBy ?activity; rdfs:label ?labelProgramme.        ?programme :ratingProgramme ?rating.        ?role a :DirectorRole.        FILTER (?label=\"" + regista + "\")}    }    {SELECT (MAX(?rat) as ?max)        WHERE {            ?director2 a :Person; rdfs:label ?label2.            ?assoc prov:agent ?director2.            ?assoc prov:hadRole ?role.            ?activity prov:qualifiedAssociation ?role.            ?programme2 prov:wasInfluencedBy ?activity.            ?programme2 :ratingProgramme ?rat.            ?role a :DirectorRole.            FILTER (?label2=\"" + regista + "\")}    } FILTER (?rating = ?max)}";
    console.log(query);
    $.ajax(urlGRAPHDB, {headers:{ Accept: 'application/sparql-results+json'},data: { query: query }}).then(function (data) {
        var res = data;
        var programmi = res.results.bindings;
        console.log(programmi);
        for(var i = 0; i < programmi.length; i++) {
            $("#tabResult").append("<tr><td id=\"" +programmi[i].labelProgramme.value.replace(/\s/g, '') + "\">"  + programmi[i].labelProgramme.value + "</td><td>" + programmi[i].rating.value+"</td><td id=\"" + programmi[i].labelProgramme.value.replace(/\s/g, '') + "WK\"></td><td id=\"" + programmi[i].labelProgramme.value.replace(/\s/g, '') + "WD\"> </td><td id=\"" + programmi[i].labelProgramme.value.replace(/\s/g, '') + "DP\"></td></tr>");
            requestWikidata(programmi[i].labelProgramme.value);
            requestDbPedia(programmi[i].labelProgramme.value);
        }
    });
}
