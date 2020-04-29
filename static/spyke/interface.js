

Vue.config.delimiters = ["[[", "]]"]

var app = new Vue({
    el: '#app',
    delimiters: ['[[', ']]'],
    data: {
        settingsTab: 'simulation',
        status: {
            runningSim: false
        },
        popups: {
            save: false,
            load: false,
            editor: false,
        },
        load: {
            selected: "",
        },
        save: {
            filename: "",
        },
        editor: {
            gid: 1, 
            primary: "",

        },
        monitorTab: '',
        neurons: [],
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
             'attribute': 'diam'}
             // {'label': 'Passive conductance',
             // 'helptext': 'S/cm2',
             // 'attribute': 'g',
             // 'step': 0.001},
             // {'label': 'Reversal Potential',
             // 'helptext': 'mV',
             // 'attribute': 'e'}
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
        channels: channels(),
        connections: [],
        recording: {},
        monitor: false,
        views: [],
        neuronTemplate: {},
        toasts: [],
        savedFiles: [],
        editorOptions: ["Sections", "Connections", "Channels"]
    },
    filters: {

    },
    computed: {
        editorNeuron: function() {
            let matches = this.neurons.filter(x=> x.gid == this.editor.gid)
            return matches.pop() || {}
        },

        secondaryOptions: function() {
            let options = []
            if ('soma' in this.editorNeuron) {
                options.push('soma')
            }
            if ('axon' in this.editorNeuron) {
                options.push('axon')
            }
            if ('dendrites' in this.editorNeuron) {
                for (dendrite of this.editorNeuron.dendrites) {
                    options.push('dendrite-' + dendrite.gid)
                }
                
            }
            return options;
        },

    },
    methods: {
        // Utils

        getMaxGid: function(component) {
            let gids = this[component].map(x => x.gid);
            gids.push(0)
            return Math.max(...gids)
        },

        // Layout

        changeSettingsTab: function(tabname) {
            this.settingsTab = tabname;
        },

        neuron: neuronTemplate,

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

            copy.gid = this.getMaxGid('connections') + 1;
            this.connections.push(copy);
        },

        removeConnection: function(index) {
            console.log(`removing connection ${index}`);
            let connection = this.connections[index];
            $('#connection-' + connection.gid).remove();
            this.connections.splice(index,1);
        },

        addDendrite: function(index) {
            let dend = dendriteTemplate();
            dend.gid = Math.max(this.neurons[index].dendrites.map(x=>x.gid)) + 1
            this.neurons[index].dendrites.push(dend);
        },

        removeDendrite: function(neuronGid, dendriteIndex) {
            let neuron = this.neurons.filter(function(x) {
                return x.gid == neuronGid
            })[0];
            neuron.dendrites.splice(dendriteIndex, 1);
        },

        addChannel: function(neuron, section) {
            console.log("adding channel ", neuron, section)
            let sec = this.getSection(neuron.gid, section)
            let channel = channels().filter(x=> x.name == sec.data.selectedChannel).pop();
            sec.channels.push(channel);
        },

        removeChannel: function(neuron, section, channel) {
            let sec = this.getSection(neuron.gid, section)
            sec.channels = sec.channels.filter(x=>x.name != channel)
        },

        getNeuron: function(neuronGid) {
            return this.neurons.filter(x=> x.gid == neuronGid).pop();
        },

        getSections: function(neuronGid) {
            let neuron = this.getNeuron(neuronGid);
            if (neuron == undefined) {
                return []
            }
            let secs = ['soma', 'axon'].filter(x => {return x in neuron})
            for (dend of neuron.dendrites) {
                secs.push('dendrite-' + dend.gid);
            }
            return secs

        },

        getSection: function(gid, section) {
            console.log(gid, section, typeof(section))
            let neuron = this.getNeuron(gid);
            if (neuron == undefined) {
                return neuron;
            }
            if (["axon", "soma"].includes(section)) {
                return neuron[section];
            }

            if (section.startsWith('dendrite')) {
                let dendGid = parseInt(section.slice(9))
                let dend = neuron.dendrites.filter(x=>x.gid == dendGid).pop()
                if (dend == undefined) {console.log("No dendrite with gid " + dendGid + " on neuron " + gid)}
                return dend;
            }
        },

        availableChannels: function(gid, section) {
            console.log('available channels', gid, section)
            let sec = this.getSection(gid, section)
            if (sec == undefined) {
                console.log("ERROR: no section found in available channels: ", gid, section)
                return []
            }
            let used = sec.channels.map(x=>x.name);
            let avail = this.channels.filter(x=> !(used.includes(x.name)));
            console.log(avail, sec.data.selectedChannel)
            let names = avail.map(x=>x.name);
            if (names.length > 0){
                console.log(names)
                if (!(names.includes(sec.data.selectedChannel))) {
                    sec.data.selectedChannel = names[0] || ""
                }
            }
            return avail
        },

        // Neurons

        addNeuron: function() {
            console.log('adding Neuron')
            let neuron = this.neuron();
            
            let gid = this.getMaxGid('neurons') + 1;
            neuron.gid = gid;
            neuron.name = "neuron_" + gid;
            neuron.x = (gid * 120) + 50 + "px";
            neuron.y = (gid * 2) + 75 + "px";
            this.neurons.push(neuron);

            setTimeout(function() {
                makeDraggable();
                axonExtend();
            }, 100)
            
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
            // $('#neuron-' + neuron.gid).remove();
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

        getNeuronLocs: function() {
            let neurons = this.neurons;
            for (var i=0; i < neurons.length; i++) {
                let neuron = neurons[i];
                let neuronElement = $('#neuron-' + neuron.gid)[0];
                this.neurons[i].x = parseInt(neuronElement.getAttribute('x'))
                this.neurons[i].y = parseInt(neuronElement.getAttribute('y'))
            }
        },

        getSaved: function() {
            let url = '/spyke/get_saved'
            let csrftoken = Cookies.get('csrftoken');
            let headers = {'X-CSRFToken': csrftoken};
            axios.get(url,{headers: headers})
              .then(response => {
                  console.log(response.data)
                  this.savedFiles = response.data.savedFiles;
            });
        },

        saveSimulation: function() {
            let url = '/spyke/save'
            let csrftoken = Cookies.get('csrftoken');
            let headers = {'X-CSRFToken': csrftoken};
            this.getNeuronLocs();
            let data = {};
            data.neurons = this.neurons;
            data.simulation = this.simulation;
            data.stimuli = this.stimuli;
            data.connections = this.connections;
            data.filename = this.save.filename;
            axios.post(url,data,{headers: headers})
              .then(response => {
                  console.log(response.data)
                  this.toastObj(response.data)
            });
            this.savePopup(false);
        },

        loadSimulation: function() {
            this.save.filename = this.load.selected;
            let url = '/spyke/load'
            let csrftoken = Cookies.get('csrftoken');
            let headers = {'X-CSRFToken': csrftoken};
            let data = {'filename': this.load.selected}
            axios.post(url,data,{headers: headers})
              .then(response => {
                  console.log(response.data)
                  let conf = response.data;
                  let keys = Object.keys(conf)
                  this.neurons = conf.neurons;
                  this.simulation = conf.simulation;
                  this.stimuli = conf.stimuli;
                  this.connections = conf.connections;

                  this.$nextTick(function () {
                    this.drawConnections();
                });
                  this.toastObj(conf.message)
            });
            this.loadPopup(false);
        },

        runSimulation: function() {
            console.log('running simulation')
            let t0 = Date.now()

            this.status.runningSim = true;

            let url = '/spyke/simulation'
            let csrftoken = Cookies.get('csrftoken');
            let headers = {'X-CSRFToken': csrftoken};

            this.getNeuronLocs();

            let data = {'time': this.simulation.time,
                        'potential': this.simulation.potential,
                        'stimuli': this.stimuli,
                        'neurons': this.neurons,
                        'connections': this.connections
                        }
            console.log(data)
            axios.post(url,data,{headers: headers})
              .then(response => {
                  console.log("response ", Date.now() - t0)
                  console.log(response.data)
                  // Clone and delete message
                  let message = Object.assign({}, response.data.message);
                  message.messages = Object.assign({}, message.messages);
                  console.log(message)
                  this.toastObj(message);
                  delete response.data.message;
                  if (response.data.cells) {
                      let neuron_keys = Object.keys(response.data.cells);
                      app.views = Object.keys(response.data.cells[neuron_keys[0]]);
                      app.recording = response.data;
                      console.log("drawing chart ", Date.now() - t0)
                      app.changeMonitorTab("Soma voltage")
                    }
                  app.status.runningSim = false;
                  console.log("updated ", Date.now() - t0)
            })
            .catch(function (error) {
                // handle error
                console.log("Error: ", error);
                app.addToast("Error Running Simulation", "500 response",
                              error, {}, "error");
                app.status.runningSim = false;
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
        },

        // Popups

        closePopups: function() {
            for (k of Object.keys(this.popups)) {
                this.popups[k] = false;
            }

        },

        savePopup: function(status='toggle') {
            this.closePopups();
            if (status == "toggle") {
                this.popups.save = !this.popups.save;
            } else {
                this.popups.save = status;
            }
        },

        loadPopup: function(status='toggle') {
            this.closePopups();
            if (status == "toggle") {
                this.popups.load = !this.popups.load;
            } else {
                this.popups.load = status;
            }
                this.load.selected = ""
                this.getSaved();
        },

        addToast: function(title, subtitle="", message="", messages=Object(), level="info") {
            let gid = this.getMaxGid('toasts') + 1
            console.log("messages: ", messages)
            let toast = {
                'title': title,
                'subtitle': subtitle,
                'message': message,
                'messages': messages,
                'level': level,
                'gid': gid
            }
            this.toasts.push(toast);
            this.$nextTick(function () {
                    $('#toast-' + gid).toast({autohide:false});
                    $('#toast-' + gid).toast('show');
                });
            if (level == 'success') {
                setTimeout(function() {
                    let idx = app.toasts.map(x=>x.gid).indexOf(gid);
                    app.toasts.splice(idx, 1);
                }, 5000)
            }
        },

        toastObj: function(message) {
            console.log("toast: ", message)
            this.addToast(message.title, message.subtitle, message.message, message.messages, message.level);
        }

        
    },
    mounted: function() {
        // Load neuron svg 
        var response = $.get("/static/spyke/neuron-grey-prod.svg").then(function(xml) {
            app.svgData = xml.documentElement;
            app.addNeuron();
        });

        // Get saved files
        this.getSaved();

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

        // Unhide popups
        document.getElementById('popup-container').classList.remove('hide');
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
    $('.toast').toast({autohide:false});
}

