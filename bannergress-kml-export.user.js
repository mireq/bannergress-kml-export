// ==UserScript==
// @name         Bannergress KML Exporter
// @namespace    https://github.com/erikchristiansson/im-kml-export/
// @version      0.1.20230102
// @description  Export KML files of mission paths, for import into Google MyMaps
// @author       Erik Christiansson, Sajjen
// @match        https://bannergress.com/banner/*
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// @grant        none
// ==/UserScript==

function save(filename, data) {
    var blob = new Blob([data], {type: 'text/csv'});
    if(window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, filename);
    }
    else{
        var elem = window.document.createElement('a');
        elem.href = window.URL.createObjectURL(blob);
        elem.download = filename;
        document.body.appendChild(elem);
        elem.click();
        document.body.removeChild(elem);
    }
}
function export_kml() {
    var banner_id = window.location.href.split('/');
    banner_id = banner_id[banner_id.length - 1];

    var url = 'https://api.bannergress.com/bnrs/' + banner_id;
    $.getJSON(url, function(data) {
        var mosaic_name = document.querySelector("div.banner-card-title").textContent;

        var kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>` + mosaic_name + `</name>
    <Style id="line-7CB342-2000-normal">
      <LineStyle>
        <color>ff42b37c</color>
        <width>2</width>
      </LineStyle>
    </Style>
    <Style id="line-7CB342-2000-highlight">
      <LineStyle>
        <color>ff42b37c</color>
        <width>3</width>
      </LineStyle>
    </Style>
    <StyleMap id="line-7CB342-2000">
      <Pair>
        <key>normal</key>
        <styleUrl>#line-7CB342-2000-normal</styleUrl>
      </Pair>
      <Pair>
        <key>highlight</key>
        <styleUrl>#line-7CB342-2000-highlight</styleUrl>
      </Pair>
    </StyleMap>`;

        data.missions.forEach((mission, index) => {
            var mission_name = mission.title || 'Mission ' + (index + 1);
            kml += `
    <Placemark>
      <name>` + mission_name + `</name>
      <description>` + window.location.href + `</description>
      <styleUrl>#line-7CB342-2000</styleUrl>
      <LineString>
        <tessellate>1</tessellate>
        <coordinates>`;

            mission.steps.forEach(step => {
                kml += step.poi.longitude + "," + step.poi.latitude + ",0\n";
            });

            kml += `        </coordinates>
      </LineString>
    </Placemark>`;
        });

        kml += `
  </Document>
</kml>`;
        save(mosaic_name + ".kml", kml);
    });

    return false;
}
(function init() {
    var button = document.querySelector("body > div#root > section > div > div > a:nth-child(5)");
    if (button) {
        var exportButton = button.cloneNode(true);
        console.log(button);
        exportButton.href = '';
        exportButton.onclick = export_kml;
        exportButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="28" width="28" viewBox="0 0 28 28" class="icon"><path d="m 7.33325,20.66675 h 13.3335 V 18.666725 H 7.33325 Z m 6.566749,-4.200052 5.266732,-5.233399 -1.400017,-1.400018 -2.833369,2.800035 V 5.9999 H 12.93332 v 6.633416 L 10.099951,9.833281 8.699934,11.233299 Z M 14,27.3335 q -2.733367,0 -5.166731,-1.050013 Q 6.399905,25.233474 4.5832156,23.416784 2.7665263,21.600095 1.7165131,19.166731 0.6665,16.733367 0.6665,14 0.6665,11.233299 1.7165131,8.799935 2.7665263,6.3665712 4.5832156,4.5665487 6.399905,2.7665263 8.833269,1.7165131 11.266633,0.6665 14,0.6665 q 2.766701,0 5.200065,1.0500131 2.433364,1.0500132 4.233386,2.8500356 1.800023,1.8000226 2.850036,4.2333863 Q 27.3335,11.233299 27.3335,14 q 0,2.733367 -1.050013,5.166731 -1.050013,2.433364 -2.850036,4.250053 -1.800022,1.81669 -4.233386,2.866703 Q 16.766701,27.3335 14,27.3335 Z"/></svg>Export`;
        document.querySelector("body > div#root > section > div > div").append(exportButton);
    } else {
        setTimeout(init, 0);
    }
})();
