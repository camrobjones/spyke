const stimulus_default = {
    delay:5,
    dur: 1,
    amp: 0.1
}

Vue.config.delimiters = ["[[", "]]"]

var app = new Vue({
    el: '#app',
    delimiters: ['[[', ']]'],
    data: {
        settingsTab: 'simulation',
        monitorTab: '',
        neuron:
            {'gid': 0,
             'name': 'neuron_0',
            'soma':
                {
                    'L': 12.6157,
                    'diam': 12.6157,
                    'gnabar': 0.12,
                    'gkbar': 0.036,
                    'gl': 0.0003,
                    'el': -54.3
                },
            'dend':
                {
                    'L': 200,
                    'diam': 1,
                    'g': 0.001,
                    'e': -65
                },
            'general':
                {
                    'Ra': 100,
                    'cm': 1
                },
            'synapse':
                {
                    'tau': 2
                }
            },
        time: 25,
        potential: -65,
        stimuli: [
            {
            delay:5,
            dur: 1,
            amp: 0.1
            }
        ],
        recording: {},
        monitor: false,
        views: []
    },
    mounted() {

    },
    filters: {

    },
    methods: {
        changeSettingsTab: function(tabname) {
            this.settingsTab = tabname;
        },

        changeMonitorTab: function(tabname) {
            this.monitorTab = tabname;
            this.drawChart(tabname);
        },

        addStimulus: function() {
            let copy = Object.assign({},stimulus_default);
            this.stimuli.push(copy);
        },

        removeStimulus: function(index) {
            console.log(`removing ${index}`);
            this.stimuli.splice(index,1);
        },

        runSimulation: function() {
            console.log('running simulation')

            let url = '/spyke/simulation'
            let csrftoken = Cookies.get('csrftoken');
            let headers = {'X-CSRFToken': csrftoken};

            let data = {'time': this.time,
                        'potential': this.potential,
                        'stimuli': this.stimuli,
                        'neuron': this.neuron
                        }
            console.log(data)
            axios.post(url,data,{headers: headers})
              .then(response => {
                  console.log(response.data)
                  app.views = Object.keys(response.data[0])
                  app.recording = response.data;
                  app.changeMonitorTab("Soma voltage")
            });
        },

        drawChart: function(view) {
            console.log(`plottihg new chart: ${view}`)
            var ctx = document.getElementById('monitor-canvas');
            ctx.height = "300px"
            if (this.monitor) {
                this.monitor.destroy();
            }
            let yData = this.recording[0][view]
            var yLabel = "Soma Voltage (mV)";

            this.monitor = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: this.recording.t,
                    datasets: [{
                        label: yLabel,
                        data: yData,
                        fill: false,
                        borderColor:"rgb(75, 192, 192)",
                        lineTension:0.1
                    }],
                    options: {
                        maintainAspectRatio: false,
                        scales: {
                           yAxes: [{
                             scaleLabel: {
                               display: true,
                               labelString: yLabel
                             }
                           }]
                        }
                    }
                }
            });
        }
    }
});

// Keep track of co-ordinates in the neuron canvas
function updateCoords(event) {
    let tf = pz.getTransform();
    let canvas = $('#svg-canvas').offset();
    let clientX = event.pageX;
    let clientY = event.pageY;
    let relX = clientX - canvas.left;
    let relY = clientY - canvas.top;
    let scaledX = ((relX - tf.x) /tf.scale).toFixed(1)
    let scaledY = ((relY - tf.y) /tf.scale).toFixed(1)
    $('#canvas-coords').text(`(${scaledX},${scaledY})`)
}

var pz = "";

window.onload = function() {
    // Make neurons draggable
    $('.neuron-container').draggable({
        containment: "parent",
        scroll: "false",
        cursor: "crosshair"
    })
      .bind('mousedown', function(event, ui){
        // bring target to front
        $(event.target.parentElement).append( event.target );
      })
      .bind('drag', function(event, ui){
        let container = $('#canvas-container');
        let containerOffset = container.offset();
        
        let targetBox = event.target.getBBox();
        let targetWidth = targetBox.width;
        let targetHeight = targetBox.height;

        let tf = pz.getTransform();

        let rawX = event.pageX
        let rawY = event.pageY

        let relX = rawX - containerOffset.left
        let relY = rawY - containerOffset.top

        let scaledX = (relX - tf.x) / tf.scale
        let scaledY = (relY - tf.y) / tf.scale

        scaledX = scaledX - (2 * targetWidth)
        scaledY = scaledY - (targetHeight/2)

        event.target.setAttribute('x', scaledX);
        event.target.setAttribute('y', scaledY);

      });

    // Create panzoom in neuron canvas
    var element = document.querySelector('#svg-canvas-inner')

    // And pass it to panzoom
    pz = panzoom(element, {
        maxZoom: 5,
        minZoom: 0.1,
        zoomSpeed: 0.02,
        bounds: true,
        boundsPadding: 0.2,
        // Prevent panzoom panning while dragging neuron
        beforeMouseDown: function(e) {
        if (e.target.parentElement.classList.contains('neuron-container')) {
            return true;
        }
        return false;
  }

    })
}
