window.onload = function () {

    var updateInterval = 300;

    var xRaw,yRaw,zRaw;

    var dataPointX = [];
    var dataPointY = [];
    var dataPointZ = [];

   var accelerometerPrimaryService = "e95d0753-251d-470a-a062-fa1922dfa9a8";
   var accelerometerCharacteristic = "e95dca4b-251d-470a-a062-fa1922dfa9a8"

    document.getElementById("bt1").onclick = function (){
        navigator.bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: [accelerometerPrimaryService]})
            .then(device => device.gatt.connect())
            .then(server => {
                // Getting Battery Service...
                return server.getPrimaryService(accelerometerPrimaryService);
            })
            .then(service => {
                console.log(service)
                // Getting Battery Level Characteristic...
                return service.getCharacteristic(accelerometerCharacteristic);
            })
            .then(characteristic => characteristic.startNotifications())
            .then(characteristic => {
                setInterval(function(){updateChart()}, updateInterval);
                characteristic.addEventListener('characteristicvaluechanged',
                    accelerometerHandleCharacteristicValueChanged);
                console.log('Notifications have been started.');
            })
            .catch(error => { console.log(error.message); });

        function accelerometerHandleCharacteristicValueChanged(event) {
            var value = new Int16Array(event.target.value.buffer);
            xRaw = value[0]
            yRaw = value[1]
            zRaw = value[2]

        }
    }

    var chart = new CanvasJS.Chart("chartContainer", {
        zoomEnabled: true,
        title: {
            text: "Accelerometer Data Plot"
        },
        axisX: {
            title: "Time"
        },
        axisY:{
            prefix: "",
            includeZero: false
        },
        toolTip: {
            shared: true
        },
        legend: {
            cursor:"pointer",
            verticalAlign: "top",
            fontSize: 22,
            fontColor: "dimGrey",
            itemclick : toggleDataSeries
        },
        data: [{
            type: "line",
            xValueType: "dateTime",
            yValueFormatString: "####.00",
            xValueFormatString: "hh:mm:ss TT",
            showInLegend: true,
            name: "X",
            dataPoints: dataPointX
        },
            {
                type: "line",
                xValueType: "dateTime",
                yValueFormatString: "####.00",
                showInLegend: true,
                name: "Y" ,
                dataPoints: dataPointY
            },
            {
                type: "line",
                xValueType: "dateTime",
                yValueFormatString: "####.00",
                showInLegend: true,
                name: "Z" ,
                dataPoints: dataPointZ
            }]
    });

    function toggleDataSeries(e) {
        if (typeof(e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
            e.dataSeries.visible = false;
        }
        else {
            e.dataSeries.visible = true;
        }
        chart.render();
    }

// starting at 9.30 am

    var time = new Date();
    function updateChart() {
        time.setTime(time.getTime()+ updateInterval);

        // pushing the new values
        dataPointX.push({
            x: time.getTime(),
            y: xRaw
        });
        dataPointY.push({
            x: time.getTime(),
            y: yRaw
        });

        dataPointZ.push({
            x: time.getTime(),
            y: zRaw
        });
        // updating legend text with  updated with yRaw Value
        chart.options.data[0].legendText = "X: " + xRaw;
        chart.options.data[1].legendText = "Y: " + yRaw;
        chart.options.data[2].legendText = "Z: " + zRaw;
        chart.render();
    }

}

