//URL richieste Graphdb
var urlGRAPHDB = 'http://localhost:8000/repositories/raiontology';

$(document).ready(function() {
    
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
            $("#result").append("\r\n<a href=" + res.entities[id].sitelinks["itwiki"].url + ">Wikipedia</a>");
            $("#result").append("\r\n<a href=" + link + ">WikiData</a>");
        });                
    });
}

/******************Query 1**********************************/

function requestQ1(){
    $("#result").html("");
    query = "PREFIX : <http://www.purl.org/ontologies/raiontology/> SELECT ?programma ?rating ?label WHERE {?programma a :Brand;rdfs:label ?label.?programma :ratingProgramme ?rating.}ORDER BY DESC(?rating)LIMIT 1";
    $.ajax(urlGRAPHDB, {headers: { Accept: 'application/sparql-results+json'},data: { query: query }}).then(function (data) {
        var res = data;
        console.log(res);
        var paesi = res.results.bindings;
        for(var i = 0; i < paesi.length; i++)
        {
            console.log(paesi[i].programma.value);
            $("#result").append("\n" + paesi[i].label.value + " - " + paesi[i].rating.value);
            requestWikidata(paesi[i].label.value);
        }
    });        
}

/********QUERY 7******************/

function prerequestQ7() {
    $("#result").html("");
    //Prendo tutti i generi
    var query = "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>PREFIX : <http://www.purl.org/ontologies/raiontology/> SELECT ?label ?genre WHERE{?genre a :Genre; rdfs:label ?label}";
    $.ajax(urlGRAPHDB, {headers:{ Accept: 'application/sparql-results+json'},data: { query: query }}).then(function (data) {
        var res = data;
        console.log(res);
        var generi = res.results.bindings;
        for(var i = 0; i < generi.length; i++)
        {
            $("#generi").append("<option value="+ generi[i].label.value+">"+ generi[i].label.value + "</option>");
        }
        $("#generi").removeAttr("hidden");
        $("#btnQ7").removeAttr("hidden");
    });
}

function requestQ7(){
    //query 7
    console.log($("#generi").val());
    var query = "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>PREFIX prov: <http://www.w3.org/ns/prov#> PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> PREFIX : <http://www.purl.org/ontologies/raiontology/> SELECT ?labelDirector (MAX(?sum) as ?max)WHERE{	SELECT ?labelDirector (SUM(?rating) AS ?sum)	WHERE {		?director a :Person; rdfs:label ?labelDirector.		?assoc prov:agent ?director.		?assoc prov:hadRole ?role.		?role a :DirectorRole.		?activity prov:qualifiedAssociation ?role.		?programme prov:wasInfluencedBy ?activity.?genre :nameGenre \"" + $("#generi").val()  + "\"^^xsd:string.?programme :hasSeries ?series.		?series :hasEpisode ?episode.		?episode :hasGenre ?genre.		?programme :ratingProgramme ?rating.	}	GROUP BY ?labelDirector} GROUP BY ?labelDirector ORDER BY DESC(?max)LIMIT 1";
    console.log(query);
    $.ajax(urlGRAPHDB, {headers:{ Accept: 'application/sparql-results+json'},data: { query: query }}).then(function (data) {
        var res = data;
        var generi = res.results.bindings;
        $("#result").append("\n" + generi[0].labelDirector.value + " - " + generi[0].max.value);
        requestWikidata(generi[0].labelDirector.value);
    });
}




/*******************************************************/
function requestPaesi(){
    var SPARQLendpoint = {
        getData: function (query) {
            var base = "https://query.wikidata.org/sparql?query=";
            var endpointUrl = "SELECT ?item WHERE {?item rdfs:label \"Fabrizio Costa\"@it.}",
                settings = {
                    headers: { Accept: 'application/json'}
                };

            $.ajax(base + "" + endpointUrl, settings).then(function (data) {
                var res = data;
                console.log(res);
                /*var paesi = res.results.bindings;
                for(var i = 0; i < paesi.length; i++)
                {
                    console.log(paesi[i].paese.value);
                }*/
            });
        }
    }
    query = "SELECT ?item WHERE {?item rdfs:label \"Fabrizio Costa\"@it.}";
    SPARQLendpoint.getData(query);
}