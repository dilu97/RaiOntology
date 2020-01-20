//URL richieste Graphdb
//var urlGRAPHDB = 'http://localhost:8000/repositories/raiontology';
var urlGRAPHDB = 'http://localhost:7200/repositories/raiontology';
var prefixes = [
    "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>",
    "PREFIX owl: <http://www.w3.org/2002/07/owl#>",
    "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>",
    "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>",
    "PREFIX prov: <http://www.w3.org/ns/prov#>",
    "PREFIX : <http://www.purl.org/ontologies/raiontology/>",
];

$(document).ready(function() {
    $("#groupBtnQuery .btn").click(function(){
        $("#result").html("");
        $("#result").append("<table id=\"tabResult\" class=\"table\"></table>");
        $(".alert").hide();
        $($(this).data("target")).toggle();
        
        if(!$("#q7").is(":visible") && !$("#q8").is(":visible") && !$("#q9").is(":visible") && !$("#q10").is(":visible") && !$("#q5").is(":visible")) $("#dropdown").hide();
        else{
            $("#dropdown").show();
        }
        
        if(!$("#q5").is(":visible")) $("#data").hide();
        else $("#data").show();
    });
    
    //Selezione su dropdown
    $("body").on('click', '.dropdown-menu li a', function () {
        if($("#q7").is(":visible"))
            requestQ7(this.id);
        if($("#q9").is(":visible"))
            requestQ9(this.text);
        if($("#q10").is(":visible"))
            requestQ10(this.text);
        if($("#q5").is(":visible"))
            requestQ5(this.text);
        if($("#q8").is(":visible"))
            requestQ8(this.text);
    });
    
    
    for (var i = 0; i < prefixes.length; i++) {
        $("#txtSparqlQuery").text($("#txtSparqlQuery").text() + prefixes[i] + "\r\n");
    //console.log($("#txtSparqlQuery").html());
    }

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

/********QUERY 5******************/

function prerequestQ5() {
    //Prendo tutti i generi
    $("#dropdown li").remove();
    $("#data").removeAttr("hidden");
    var query = "PREFIX : <http://www.purl.org/ontologies/raiontology/> " +
                "SELECT distinct ?paese " +
                "WHERE {" +
                "	?programma a :Brand; " +
                "		:country ?paese." +
                "}";

    $.ajax(urlGRAPHDB, {headers:{ Accept: 'application/sparql-results+json'},data: { query: query }}).then(function (data) {
        var res = data;
        console.log(res);
        var paesi = res.results.bindings;
        $("#dropdownText").text("Paesi");
        for(var i = 0; i < paesi.length; i++)
        {
            $("#dropdown .dropdown-menu").append("<li><a id="+ paesi[i].paese.value+" href=\"#\">"+ paesi[i].paese.value + "</a></li>");
        }
        $("#dropdown").removeAttr("hidden");
    });
}

function requestQ5(paese){
    //query 5
    $("#result").html("");
    $("#result").append("<table id=\"tabResult\" class=\"table\"></table>");
    var anno = $("#data").val();
    if(anno != "")
    {
        $("#data").hide();
        var query = "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> " +
                    "PREFIX : <http://www.purl.org/ontologies/raiontology/> " +
                    "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> " +
                    "SELECT ?programma ?rating ?label " +
                    "WHERE {" +
                    "	?programma a :Brand; " +
                    "		:yearProgramme ?anno;" +
                    "		:country ?paese; rdfs:label ?label." +
                    "	?programma :ratingProgramme ?rating." +
                    "	FILTER regex(?paese, \"" + paese +"\") " +
                    "	FILTER (?anno=\"" + anno + "\"^^xsd:positiveInteger) " +
                    "}" +
                    "order by desc(?rating) ";
        $.ajax(urlGRAPHDB, {headers:{ Accept: 'application/sparql-results+json'},data: { query: query }}).then(function (data) {
            var res = data;
            var programmi = res.results.bindings;
            console.log(programmi);
            for(var i = 0; i < programmi.length; i++) {
                $("#tabResult").append("<tr><td id=\"" +programmi[i].label.value.replace(/\s/g, '') + "\">"  + programmi[i].label.value + "</td><td>" + programmi[i].rating.value+"</td><td id=\"" + programmi[i].label.value.replace(/\s/g, '') + "WK\"></td><td id=\"" + programmi[i].label.value.replace(/\s/g, '') + "WD\"> </td><td id=\"" + programmi[i].label.value.replace(/\s/g, '') + "DP\"></td></tr>");
                requestWikidata(programmi[i].label.value);
                requestDbPedia(programmi[i].label.value);
            }
        });
    }
    else{
        alert("Inserisci anno!");
    }
}

/************QUERY 6 *****************/
function requestQ6() {
    var query = [
        "PREFIX prov: <http://www.w3.org/ns/prov#>",
        "PREFIX : <http://www.purl.org/ontologies/raiontology/>",
        "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>",
        "SELECT ?labelDirector (SUM(?rating) AS ?sommaRating)  WHERE {",
           "?director a :Person.", 
           "?director rdfs:label ?labelDirector.",
           "?assoc prov:agent ?director.", 
           "?assoc prov:hadRole ?role.", 
           "?activity prov:qualifiedAssociation ?role.", 
           "?programme prov:wasInfluencedBy ?activity.", 
           "?programme :ratingProgramme ?rating.", 
           "?role a :DirectorRole.", 
         "}", 
        "GROUP BY ?labelDirector", 
        "ORDER BY DESC(?sommaRating)",
        "LIMIT 5"
    ].join(" ");      

    $.ajax(urlGRAPHDB, {headers:{ Accept: 'application/sparql-results+json'},data: { query: query }}).then(function (data) {
        
        var res = data;
        var registi = res.results.bindings;
        for(var i=0; i<registi.length; i++)
        {
            $("#tabResult").append("<tr><td id=\"" +registi[i].labelDirector.value.replace(/\s/g, '') + "\">"  + registi[i].labelDirector.value + "</td><td>" + registi[i].sommaRating.value+"</td><td id=\"" + registi[i].labelDirector.value.replace(/\s/g, '') + "WK\"></td><td id=\"" + registi[i].labelDirector.value.replace(/\s/g, '') + "WD\"> </td><td id=\"" + registi[i].labelDirector.value.replace(/\s/g, '') + "DP\"></td></tr>");
            requestWikidata(registi[i].labelDirector.value);
            requestDbPedia(registi[i].labelDirector.value);
        }
        
    });
}
/********QUERY 7******************/

function prerequestQ7() {
    //Prendo tutti i generi
    $("#dropdown li").remove();
    //var query = "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>PREFIX : <http://www.purl.org/ontologies/raiontology/> SELECT ?label ?genre WHERE{?genre a :Genre; rdfs:label ?label}";
    var query = "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> " +
                "PREFIX : <http://www.purl.org/ontologies/raiontology/> " +
                "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> " +
                "PREFIX prov: <http://www.w3.org/ns/prov#> " +
                "SELECT distinct ?label " +
                "  WHERE { " +
                "    ?genre a :Genre;rdfs:label ?label. " +
                "    [] :hasGenre ?genre. " +
                "} ";
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
    $("#result").html("");
    $("#result").append("<table id=\"tabResult\" class=\"table\"></table>");
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

/********QUERY 8******************/

function prerequestQ8() {
    //Prendo tutti i generi
    $("#dropdown li").remove();
    var query = "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> " +
                "PREFIX : <http://www.purl.org/ontologies/raiontology/> " +
                "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> " +
                "PREFIX prov: <http://www.w3.org/ns/prov#> " +
                "SELECT distinct ?label " +
                "  WHERE { " +
                "    ?genre a :Genre;rdfs:label ?label. " +
                "    [] :hasGenre ?genre. " +
                "} ";

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

function requestQ8(genere){
    //query 8
    $("#result").html("");
    $("#result").append("<table id=\"tabResult\" class=\"table\"></table>");
    var query = "PREFIX prov: <http://www.w3.org/ns/prov#> " +
                "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> " +
                "PREFIX : <http://www.purl.org/ontologies/raiontology/> " +
                "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> " +
                "SELECT ?actor ?max ?labelActor " +
                "WHERE { " +
                "	{ " +
                "        SELECT ?actor ?labelActor (COUNT(?episode) AS ?sum)  " +
                "        WHERE { " +
                "            ?actor a :Person; rdfs:label ?labelActor. " +
                "            ?assoc prov:agent ?actor. " +
                "            ?assoc prov:hadRole ?role. " +
                "            ?role a :ActorRole.  " +
                "            ?activity prov:qualifiedAssociation ?role.   " +
                "            ?episode prov:wasInfluencedBy ?activity. " +
                "            ?genre :nameGenre \"Commedia\"^^xsd:string. " +
                "            ?episode :hasGenre ?genre. " +
                "            ?episode a :Episode " +
                "        } " +
                "		GROUP BY ?actor ?labelActor " +
                "    } " +
                "	{ " +
                "	SELECT (MAX(?sum1) as ?max) " +
                "    WHERE { " +
                "		SELECT ?actor2 (COUNT(?episode) AS ?sum1)  " +
                "		WHERE { " +
                "            ?actor2 a :Person.  " +
                "            ?assoc prov:agent ?actor2. " +
                "            ?assoc prov:hadRole ?role. " +
                "            ?role a :ActorRole.  " +
                "            ?activity prov:qualifiedAssociation ?role.   " +
                "            ?episode prov:wasInfluencedBy ?activity. " +
                "            ?genre :nameGenre \"Commedia\"^^xsd:string. " +
                "            ?episode :hasGenre ?genre. " +
                "            ?episode a :Episode " +
                "        	} " +
                "        GROUP BY ?actor2 " +
                "		} " +
                "	} " +
                "	FILTER (?sum=?max) " +
                "} ";
    console.log(query);
    $.ajax(urlGRAPHDB, {headers:{ Accept: 'application/sparql-results+json'},data: { query: query }}).then(function (data) {
        var res = data;
        var registi = res.results.bindings;
        for(var i = 0; i < registi.length; i++) {
            $("#tabResult").append("<tr><td id=\"" +registi[i].labelActor.value.replace(/\s/g, '') + "\">"  + registi[i].labelActor.value + "</td><td>" + registi[i].max.value+"</td><td id=\"" + registi[i].labelActor.value.replace(/\s/g, '') + "WK\"></td><td id=\"" + registi[i].labelActor.value.replace(/\s/g, '') + "WD\"> </td><td id=\"" + registi[i].labelActor.value.replace(/\s/g, '') + "DP\"></td></tr>");
            requestWikidata(registi[i].labelActor.value);
            requestDbPedia(registi[i].labelActor.value);
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
    $("#result").html("");
    $("#result").append("<table id=\"tabResult\" class=\"table\"></table>");
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

/********QUERY 10******************/

function prerequestQ10() {
    //Prendo tutti i generi
    $("#dropdown li").remove();
    //var query = "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>PREFIX : <http://www.purl.org/ontologies/raiontology/> SELECT ?label ?genre WHERE{?genre a :Genre; rdfs:label ?label}";
    var query = "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> " +
                "PREFIX : <http://www.purl.org/ontologies/raiontology/> " +
                "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> " +
                "PREFIX prov: <http://www.w3.org/ns/prov#> " +
                "SELECT distinct ?label " +
                "  WHERE { " +
                "    ?genre a :Genre;rdfs:label ?label. " +
                "    [] :hasGenre ?genre. " +
                "} ";
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

function requestQ10(genere){
    //query 10
    $("#result").html("");
    $("#result").append("<table id=\"tabResult\" class=\"table\"></table>");
    var query = [
      "PREFIX prov: <http://www.w3.org/ns/prov#>",
      "PREFIX : <http://www.purl.org/ontologies/raiontology/>",
      "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>",

      "SELECT ?labelGenre ?labelProgramme ?rating WHERE {",
        "{",
          "SELECT DISTINCT ?labelProgramme ?labelGenre ?rating WHERE {",
            "?episode :hasGenre ?genre.",
            "?series :hasEpisode ?episode.",
            "?programme :hasSeries ?series.",
            "?programme :ratingProgramme ?rating.",
            "?genre rdfs:label ?labelGenre.",
            "?programme rdfs:label ?labelProgramme.",
            "FILTER (?labelGenre = '" + genere + "')",
          "}",
        "}",
        "{",
          "SELECT (MAX(?rating2) AS ?maxRating) WHERE {",
            "?episode2 :hasGenre ?genre2.",
            "?series2 :hasEpisode ?episode2.",
            "?programme2 :hasSeries ?serie2.",
            "?programme2:ratingProgramme ?rating2.",
            "?genre2 rdfs:label ?labelGenre2.",
            "?programme2 rdfs:label ?labelProgramme2.",
            "FILTER (?labelGenre2 = '"+ genere + "')",
        "}",
      "}",
      "FILTER (?rating = ?maxRating)",
      "}"
    ].join("\n"); 
    
    $.ajax(urlGRAPHDB, {headers:{ Accept: 'application/sparql-results+json'},data: { query: query }}).then(function (data) {
        var res = data;
        var film = res.results.bindings;
        for(var i = 0; i < film.length; i++) {
            $("#tabResult").append("<tr><td id=\"" +film[i].labelProgramme.value.replace(/\s/g, '') + "\">"  + film[i].labelProgramme.value + "</td><td>" + film[i].rating.value+"</td><td id=\"" + film[i].labelProgramme.value.replace(/\s/g, '') + "WK\"></td><td id=\"" + film[i].labelProgramme.value.replace(/\s/g, '') + "WD\"> </td><td id=\"" + film[i].labelProgramme.value.replace(/\s/g, '') + "DP\"></td></tr>");
            requestWikidata(film[i].labelProgramme.value);
            requestDbPedia(film[i].labelProgramme.value);
        }
        
    });
}

/***** sparql ******/
function sparqlQuery() {;
    var query = $("#txtSparqlQuery").val();
    $.ajax({
        url: urlGRAPHDB,
        data: { query: query  },
        headers:{ Accept: 'application/sparql-results+json'},
        success: function(data) {
            $("#tabResult").html("");
            var results = data.results.bindings;
            if (results.length > 0) {
                var keys = Object.keys(results[0]);

                $("#tabResult").append("<tr>");
                for (var i = 0; i < keys.length; i++) {
                    $("#tabResult").append("<th>" + keys[i] + "</th>");
                }
                $("#tabResult").append("</tr>");

                for(var i = 0; i < results.length; i++) {
                    $("#tabResult").append("<tr>");
                    for (var j = 0; j < keys.length; j++) {
                        var key = keys[j];
                        $("#tabResult").append("<td>" + results[i][key].value + "</td>");
                    }
                    $("#tabResult").append("</tr>");
                }
            }
        },
        error: function(error) {
            alert(error.responseText);
        },
        type: 'GET'
    });
    
}