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

    var data = {"OkPercent": 91.61940768746062, "KoPercent": 8.380592312539383};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9161940768746062, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9444444444444444, 500, 1500, "Get all items"], "isController": false}, {"data": [0.9014158363922391, 500, 1500, "Create an item"], "isController": false}, {"data": [0.9378620326487626, 500, 1500, "Get an item"], "isController": false}, {"data": [0.8624671916010499, 500, 1500, "Update an item"], "isController": false}, {"data": [0.9348397267472413, 500, 1500, "Delete an item"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 9522, 798, 8.380592312539383, 55.1100609115732, 14, 251, 47.0, 91.0, 120.0, 160.0, 179.548582957781, 125.97869855208077, 66.38641786128449], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get all items", 1908, 106, 5.555555555555555, 53.98846960167722, 14, 242, 48.0, 77.0, 103.0, 164.28000000000065, 35.97895570515359, 103.86175214732893, 12.156951830061661], "isController": false}, {"data": ["Create an item", 1907, 188, 9.858416360776088, 57.398007341373905, 15, 240, 48.0, 100.0, 125.59999999999991, 180.76000000000022, 36.03007859733978, 5.946370393506273, 14.35573444112757], "isController": false}, {"data": ["Get an item", 1899, 118, 6.21379673512375, 48.95471300684578, 21, 240, 42.0, 73.0, 107.0, 142.0, 35.98090113304786, 4.497612641630982, 12.33329716572246], "isController": false}, {"data": ["Update an item", 1905, 262, 13.753280839895012, 62.39947506561676, 20, 251, 51.0, 116.0, 134.0, 176.82000000000016, 36.05155087905225, 5.879500973439185, 14.610735951959652], "isController": false}, {"data": ["Delete an item", 1903, 124, 6.51602732527588, 52.78717813977933, 21, 213, 46.0, 75.0, 113.0, 148.8800000000001, 35.98714069591528, 5.868996578337746, 13.108597148023827], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 178 milliseconds, but should not have lasted longer than 100 milliseconds.", 2, 0.2506265664160401, 0.021003990758244065], "isController": false}, {"data": ["The operation lasted too long: It took 136 milliseconds, but should not have lasted longer than 100 milliseconds.", 13, 1.6290726817042607, 0.13652593992858644], "isController": false}, {"data": ["The operation lasted too long: It took 193 milliseconds, but should not have lasted longer than 100 milliseconds.", 3, 0.37593984962406013, 0.0315059861373661], "isController": false}, {"data": ["The operation lasted too long: It took 168 milliseconds, but should not have lasted longer than 100 milliseconds.", 4, 0.5012531328320802, 0.04200798151648813], "isController": false}, {"data": ["The operation lasted too long: It took 213 milliseconds, but should not have lasted longer than 100 milliseconds.", 2, 0.2506265664160401, 0.021003990758244065], "isController": false}, {"data": ["The operation lasted too long: It took 188 milliseconds, but should not have lasted longer than 100 milliseconds.", 1, 0.12531328320802004, 0.010501995379122032], "isController": false}, {"data": ["The operation lasted too long: It took 161 milliseconds, but should not have lasted longer than 100 milliseconds.", 1, 0.12531328320802004, 0.010501995379122032], "isController": false}, {"data": ["The operation lasted too long: It took 126 milliseconds, but should not have lasted longer than 100 milliseconds.", 7, 0.8771929824561403, 0.07351396765385423], "isController": false}, {"data": ["The operation lasted too long: It took 114 milliseconds, but should not have lasted longer than 100 milliseconds.", 15, 1.8796992481203008, 0.1575299306868305], "isController": false}, {"data": ["The operation lasted too long: It took 183 milliseconds, but should not have lasted longer than 100 milliseconds.", 1, 0.12531328320802004, 0.010501995379122032], "isController": false}, {"data": ["The operation lasted too long: It took 141 milliseconds, but should not have lasted longer than 100 milliseconds.", 9, 1.1278195488721805, 0.0945179584120983], "isController": false}, {"data": ["The operation lasted too long: It took 146 milliseconds, but should not have lasted longer than 100 milliseconds.", 6, 0.7518796992481203, 0.0630119722747322], "isController": false}, {"data": ["The operation lasted too long: It took 151 milliseconds, but should not have lasted longer than 100 milliseconds.", 7, 0.8771929824561403, 0.07351396765385423], "isController": false}, {"data": ["The operation lasted too long: It took 104 milliseconds, but should not have lasted longer than 100 milliseconds.", 17, 2.130325814536341, 0.17853392144507457], "isController": false}, {"data": ["The operation lasted too long: It took 109 milliseconds, but should not have lasted longer than 100 milliseconds.", 13, 1.6290726817042607, 0.13652593992858644], "isController": false}, {"data": ["The operation lasted too long: It took 148 milliseconds, but should not have lasted longer than 100 milliseconds.", 4, 0.5012531328320802, 0.04200798151648813], "isController": false}, {"data": ["The operation lasted too long: It took 106 milliseconds, but should not have lasted longer than 100 milliseconds.", 13, 1.6290726817042607, 0.13652593992858644], "isController": false}, {"data": ["The operation lasted too long: It took 181 milliseconds, but should not have lasted longer than 100 milliseconds.", 1, 0.12531328320802004, 0.010501995379122032], "isController": false}, {"data": ["The operation lasted too long: It took 225 milliseconds, but should not have lasted longer than 100 milliseconds.", 1, 0.12531328320802004, 0.010501995379122032], "isController": false}, {"data": ["The operation lasted too long: It took 228 milliseconds, but should not have lasted longer than 100 milliseconds.", 2, 0.2506265664160401, 0.021003990758244065], "isController": false}, {"data": ["The operation lasted too long: It took 138 milliseconds, but should not have lasted longer than 100 milliseconds.", 8, 1.0025062656641603, 0.08401596303297626], "isController": false}, {"data": ["The operation lasted too long: It took 171 milliseconds, but should not have lasted longer than 100 milliseconds.", 2, 0.2506265664160401, 0.021003990758244065], "isController": false}, {"data": ["The operation lasted too long: It took 203 milliseconds, but should not have lasted longer than 100 milliseconds.", 1, 0.12531328320802004, 0.010501995379122032], "isController": false}, {"data": ["The operation lasted too long: It took 158 milliseconds, but should not have lasted longer than 100 milliseconds.", 1, 0.12531328320802004, 0.010501995379122032], "isController": false}, {"data": ["The operation lasted too long: It took 116 milliseconds, but should not have lasted longer than 100 milliseconds.", 23, 2.882205513784461, 0.24154589371980675], "isController": false}, {"data": ["The operation lasted too long: It took 119 milliseconds, but should not have lasted longer than 100 milliseconds.", 11, 1.3784461152882206, 0.11552194917034236], "isController": false}, {"data": ["The operation lasted too long: It took 220 milliseconds, but should not have lasted longer than 100 milliseconds.", 2, 0.2506265664160401, 0.021003990758244065], "isController": false}, {"data": ["The operation lasted too long: It took 143 milliseconds, but should not have lasted longer than 100 milliseconds.", 9, 1.1278195488721805, 0.0945179584120983], "isController": false}, {"data": ["The operation lasted too long: It took 139 milliseconds, but should not have lasted longer than 100 milliseconds.", 10, 1.2531328320802004, 0.10501995379122034], "isController": false}, {"data": ["The operation lasted too long: It took 164 milliseconds, but should not have lasted longer than 100 milliseconds.", 1, 0.12531328320802004, 0.010501995379122032], "isController": false}, {"data": ["The operation lasted too long: It took 129 milliseconds, but should not have lasted longer than 100 milliseconds.", 16, 2.0050125313283207, 0.16803192606595252], "isController": false}, {"data": ["The operation lasted too long: It took 251 milliseconds, but should not have lasted longer than 100 milliseconds.", 1, 0.12531328320802004, 0.010501995379122032], "isController": false}, {"data": ["The operation lasted too long: It took 230 milliseconds, but should not have lasted longer than 100 milliseconds.", 2, 0.2506265664160401, 0.021003990758244065], "isController": false}, {"data": ["The operation lasted too long: It took 123 milliseconds, but should not have lasted longer than 100 milliseconds.", 13, 1.6290726817042607, 0.13652593992858644], "isController": false}, {"data": ["The operation lasted too long: It took 144 milliseconds, but should not have lasted longer than 100 milliseconds.", 6, 0.7518796992481203, 0.0630119722747322], "isController": false}, {"data": ["The operation lasted too long: It took 149 milliseconds, but should not have lasted longer than 100 milliseconds.", 8, 1.0025062656641603, 0.08401596303297626], "isController": false}, {"data": ["The operation lasted too long: It took 210 milliseconds, but should not have lasted longer than 100 milliseconds.", 1, 0.12531328320802004, 0.010501995379122032], "isController": false}, {"data": ["The operation lasted too long: It took 154 milliseconds, but should not have lasted longer than 100 milliseconds.", 7, 0.8771929824561403, 0.07351396765385423], "isController": false}, {"data": ["The operation lasted too long: It took 133 milliseconds, but should not have lasted longer than 100 milliseconds.", 14, 1.7543859649122806, 0.14702793530770847], "isController": false}, {"data": ["The operation lasted too long: It took 169 milliseconds, but should not have lasted longer than 100 milliseconds.", 4, 0.5012531328320802, 0.04200798151648813], "isController": false}, {"data": ["The operation lasted too long: It took 124 milliseconds, but should not have lasted longer than 100 milliseconds.", 14, 1.7543859649122806, 0.14702793530770847], "isController": false}, {"data": ["The operation lasted too long: It took 217 milliseconds, but should not have lasted longer than 100 milliseconds.", 2, 0.2506265664160401, 0.021003990758244065], "isController": false}, {"data": ["The operation lasted too long: It took 134 milliseconds, but should not have lasted longer than 100 milliseconds.", 13, 1.6290726817042607, 0.13652593992858644], "isController": false}, {"data": ["The operation lasted too long: It took 159 milliseconds, but should not have lasted longer than 100 milliseconds.", 2, 0.2506265664160401, 0.021003990758244065], "isController": false}, {"data": ["The operation lasted too long: It took 221 milliseconds, but should not have lasted longer than 100 milliseconds.", 2, 0.2506265664160401, 0.021003990758244065], "isController": false}, {"data": ["The operation lasted too long: It took 207 milliseconds, but should not have lasted longer than 100 milliseconds.", 3, 0.37593984962406013, 0.0315059861373661], "isController": false}, {"data": ["The operation lasted too long: It took 173 milliseconds, but should not have lasted longer than 100 milliseconds.", 3, 0.37593984962406013, 0.0315059861373661], "isController": false}, {"data": ["The operation lasted too long: It took 192 milliseconds, but should not have lasted longer than 100 milliseconds.", 2, 0.2506265664160401, 0.021003990758244065], "isController": false}, {"data": ["The operation lasted too long: It took 153 milliseconds, but should not have lasted longer than 100 milliseconds.", 5, 0.6265664160401002, 0.05250997689561017], "isController": false}, {"data": ["The operation lasted too long: It took 105 milliseconds, but should not have lasted longer than 100 milliseconds.", 18, 2.255639097744361, 0.1890359168241966], "isController": false}, {"data": ["The operation lasted too long: It took 179 milliseconds, but should not have lasted longer than 100 milliseconds.", 1, 0.12531328320802004, 0.010501995379122032], "isController": false}, {"data": ["The operation lasted too long: It took 198 milliseconds, but should not have lasted longer than 100 milliseconds.", 1, 0.12531328320802004, 0.010501995379122032], "isController": false}, {"data": ["The operation lasted too long: It took 163 milliseconds, but should not have lasted longer than 100 milliseconds.", 2, 0.2506265664160401, 0.021003990758244065], "isController": false}, {"data": ["The operation lasted too long: It took 240 milliseconds, but should not have lasted longer than 100 milliseconds.", 2, 0.2506265664160401, 0.021003990758244065], "isController": false}, {"data": ["The operation lasted too long: It took 211 milliseconds, but should not have lasted longer than 100 milliseconds.", 3, 0.37593984962406013, 0.0315059861373661], "isController": false}, {"data": ["The operation lasted too long: It took 202 milliseconds, but should not have lasted longer than 100 milliseconds.", 1, 0.12531328320802004, 0.010501995379122032], "isController": false}, {"data": ["The operation lasted too long: It took 157 milliseconds, but should not have lasted longer than 100 milliseconds.", 4, 0.5012531328320802, 0.04200798151648813], "isController": false}, {"data": ["The operation lasted too long: It took 140 milliseconds, but should not have lasted longer than 100 milliseconds.", 7, 0.8771929824561403, 0.07351396765385423], "isController": false}, {"data": ["The operation lasted too long: It took 115 milliseconds, but should not have lasted longer than 100 milliseconds.", 12, 1.5037593984962405, 0.1260239445494644], "isController": false}, {"data": ["The operation lasted too long: It took 172 milliseconds, but should not have lasted longer than 100 milliseconds.", 2, 0.2506265664160401, 0.021003990758244065], "isController": false}, {"data": ["The operation lasted too long: It took 167 milliseconds, but should not have lasted longer than 100 milliseconds.", 1, 0.12531328320802004, 0.010501995379122032], "isController": false}, {"data": ["The operation lasted too long: It took 182 milliseconds, but should not have lasted longer than 100 milliseconds.", 5, 0.6265664160401002, 0.05250997689561017], "isController": false}, {"data": ["The operation lasted too long: It took 147 milliseconds, but should not have lasted longer than 100 milliseconds.", 4, 0.5012531328320802, 0.04200798151648813], "isController": false}, {"data": ["The operation lasted too long: It took 162 milliseconds, but should not have lasted longer than 100 milliseconds.", 4, 0.5012531328320802, 0.04200798151648813], "isController": false}, {"data": ["The operation lasted too long: It took 212 milliseconds, but should not have lasted longer than 100 milliseconds.", 1, 0.12531328320802004, 0.010501995379122032], "isController": false}, {"data": ["The operation lasted too long: It took 189 milliseconds, but should not have lasted longer than 100 milliseconds.", 2, 0.2506265664160401, 0.021003990758244065], "isController": false}, {"data": ["The operation lasted too long: It took 125 milliseconds, but should not have lasted longer than 100 milliseconds.", 6, 0.7518796992481203, 0.0630119722747322], "isController": false}, {"data": ["The operation lasted too long: It took 130 milliseconds, but should not have lasted longer than 100 milliseconds.", 16, 2.0050125313283207, 0.16803192606595252], "isController": false}, {"data": ["The operation lasted too long: It took 103 milliseconds, but should not have lasted longer than 100 milliseconds.", 18, 2.255639097744361, 0.1890359168241966], "isController": false}, {"data": ["The operation lasted too long: It took 110 milliseconds, but should not have lasted longer than 100 milliseconds.", 12, 1.5037593984962405, 0.1260239445494644], "isController": false}, {"data": ["The operation lasted too long: It took 184 milliseconds, but should not have lasted longer than 100 milliseconds.", 1, 0.12531328320802004, 0.010501995379122032], "isController": false}, {"data": ["The operation lasted too long: It took 194 milliseconds, but should not have lasted longer than 100 milliseconds.", 2, 0.2506265664160401, 0.021003990758244065], "isController": false}, {"data": ["The operation lasted too long: It took 155 milliseconds, but should not have lasted longer than 100 milliseconds.", 8, 1.0025062656641603, 0.08401596303297626], "isController": false}, {"data": ["The operation lasted too long: It took 200 milliseconds, but should not have lasted longer than 100 milliseconds.", 1, 0.12531328320802004, 0.010501995379122032], "isController": false}, {"data": ["The operation lasted too long: It took 120 milliseconds, but should not have lasted longer than 100 milliseconds.", 28, 3.508771929824561, 0.29405587061541694], "isController": false}, {"data": ["The operation lasted too long: It took 242 milliseconds, but should not have lasted longer than 100 milliseconds.", 1, 0.12531328320802004, 0.010501995379122032], "isController": false}, {"data": ["The operation lasted too long: It took 152 milliseconds, but should not have lasted longer than 100 milliseconds.", 1, 0.12531328320802004, 0.010501995379122032], "isController": false}, {"data": ["The operation lasted too long: It took 135 milliseconds, but should not have lasted longer than 100 milliseconds.", 16, 2.0050125313283207, 0.16803192606595252], "isController": false}, {"data": ["The operation lasted too long: It took 174 milliseconds, but should not have lasted longer than 100 milliseconds.", 2, 0.2506265664160401, 0.021003990758244065], "isController": false}, {"data": ["The operation lasted too long: It took 132 milliseconds, but should not have lasted longer than 100 milliseconds.", 11, 1.3784461152882206, 0.11552194917034236], "isController": false}, {"data": ["The operation lasted too long: It took 177 milliseconds, but should not have lasted longer than 100 milliseconds.", 3, 0.37593984962406013, 0.0315059861373661], "isController": false}, {"data": ["The operation lasted too long: It took 113 milliseconds, but should not have lasted longer than 100 milliseconds.", 20, 2.506265664160401, 0.21003990758244068], "isController": false}, {"data": ["The operation lasted too long: It took 145 milliseconds, but should not have lasted longer than 100 milliseconds.", 10, 1.2531328320802004, 0.10501995379122034], "isController": false}, {"data": ["The operation lasted too long: It took 142 milliseconds, but should not have lasted longer than 100 milliseconds.", 10, 1.2531328320802004, 0.10501995379122034], "isController": false}, {"data": ["The operation lasted too long: It took 101 milliseconds, but should not have lasted longer than 100 milliseconds.", 15, 1.8796992481203008, 0.1575299306868305], "isController": false}, {"data": ["The operation lasted too long: It took 175 milliseconds, but should not have lasted longer than 100 milliseconds.", 1, 0.12531328320802004, 0.010501995379122032], "isController": false}, {"data": ["The operation lasted too long: It took 118 milliseconds, but should not have lasted longer than 100 milliseconds.", 21, 2.6315789473684212, 0.2205419029615627], "isController": false}, {"data": ["The operation lasted too long: It took 122 milliseconds, but should not have lasted longer than 100 milliseconds.", 8, 1.0025062656641603, 0.08401596303297626], "isController": false}, {"data": ["The operation lasted too long: It took 196 milliseconds, but should not have lasted longer than 100 milliseconds.", 2, 0.2506265664160401, 0.021003990758244065], "isController": false}, {"data": ["The operation lasted too long: It took 185 milliseconds, but should not have lasted longer than 100 milliseconds.", 2, 0.2506265664160401, 0.021003990758244065], "isController": false}, {"data": ["The operation lasted too long: It took 190 milliseconds, but should not have lasted longer than 100 milliseconds.", 1, 0.12531328320802004, 0.010501995379122032], "isController": false}, {"data": ["The operation lasted too long: It took 111 milliseconds, but should not have lasted longer than 100 milliseconds.", 17, 2.130325814536341, 0.17853392144507457], "isController": false}, {"data": ["The operation lasted too long: It took 117 milliseconds, but should not have lasted longer than 100 milliseconds.", 14, 1.7543859649122806, 0.14702793530770847], "isController": false}, {"data": ["The operation lasted too long: It took 215 milliseconds, but should not have lasted longer than 100 milliseconds.", 1, 0.12531328320802004, 0.010501995379122032], "isController": false}, {"data": ["The operation lasted too long: It took 165 milliseconds, but should not have lasted longer than 100 milliseconds.", 2, 0.2506265664160401, 0.021003990758244065], "isController": false}, {"data": ["The operation lasted too long: It took 107 milliseconds, but should not have lasted longer than 100 milliseconds.", 21, 2.6315789473684212, 0.2205419029615627], "isController": false}, {"data": ["The operation lasted too long: It took 112 milliseconds, but should not have lasted longer than 100 milliseconds.", 20, 2.506265664160401, 0.21003990758244068], "isController": false}, {"data": ["The operation lasted too long: It took 128 milliseconds, but should not have lasted longer than 100 milliseconds.", 10, 1.2531328320802004, 0.10501995379122034], "isController": false}, {"data": ["The operation lasted too long: It took 249 milliseconds, but should not have lasted longer than 100 milliseconds.", 1, 0.12531328320802004, 0.010501995379122032], "isController": false}, {"data": ["The operation lasted too long: It took 170 milliseconds, but should not have lasted longer than 100 milliseconds.", 2, 0.2506265664160401, 0.021003990758244065], "isController": false}, {"data": ["The operation lasted too long: It took 131 milliseconds, but should not have lasted longer than 100 milliseconds.", 12, 1.5037593984962405, 0.1260239445494644], "isController": false}, {"data": ["The operation lasted too long: It took 127 milliseconds, but should not have lasted longer than 100 milliseconds.", 19, 2.380952380952381, 0.19953791220331862], "isController": false}, {"data": ["The operation lasted too long: It took 176 milliseconds, but should not have lasted longer than 100 milliseconds.", 1, 0.12531328320802004, 0.010501995379122032], "isController": false}, {"data": ["The operation lasted too long: It took 102 milliseconds, but should not have lasted longer than 100 milliseconds.", 20, 2.506265664160401, 0.21003990758244068], "isController": false}, {"data": ["The operation lasted too long: It took 156 milliseconds, but should not have lasted longer than 100 milliseconds.", 5, 0.6265664160401002, 0.05250997689561017], "isController": false}, {"data": ["The operation lasted too long: It took 108 milliseconds, but should not have lasted longer than 100 milliseconds.", 15, 1.8796992481203008, 0.1575299306868305], "isController": false}, {"data": ["The operation lasted too long: It took 224 milliseconds, but should not have lasted longer than 100 milliseconds.", 1, 0.12531328320802004, 0.010501995379122032], "isController": false}, {"data": ["The operation lasted too long: It took 150 milliseconds, but should not have lasted longer than 100 milliseconds.", 6, 0.7518796992481203, 0.0630119722747322], "isController": false}, {"data": ["The operation lasted too long: It took 121 milliseconds, but should not have lasted longer than 100 milliseconds.", 24, 3.007518796992481, 0.2520478890989288], "isController": false}, {"data": ["The operation lasted too long: It took 160 milliseconds, but should not have lasted longer than 100 milliseconds.", 3, 0.37593984962406013, 0.0315059861373661], "isController": false}, {"data": ["The operation lasted too long: It took 137 milliseconds, but should not have lasted longer than 100 milliseconds.", 9, 1.1278195488721805, 0.0945179584120983], "isController": false}, {"data": ["The operation lasted too long: It took 195 milliseconds, but should not have lasted longer than 100 milliseconds.", 1, 0.12531328320802004, 0.010501995379122032], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 9522, 798, "The operation lasted too long: It took 120 milliseconds, but should not have lasted longer than 100 milliseconds.", 28, "The operation lasted too long: It took 121 milliseconds, but should not have lasted longer than 100 milliseconds.", 24, "The operation lasted too long: It took 116 milliseconds, but should not have lasted longer than 100 milliseconds.", 23, "The operation lasted too long: It took 118 milliseconds, but should not have lasted longer than 100 milliseconds.", 21, "The operation lasted too long: It took 107 milliseconds, but should not have lasted longer than 100 milliseconds.", 21], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Get all items", 1908, 106, "The operation lasted too long: It took 103 milliseconds, but should not have lasted longer than 100 milliseconds.", 7, "The operation lasted too long: It took 115 milliseconds, but should not have lasted longer than 100 milliseconds.", 5, "The operation lasted too long: It took 105 milliseconds, but should not have lasted longer than 100 milliseconds.", 4, "The operation lasted too long: It took 136 milliseconds, but should not have lasted longer than 100 milliseconds.", 3, "The operation lasted too long: It took 109 milliseconds, but should not have lasted longer than 100 milliseconds.", 3], "isController": false}, {"data": ["Create an item", 1907, 188, "The operation lasted too long: It took 130 milliseconds, but should not have lasted longer than 100 milliseconds.", 7, "The operation lasted too long: It took 120 milliseconds, but should not have lasted longer than 100 milliseconds.", 7, "The operation lasted too long: It took 113 milliseconds, but should not have lasted longer than 100 milliseconds.", 7, "The operation lasted too long: It took 112 milliseconds, but should not have lasted longer than 100 milliseconds.", 7, "The operation lasted too long: It took 124 milliseconds, but should not have lasted longer than 100 milliseconds.", 7], "isController": false}, {"data": ["Get an item", 1899, 118, "The operation lasted too long: It took 107 milliseconds, but should not have lasted longer than 100 milliseconds.", 7, "The operation lasted too long: It took 121 milliseconds, but should not have lasted longer than 100 milliseconds.", 7, "The operation lasted too long: It took 102 milliseconds, but should not have lasted longer than 100 milliseconds.", 6, "The operation lasted too long: It took 104 milliseconds, but should not have lasted longer than 100 milliseconds.", 5, "The operation lasted too long: It took 127 milliseconds, but should not have lasted longer than 100 milliseconds.", 5], "isController": false}, {"data": ["Update an item", 1905, 262, "The operation lasted too long: It took 121 milliseconds, but should not have lasted longer than 100 milliseconds.", 10, "The operation lasted too long: It took 118 milliseconds, but should not have lasted longer than 100 milliseconds.", 9, "The operation lasted too long: It took 120 milliseconds, but should not have lasted longer than 100 milliseconds.", 8, "The operation lasted too long: It took 135 milliseconds, but should not have lasted longer than 100 milliseconds.", 8, "The operation lasted too long: It took 116 milliseconds, but should not have lasted longer than 100 milliseconds.", 8], "isController": false}, {"data": ["Delete an item", 1903, 124, "The operation lasted too long: It took 120 milliseconds, but should not have lasted longer than 100 milliseconds.", 6, "The operation lasted too long: It took 116 milliseconds, but should not have lasted longer than 100 milliseconds.", 6, "The operation lasted too long: It took 118 milliseconds, but should not have lasted longer than 100 milliseconds.", 5, "The operation lasted too long: It took 127 milliseconds, but should not have lasted longer than 100 milliseconds.", 5, "The operation lasted too long: It took 136 milliseconds, but should not have lasted longer than 100 milliseconds.", 4], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
