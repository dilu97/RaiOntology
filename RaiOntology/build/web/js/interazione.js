var urlGRAPHDB = 'http://localhost:7200/repositories/raiontology';

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
    
    //Selezione di un genere, inserisco attori, registi e programmi collegati
    $("#dropdownGeneri").on('change', function (e) {
        var optionSelected = $("option:selected", this);
        var valueSelected = this.value;
        //alert(valueSelected);
        
        $("#dropdownAttori option").remove();
        $("#dropdownRegisti option").remove();
        $("#dropdownProgrammi option").remove();
        $("#result").html("");
        $("#result").append("<table id=\"tabResult\" class=\"table\"></table>");
        
        loadAttori(valueSelected);
        loadRegisti(valueSelected);
        loadProgrammi(valueSelected);
    });
    
    //Selezione attore, visualizzo i dati
    $("#dropdownAttori").on('change', function (e) {
        var optionSelected = $("option:selected", this);
        var valueSelected = this.value;
        //alert(valueSelected);
        $("#result").html("");
        $("#result").append("<table id=\"tabResult\" class=\"table\"></table>");
        $("#tabResult").append("<tr><td id=\"" +valueSelected.replace(/\s/g, '') + "\">"  + valueSelected + "</td><td id=\"" + valueSelected.replace(/\s/g, '') + "WK\"></td><td id=\"" + valueSelected.replace(/\s/g, '') + "WD\"> </td><td id=\"" + valueSelected.replace(/\s/g, '') + "DP\"></td></tr>");
        requestWikidata(valueSelected);
        requestDbPedia(valueSelected);
        
        $("#dropdownRegisti").val("");
        $("#dropdownProgrammi").val("");
    });
    
    //Selezione di un regista, visualizzo i dati
    $("#dropdownRegisti").on('change', function (e) {
        var optionSelected = $("option:selected", this);
        var valueSelected = this.value;
        //alert(valueSelected);
        $("#result").html("");
        $("#result").append("<table id=\"tabResult\" class=\"table\"></table>");
        $("#tabResult").append("<tr><td id=\"" +valueSelected.replace(/\s/g, '') + "\">"  + valueSelected + "</td><td id=\"" + valueSelected.replace(/\s/g, '') + "WK\"></td><td id=\"" + valueSelected.replace(/\s/g, '') + "WD\"> </td><td id=\"" + valueSelected.replace(/\s/g, '') + "DP\"></td></tr>");
        requestWikidata(valueSelected);
        requestDbPedia(valueSelected);
        
        $("#dropdownAttori").val("");
        $("#dropdownProgrammi").val("");
    });
    
    //Selezione di un programma, visualizzo i dati e carico gli episodi
    $("#dropdownProgrammi").on('change', function (e) {
        var optionSelected = $("option:selected", this);
        var valueSelected = this.value;
        
        $("#result").html("");
        $("#result").append("<table id=\"tabResult\" class=\"table\"></table>");
        loadInfoProgramma(valueSelected);
        $("#tabResult").append("<tr><td id=\"" +valueSelected.replace(/\s/g, '') + "\">"  + valueSelected + "</td><td id=\"" + valueSelected.replace(/\s/g, '') + "WK\"></td><td id=\"" + valueSelected.replace(/\s/g, '') + "WD\"> </td><td id=\"" + valueSelected.replace(/\s/g, '') + "DP\"></td></tr>");
        requestWikidata(valueSelected);
        requestDbPedia(valueSelected);
        
        $("#dropdownRegisti").val("");
        $("#dropdownAttori").val("");
    });
      
    //onload
    loadGeneri();
});

function loadGeneri() {
    //Prendo tutti i generi
    $("#dropdownGeneri li").remove();
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
            $("#dropdownGeneri").append("<option><a id="+ generi[i].label.value+" href=\"#\">"+ generi[i].label.value + "</a></option>");
        }
        $("#dropdownGeneri").removeAttr("hidden");
        $("#dropdownGeneri").val("");
    });
}

function loadAttori(genere) {
    //Prendo tutti i generi
    $("#dropdownGeneri li").remove();
    var query = "PREFIX : <http://www.purl.org/ontologies/raiontology/> " +
                "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> " +
                "PREFIX prov: <http://www.w3.org/ns/prov#> " +
                "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> " +
                "SELECT distinct ?actor ?label  " +
                "WHERE { " +
                "    ?actor a :Person; rdfs:label ?label. " +
                "    ?assoc prov:agent ?actor. " +
                "    ?assoc prov:hadRole ?role. " +
                "    ?role a :ActorRole.  " +
                "    ?activity prov:qualifiedAssociation ?role.   " +
                "    ?episode prov:wasInfluencedBy ?activity. " +
                "    ?genre :nameGenre \"" + genere +"\"^^xsd:string. " +
                "    ?episode :hasGenre ?genre. " +
                "    ?episode a :Episode " +
                "} " +
                "		 ";

    $.ajax(urlGRAPHDB, {headers:{ Accept: 'application/sparql-results+json'},data: { query: query }}).then(function (data) {
        var res = data;
        console.log(res);
        var generi = res.results.bindings;
        
        for(var i = 0; i < generi.length; i++)
        {
            $("#dropdownAttori").append("<option><a id="+ generi[i].label.value+" href=\"#\">"+ generi[i].label.value + "</a></option>");
        }
        $("#divAttori").removeAttr("hidden");
        $("#dropdownAttori").val("");
    });   
}

function loadRegisti(genere) {
    //Prendo tutti i generi
    $("#dropdownGeneri li").remove();
    var query = "PREFIX : <http://www.purl.org/ontologies/raiontology/> " +
                "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> " +
                "PREFIX prov: <http://www.w3.org/ns/prov#> " +
                "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> " +
                "SELECT distinct ?label " +
                "	WHERE { " +
                "		?director a :Person ; rdfs:label ?label. " +
                "		?assoc prov:agent ?director. " +
                "		?assoc prov:hadRole ?role. " +
                "		?role a :DirectorRole.  " +
                "		?activity prov:qualifiedAssociation ?role. " +
                "		?programme prov:wasInfluencedBy ?activity. " +
                "		?genre :nameGenre \"" + genere +"\"^^xsd:string. " +
                "		?programme :hasSeries ?series. " +
                "		?series :hasEpisode ?episode. " +
                "		?episode :hasGenre ?genre. " +
                "		?programme :ratingProgramme ?rating. " +
                "	} ";
    $.ajax(urlGRAPHDB, {headers:{ Accept: 'application/sparql-results+json'},data: { query: query }}).then(function (data) {
        var res = data;
        console.log(res);
        var generi = res.results.bindings;
        for(var i = 0; i < generi.length; i++)
        {
            $("#dropdownRegisti").append("<option><a id="+ generi[i].label.value+" href=\"#\">"+ generi[i].label.value + "</a></option>");
        }
        $("#divRegisti").removeAttr("hidden");
        $("#dropdownRegisti").val("");
    });   
}

function loadProgrammi(genere) {
    //Prendo tutti i generi
    $("#dropdownGeneri li").remove();
    var query = "PREFIX : <http://www.purl.org/ontologies/raiontology/> " +
                "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> " +
                "PREFIX prov: <http://www.w3.org/ns/prov#> " +
                "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> " +
                "SELECT DISTINCT ?label ?labelGenre ?rating WHERE { " +
                "			?episode :hasGenre ?genre. " +
                "			?series :hasEpisode ?episode. " +
                "			?programme :hasSeries ?series. " +
                "			?programme :ratingProgramme ?rating. " +
                "			?genre rdfs:label ?labelGenre. " +
                "			?programme rdfs:label ?label. " +
                "			FILTER (?labelGenre = \"" + genere +"\") " +
                "		} ";
    $.ajax(urlGRAPHDB, {headers:{ Accept: 'application/sparql-results+json'},data: { query: query }}).then(function (data) {
        var res = data;
        console.log(res);
        var generi = res.results.bindings;
        for(var i = 0; i < generi.length; i++)
        {
            $("#dropdownProgrammi").append("<option><a id="+ generi[i].label.value+" href=\"#\">"+ generi[i].label.value + "</a></option>");
        }
        $("#divProgrammi").removeAttr("hidden");
        $("#dropdownProgrammi").val("");
    });   
}

function loadInfoProgramma(programma) {
    //Prendo tutti i generi
    $("#dropdownGeneri li").remove();
    var query = "PREFIX : <http://www.purl.org/ontologies/raiontology/> " +
                "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> " +
                "PREFIX prov: <http://www.w3.org/ns/prov#> " +
                "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> " +
                "SELECT * WHERE { " +
                "    		?programme a :Programme; rdfs:label ?label. " +
                "    		?programme :ratingProgramme ?rating. " +
                "    		?programme :country ?country. " +
                "    		?programme :yearProgramme ?year. " +
                "			FILTER (?label = \"" + programma +"\") " +
                "		} ";

    $.ajax(urlGRAPHDB, {headers:{ Accept: 'application/sparql-results+json'},data: { query: query }}).then(function (data) {
        var res = data;
        console.log(res);
        var generi = res.results.bindings;
        var paesi = "";
        for(var i = 1; i < generi.length; i++)
            paesi += "," + generi[i].country.value;            
            
        $("#tabResult").append("<tr><td colspan=\"4\">Rating : " + generi[0].rating.value + ", Anno : " +generi[0].year.value + ", Paesi : " + generi[0].country.value + "" + paesi + "</tr>")
            .append("<div id=\"divEpisodi\">Episodi : <select class=\"form-control\" id=\"dropdownEpisodi\" onchange=\"loadInfoEpisodio()\"></select></div>");
        
        loadEpisodi(programma);
        
        
    });   
    
    
}

function loadEpisodi(programma) {
    //Prendo tutti i generi
    $("#dropdownGeneri li").remove();
    var query = "PREFIX : <http://www.purl.org/ontologies/raiontology/> " +
                "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> " +
                "PREFIX prov: <http://www.w3.org/ns/prov#> " +
                "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> " +
                "SELECT distinct ?episode ?labelGenre WHERE { " +
                "			?episode :hasGenre ?genre. " +
                "			?series :hasEpisode ?episode.    		 " +
                "			?programme :hasSeries ?series. " +
                "			?programme :ratingProgramme ?rating. " +
                "			?genre rdfs:label ?labelGenre. " +
                "			?programme rdfs:label ?label. " +
                "			FILTER (?label = \"" + programma + "\") " +
                "    		FILTER (?labelGenre = \"" + $("#dropdownGeneri").val() +"\") " +
                "    		 " +
                "		} ";
    $.ajax(urlGRAPHDB, {headers:{ Accept: 'application/sparql-results+json'},data: { query: query }}).then(function (data) {
        var res = data;
        console.log(res);
        var generi = res.results.bindings;
        for(var i = 0; i < generi.length; i++)
        {
            $("#dropdownEpisodi").append("<option id="+ generi[i].episode.value+" ><a id="+ generi[i].episode.value+" href=\"#\">"+ generi[i].episode.value.split('/')[5] + "</a></option>");
        }
        //$("#divProgrammi").removeAttr("hidden");
        $("#dropdownEpisodi").val("");
        
    });   
}

function loadInfoEpisodio() {
    var episodio = $("#dropdownEpisodi").val();
    //Prendo tutti i generi
    $("#dropdownGeneri li").remove();
    var query = "PREFIX : <http://www.purl.org/ontologies/raiontology/> " +
                "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> " +
                "PREFIX prov: <http://www.w3.org/ns/prov#> " +
                "SELECT distinct ?labelActor ?data WHERE { " +
                "			:" + episodio +" a :Programme; " +
                "			:hasGenre ?genre ; " +
                "			:pubblicationDate ?data. " +
                "    		?actor a :Person; rdfs:label ?labelActor. " +
                "            ?assoc prov:agent ?actor. " +
                "            ?assoc prov:hadRole ?role. " +
                "            ?role a :ActorRole.  " +
                "            ?activity prov:qualifiedAssociation ?role.   " +
                "            :" + episodio +" prov:wasInfluencedBy ?activity. " +
                "		} ";
    $("#tabResult").append("<tr><td colspan=\"4\"><table id=\"tabResultEP\" class=\"table\"></table></td></tr>");
    
    //$("#tabResultEP").append("<tr><td id=\"" +valueSelected.replace(/\s/g, '') + "\">"  + valueSelected + "</td><td id=\"" + valueSelected.replace(/\s/g, '') + "WK\"></td><td id=\"" + valueSelected.replace(/\s/g, '') + "WD\"> </td><td id=\"" + valueSelected.replace(/\s/g, '') + "DP\"></td></tr>");
    $.ajax(urlGRAPHDB, {headers:{ Accept: 'application/sparql-results+json'},data: { query: query }}).then(function (data) {
        var res = data;
        console.log(res);
        var generi = res.results.bindings;
        var paesi = "";
        $("#tabResultEP").append("<tr><td>Data :</td><td colspan=\"3\">"+ generi[0].data.value + "</td></tr>");
        
        for(var i = 0; i < generi.length; i++)
        {
            $("#tabResultEP").append("<tr><td id=\"" +generi[i].labelActor.value.replace(/\s/g, '') + "\">"  + i + "</td><td>" + generi[i].labelActor.value+"</td><td id=\"" + generi[i].labelActor.value.replace(/\s/g, '') + "WK\"></td><td id=\"" + generi[i].labelActor.value.replace(/\s/g, '') + "WD\"> </td><td id=\"" + generi[i].labelActor.value.replace(/\s/g, '') + "DP\"></td></tr>");
            requestWikidata(generi[i].labelActor.value);
            requestDbPedia(generi[i].labelActor.value);
        }
        
        
        $("#tabResult").append("<tr><td colspan=\"4\">Rating : " + generi[0].rating.value + ", Anno : " +generi[0].year.value + ", Paesi : " + generi[0].country.value + "" + paesi + "</tr>")
           
        
        $("#tabResult").append("<tr><td colspan = id=\"" +valueSelected.replace(/\s/g, '') + "\">"  + valueSelected + "</td><td id=\"" + valueSelected.replace(/\s/g, '') + "WK\"></td><td id=\"" + valueSelected.replace(/\s/g, '') + "WD\"> </td><td id=\"" + valueSelected.replace(/\s/g, '') + "DP\"></td></tr>");
    });   
}



/*****************************************************************************************/

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