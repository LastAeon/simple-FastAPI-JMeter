/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 96.53671804170445, "KoPercent": 3.4632819582955574};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9650045330915684, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "Get an item-1"], "isController": false}, {"data": [0.9422241529105126, 500, 1500, "Get all items"], "isController": false}, {"data": [0.9754990925589837, 500, 1500, "Create an item"], "isController": false}, {"data": [0.9710820895522388, 500, 1500, "Get an item"], "isController": false}, {"data": [0.9778801843317972, 500, 1500, "Update an item"], "isController": false}, {"data": [0.9682027649769586, 500, 1500, "Delete an item"], "isController": false}, {"data": [1.0, 500, 1500, "Get an item-0"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 5515, 191, 3.4632819582955574, 1051.190208522212, 1, 30126, 141.0, 218.0, 260.1999999999998, 30009.84, 61.30298011404688, 31.542318526088504, 21.966387396763114], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get an item-1", 10, 10, 100.0, 30008.2, 30000, 30012, 30009.0, 30012.0, 30012.0, 30012.0, 0.3257859586251832, 1.0196718724547973, 0.0], "isController": false}, {"data": ["Get all items", 1151, 66, 5.734144222415291, 1833.1077324066025, 4, 30016, 138.0, 215.0, 30001.0, 30012.0, 13.43935360328803, 22.14182491622297, 4.280642288134604], "isController": false}, {"data": ["Create an item", 1102, 27, 2.4500907441016335, 863.8466424682398, 4, 30012, 147.0, 228.70000000000005, 265.8499999999999, 30007.97, 12.25424784271862, 2.75830473406503, 4.762924923271951], "isController": false}, {"data": ["Get an item", 1072, 31, 2.8917910447761193, 981.7154850746269, 3, 30126, 136.5, 200.0, 232.3499999999999, 30013.27, 12.461638612480238, 2.5388876759683345, 4.178124073659676], "isController": false}, {"data": ["Update an item", 1085, 23, 2.119815668202765, 492.8728110599078, 1, 30015, 151.0, 228.0, 254.4000000000001, 30000.0, 19.445838411355655, 3.717486888621048, 7.756492400888953], "isController": false}, {"data": ["Delete an item", 1085, 34, 3.133640552995392, 781.4884792626726, 1, 30015, 139.0, 206.0, 231.0, 30003.0, 12.677899558318337, 2.74272088830011, 4.506106442505434], "isController": false}, {"data": ["Get an item-0", 10, 0, 0.0, 28.5, 1, 115, 11.0, 115.0, 115.0, 115.0, 14.556040756914118, 2.075372998544396, 4.932564592430858], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: headers expected to contain /200 OK/", 20, 10.471204188481675, 0.3626473254759746], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 171, 89.52879581151832, 3.100634632819583], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 5515, 191, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 171, "Test failed: headers expected to contain /200 OK/", 20, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Get an item-1", 10, 10, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 10, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Get all items", 1151, 66, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 66, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Create an item", 1102, 27, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 27, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Get an item", 1072, 31, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 31, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Update an item", 1085, 23, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 13, "Test failed: headers expected to contain /200 OK/", 10, null, null, null, null, null, null], "isController": false}, {"data": ["Delete an item", 1085, 34, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 24, "Test failed: headers expected to contain /200 OK/", 10, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
