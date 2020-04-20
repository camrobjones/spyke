const stimulus_default = {
    delay:5,
    dur: 1,
    amp: 0.1,
    neuron: 0,
    section: 'dendrite-1',
    loc: 0.5,
}

const connectionDefault = {
    gid: 0,
    source: 0,
    target: 0,
    delay: 5,
    section: 'dendrite-1',
    loc: 0.5,
    weight: 0.05,
    threshold: 10,
    tau: 2
}

const dendriteDefault = {
    gid: 0,
    L: 200,
    diam: 1,
    g: 0.001,
    e: -65
}

const colorDict = {
        purple:  '#b10dc9',
        orange:  '#ff851b',
        navy:    '#001f3f',
        olive:   '#3d9970',
        yellow:  '#ffdc00',
        blue:    '#0074d9',
        silver:  '#dddddd',
        red:     '#ff4136',
        aqua:    '#7fdbff',
        fuchsia: '#f012be',
        lime:    '#01ff70',
        maroon:  '#85144b',
        teal:    '#39cccc',
        green:   '#2ecc40',
        gray:    '#aaaaaa',
        white:   '#ffffff',
        black:   '#111111',
        
}

const colors = Object.values(colorDict)

Vue.config.delimiters = ["[[", "]]"]

var app = new Vue({
    el: '#app',
    delimiters: ['[[', ']]'],
    data: {
        settingsTab: 'simulation',
        monitorTab: '',
        neurons: [],
        neuronGid: 0,
        connectionGid:0,
        dendriteGid:1,
        svgData:{},
        simulation: {
            'time': 25,
            'potential': -65
        },
        stimuli: [
            {
            delay:5,
            dur: 1,
            amp: 0.1,
            neuron: 1,
            section: "dendrite-1",
            loc: 0.5
            }
        ],
        stimulusOptions: [
            {'label': 'Delay (ms)',
             'helptext': 'Time before stimulus onset',
             'attribute': 'delay'},
             {'label': 'Duration (ms)',
             'helptext': 'Duration of stimulus',
             'attribute': 'dur'},
             {'label': 'Amp (nA)',
             'helptext': 'Amplitude of stimulus',
             'attribute': 'amp',
             'step': 0.1},
             ],
        sectionOptions: [
            {'label': 'Length',
             'helptext': 'Microns',
             'attribute': 'L'},
             {'label': 'Diameter (ms)',
             'helptext': 'Microns',
             'attribute': 'diam'},
             {'label': 'Passive conductance',
             'helptext': 'S/cm2',
             'attribute': 'g',
             'step': 0.001},
             {'label': 'Reversal Potential',
             'helptext': 'mV',
             'attribute': 'e'}
             ],
        stimulusTypes: ['IClamp', 'VClamp', 'SEClamp'],
        connectionOptions: [
            {'label': 'Delay (ms)',
             'helptext': 'Time between threshold crossing and event delivery',
             'attribute': 'delay'},
             {'label': 'Weight',
             'helptext': 'Weight delivered to target',
             'attribute': 'weight'},
             {'label': 'Threshold (mV)',
             'helptext': 'Voltage at which event triggered',
             'attribute': 'threshold'},
             {'label': 'Tau (ms)',
             'helptext': 'Decay time constant of synapse',
             'attribute': 'tau'}
             ],
        simulationOptions: [
            {'label': 'Time (ms)',
             'helptext': 'Time for simulation to run',
             'attribute': 'time'},
             {'label': 'Membrane Potential (mV)',
             'helptext': 'Initial voltage of membranes',
             'attribute': 'potential'}
             ],
        connections: [],
        recording: {},
        monitor: false,
        views: [],
        neuronTemplate: {}
    },
    filters: {

    },
    methods: {
        changeSettingsTab: function(tabname) {
            this.settingsTab = tabname;
        },

        neuron: function() {
            var neuron = {'open':false,
                     'gid': 0,
                     'name': 'neuron_0', 
                    'soma':
                        {
                            'L': 12,
                            'diam': 12,
                            'gnabar': 0.12,
                            'gkbar': 0.036,
                            'gl': 0.0003,
                            'el': -54.3
                        },
                    'dendrites': [
                        {
                            'gid': 1,
                            'L': 200,
                            'diam': 1,
                            'g': 0.001,
                            'e': -65
                        }
                        ],
                    'axon': {
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
                    }
            return neuron
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

        addConnection: function() {
            let copy = Object.assign({},connectionDefault);
            this.connectionGid += 1;
            copy.gid = this.connectionGid;
            this.connections.push(copy);
        },

        removeConnection: function(index) {
            console.log(`removing connection ${index}`);
            let connection = this.connections[index];
            $('#connection-' + connection.gid).remove();
            this.connections.splice(index,1);
        },

        addDendrite: function(index) {
            let copy = Object.assign({},dendriteDefault);
            this.dendriteGid += 1;
            copy.gid = this.dendriteGid;
            this.neurons[index].dendrites.push(copy);
        },

        removeDendrite: function(neuronGid, dendriteIndex) {
            let neuron = this.neurons.filter(function(x) {
                return x.gid == neuronGid
            })[0];
            neuron.dendrites.splice(dendriteIndex, 1);
        },

        getSections: function(neuronGid) {
            let neuron = this.neurons.filter(function(x) {
                return x.gid == neuronGid
            });
            if (neuron.length < 1) {
                return []
            }
            neuron = neuron[0];
            let secs = ['soma', 'axon'].filter(x => {return x in neuron})
            for (dend of neuron.dendrites) {
                secs.push('dendrite-' + dend.gid);
            }
            return secs

        },

        addNeuron: function() {
            console.log('adding Neuron')
            let copy = this.neuron();
            this.neuronGid += 1;
            copy.gid = this.neuronGid;
            copy.name = "neuron_" + this.neuronGid;
            this.neurons.push(copy);

            let newNeuron = this.svgData.cloneNode(true);
            let x = (this.neuronGid * 120) + 50;
            let y = (this.neuronGid * 2) + 75;
            newNeuron.setAttribute('x', x + "px")
            newNeuron.setAttribute('y', y + "px")
            newNeuron.setAttribute('width', "150px")
            newNeuron.setAttribute('height', "150px")
            newNeuron.setAttribute('id', "neuron-" + this.neuronGid)
            newNeuron.classList.add('neuron-container');
            $('#svg-canvas-inner').append(newNeuron);
            makeDraggable();
            axonExtend();
        },

        removeNeuron: function(index) {
            console.log(`removing neuron ${index}`);
            let neuron = this.neurons[index];
            // Destroy connections
            let connections = this.neuronConnections(neuron.gid);
            for (conn of connections) {
                let connIndex = this.connections.indexOf(conn);
                this.removeConnection(connIndex);
            }
            // Destron neuron element
            $('#neuron-' + neuron.gid).remove();
            // Remove data element
            this.neurons.splice(index,1);
        },

        showHideNeuron: function(index) {
            this.neurons[index].open = !this.neurons[index].open;
        },

        neuronConnections: function(neuronGid) {
            let conns = []
            for (con of this.connections) {
                if (con.source == neuronGid | con.target == neuronGid) {
                    conns.push(con)
                }
            }
            return conns;

        },

        drawConnections: function() {
            for (con of this.connections) {
                if (con.source > 0 & con.target > 0) {
                    drawConnection(con.source, con.target, con.gid)
                }
            }
        },

        runSimulation: function() {
            console.log('running simulation')

            let url = '/spyke/simulation'
            let csrftoken = Cookies.get('csrftoken');
            let headers = {'X-CSRFToken': csrftoken};

            let neurons = this.neurons;
            for (var i=0; i < neurons.length; i++) {
                let neuron = neurons[i];
                let neuronElement = $('#neuron-' + neuron.gid)[0];
                this.neurons[i].x = parseInt(neuronElement.getAttribute('x'))
                this.neurons[i].y = parseInt(neuronElement.getAttribute('y'))
            }

            let data = {'time': this.simulation.time,
                        'potential': this.simulation.potential,
                        'stimuli': this.stimuli,
                        'neurons': this.neurons,
                        'connections': this.connections
                        }
            console.log(data)
            axios.post(url,data,{headers: headers})
              .then(response => {
                  console.log(response.data)
                  let neuron_keys = Object.keys(response.data.cells);
                  app.views = Object.keys(response.data.cells[neuron_keys[0]]);
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
            let cells = Object.keys(this.recording.cells);
            console.log("cells", cells)
            var yLabel = "Soma Voltage (mV)";
            let datasets = [];
            var primaryColor = "#36005d"
            for (var i=0; i < cells.length; i++) {
                let k = cells[i]
                let cellData = {
                'label': "Neuron " + k,
                'data': this.recording['cells'][k][view],
                'fill': false,
                // borderColor:"rgb(75, 192, 192)",
                "borderColor" :colors[i],
                "lineTension" :0.1
                };
                datasets.push(cellData)
            }


            // var primaryColor = getComputedStyle(document.documentElement)
                                // .getPropertyValue('--primary');


            this.monitor = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: this.recording.t,
                    datasets: datasets,
                    // datasets: [{
                    //     label: yLabel,
                    //     data: yData,
                    //     fill: false,
                    //     // borderColor:"rgb(75, 192, 192)",
                    //     borderColor:primaryColor,
                    //     lineTension:0.1
                    // }],
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
    },
    mounted: function() {
        // Load neuron svg 
        var response = $.get("/static/spyke/neuron-grey-prod.svg").then(function(xml) {
            app.svgData = xml.documentElement;
            app.addNeuron();
        });

        // Create panzoom in neuron canvas
        var element = document.querySelector('#svg-canvas-inner')
        // And pass it to panzoom
        this.pz = panzoom(element, {
            maxZoom: 10,
            minZoom: 0.1,
            zoomSpeed: 0.02,
            bounds: true,
            boundsPadding: 0.2,
            // Prevent panzoom panning while dragging neuron
            beforeMouseDown: function(e) {
                console.log(e.target.parentElement.parentElement)
            if (e.target.parentElement.parentElement.classList.contains('neuron-container')) {
                return true;
            }
            return false;
            }
            
        });
    }
});

var pz = "";

// Keep track of co-ordinates in the neuron canvas
function updateCoords(event) {
    let tf = app.pz.getTransform();
    let canvas = $('#svg-canvas').offset();
    let clientX = event.pageX;
    let clientY = event.pageY;
    let relX = clientX - canvas.left;
    let relY = clientY - canvas.top;
    let scaledX = ((relX - tf.x) /tf.scale).toFixed(1)
    let scaledY = ((relY - tf.y) /tf.scale).toFixed(1)
    $('#canvas-coords').text(`(${scaledX},${scaledY})`)
}

function makeDraggable() {
    $('.neuron-container').draggable({
        containment: "parent",
        scroll: "false",
        cursor: "move",
        cancel: ".axon-terminal"
    })
      .bind('mousedown', function(event, ui){
        // ignore terminals
        if (event.target.classList.contains('axon-terminal')) {
            return false
        }
        console.log('neuron click')
        // bring target to front
        $(event.target.parentElement).append( event.target );
      })
      // .bind('dragstart', function(event, ui){
      //   console.log('dragstart!')
      //   console.log(event.target)
      //   if (event.target.classList.contains('axon-terminal')) {
      //       console.log('stopping dragstart!')
      //       event.preventDefault();
      //       event.stopPropagation();
      //       return false
      //   }
    // })
      .bind('drag', function(event, ui){
        // ignore terminals
        if (event.target.classList.contains('axon-terminal')) {
            console.log('stopping drag!')
            // event.preventDefault();
            // event.stopPropagation();
            return false
        }
        // console.log('dragging neuron with: ', event.target)
        let container = $('#canvas-container');
        let containerOffset = container.offset();
        
        let targetBox = event.target.getBBox();
        let targetWidth = targetBox.width;
        let targetHeight = targetBox.height;

        let tf = app.pz.getTransform();

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

        // Find attached connections
        let gid = parseInt(event.target.id.slice(7));
        let conns = app.neuronConnections(gid);
        // Redraw attached connections
        for (con of conns) {
            drawConnection(con.source, con.target, con.gid)
        }
    });
}

function convertXY(rawX, rawY) {
    let tf = app.pz.getTransform();
    let canvas = $('#svg-canvas').offset();
    let relX = rawX - canvas.left;
    let relY = rawY - canvas.top;
    let scaledX = ((relX - tf.x) /tf.scale)
    let scaledY = ((relY - tf.y) /tf.scale)
    return [scaledX, scaledY]
}

function getCentre(el) {
    let rect = el.getBoundingClientRect();
    let x = rect.x + rect.width / 2;
    let y = rect.y + rect.height / 2;
    return [x, y]

}

function drawConnection(sourceGid, targetGid, connectionGid) {
    let source = $('#neuron-' + sourceGid);
    let sourceCentre = source.find('.axon-center');
    let [sourceX, sourceY] = getCentre(sourceCentre[0]);
    let [sx, sy] = convertXY(sourceX, sourceY);

    let target = $('#neuron-' + targetGid);
    let targetCentre = target.find('.soma');
    let [targetX, targetY] = getCentre(targetCentre[0]);
    let [tx, ty] = convertXY(targetX, targetY)

    let dx = tx - sx
    let dy = ty - sy
    if (Math.abs(dx) > Math.abs(dy)) {
        var x1 = dx / 2 + sx
        var y1 = sy
        var x2 = x1
        var y2 = ty
    } else {
        var x1 = sx
        var y1 = dy / 2 + sy
        var x2 = tx
        var y2 = y1
    }
    let connection = $('#connection-' + connectionGid)[0] 
    if ($('#connection-' + connectionGid).length < 1) {
        connection = document.createElementNS("http://www.w3.org/2000/svg", "path");
        connection.setAttribute('fill', 'transparent')
        connection.setAttribute('stroke', '#808080')
        connection.setAttribute('stroke-width', '0.5mm')
        connection.setAttribute('stroke-linecap', 'round')
        connection.id = 'connection-' + connectionGid;
        $('#svg-canvas-inner').prepend(connection);
    }

    console.log(`M${sx} ${sy} C ${x1} ${y1}, ${x2} ${y2}, ${tx} ${ty}`)
    connection.setAttribute('d', `M${sx} ${sy} C ${x1} ${y1}, ${x2} ${y2}, ${tx} ${ty}`)
}

function axonExtend() {
    $('.axon-terminal')
    .bind('mousedown', function(event, ui){
        // bring target to front
        console.log('axon-terminal click')
        console.log(event.target)
        let terminal = event.target
        let terminalRect = terminal.getBoundingClientRect();
        let extension = document.createElementNS("http://www.w3.org/2000/svg", "path");
        // get click coords
        let container = $('#canvas-container');
        let containerOffset = container.offset();
        let tf = app.pz.getTransform();

        // let rawX = event.pageX
        // let rawY = event.pageY
        let rawX = terminalRect.x 
        let rawY = terminalRect.y 
        console.log(`raw ${rawX}, ${rawY}`)

        let relX = rawX - containerOffset.left
        let relY = rawY - containerOffset.top

        let scaledX = ((relX - tf.x) / tf.scale) + ((terminalRect.width / 2) / tf.scale) - 0.1
        let scaledY = ((relY - tf.y) / tf.scale) + ((terminalRect.height / 2) / tf.scale) - 0.1
        // let scaledX = event.target.getAttribute('cx')
        // let scaledY = event.target.getAttribute('cy')
        // create path from that point
        app.extendStartX = parseFloat(scaledX)
        app.extendStartY = parseFloat(scaledY)
        extension.setAttribute('d', `M${scaledX} ${scaledY}`)
        extension.setAttribute('fill', 'transparent')
        extension.setAttribute('stroke', '#808080')
        extension.setAttribute('stroke-width', '0.5mm')
        extension.setAttribute('stroke-linecap', 'round')

        extension.id = 'axon-extension'
        // add to doc
        $('#svg-canvas-inner').append(extension);
        console.log(extension)
        // 
        $('#svg-canvas').on('mousemove', function(event, ui){
            console.log('dragging')
            console.log(event.pageX, event.pageY)

            // bring target to front
            console.log('axon-terminal drag')
            // get click coords
            let container = $('#canvas-container');
            let containerOffset = container.offset();
            let tf = app.pz.getTransform();

            let rawX = event.pageX
            let rawY = event.pageY

            let relX = rawX - containerOffset.left
            let relY = rawY - containerOffset.top

            let scaledX = (relX - tf.x) / tf.scale
            let scaledY = (relY - tf.y) / tf.scale

            let mx = app.extendStartX
            let my = app.extendStartY
            let dx = scaledX - mx
            let dy = scaledY - my
            if (Math.abs(dx) > Math.abs(dy)) {
                var x1 = dx / 2 + mx
                var y1 = my
                var x2 = x1
                var y2 = scaledY
            } else {
                var x1 = mx
                var y1 = dy / 2 + my
                var x2 = scaledX
                var y2 = y1
            }
            let x = scaledX
            let y = scaledY
            // create path from that point
            let extension = $('#axon-extension')[0]
            extension.setAttribute('d', `M${mx} ${my} C ${x1} ${y1}, ${x2} ${y2}, ${x} ${y}`)
            // add to doc
            $('#svg-canvas').on('mouseup', function(event, ui) {
                   $(this).off("mousemove");
                   $('#axon-extension').remove();
            });
            $('#svg-canvas').on('mouseleave', function(event, ui) {
                   $(this).off("mousemove");
                   $('#axon-extension').remove();
            });

        });
    })
      
}

function toggleHideNext(el) {
    $(el).toggleClass('show')
    $(el).next().collapse('toggle');
}

window.onload = function() {
    // Make neurons draggable
    makeDraggable();
    axonExtend();
}

