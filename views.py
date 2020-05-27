"""
Spyke Django Views
------------------
Functions to return HTML and JSON data to clients
"""

import json
import logging
import traceback
import sys

from django.shortcuts import render
from django.http import JsonResponse
from django.utils import timezone as tz

from spyke.models import SimpleNeuron, Simulation
from spyke.db import SimConfig
from spyke.aux import Message, _decode, params2dict

"""
Constants
---------
"""
logger = logging.getLogger('spyke')

# Asynchronous data views


def simulation(request):
    """
    Run a simulation and return results as a JSON
    """
    logger.info("Request recieved at views.simulation")
    t0 = tz.datetime.now()
    message = Message(title="Simulation Complete",
                      subtitle="Success",
                      )
    post = json.loads(request.body.decode('utf-8'), object_hook=_decode)

    # Retrieve simulation parameters
    time = post.get('time', 25)
    potential = post.get('potential', -65)
    celsius = post.get('celsius', 6.3)

    # Create neuron
    parameters = post['neurons']
    cells = {}
    logger.info("Creating neurons")
    for neuron in parameters:
        logger.info("Neuron: %s", neuron)
        try:
            gid = neuron['gid']
            x = neuron['x']
            y = neuron['y']
            cell = SimpleNeuron(gid, x, y, 0, 0, neuron)

            cells[gid] = cell
        except (TypeError, ValueError) as e:
            logger.error("Error creating: %s", neuron['name'])
            traceback.print_exc(file=sys.stdout)
            message.error.append(f"Error creating {neuron['name']}: {e}")

    # Create stimuli
    stimuli = post.get('stimuli', [])
    logger.info("Creating stimuli")
    for stimulus in stimuli:
        logger.debug("Stimulus: %s", stimulus)
        try:
            cell_gid = stimulus.pop('neuron')

            # remove extra keys from dict: not ideal solution...
            stimulus.pop('title')
            stimulus.pop('gid')
            # convert param array to dict: again could move to frontend
            stimulus['parameters'] = params2dict(stimulus['parameters'])

            cell = cells[cell_gid]
            cell.add_stimulus(**stimulus)

        except Exception as e:
            logger.error("Error creating stimulus: %s", e)
            traceback.print_exc(file=sys.stdout)
            message.error.append(f"Error creating stimulus: {e}")

    # Run simulation
    logger.info("cells length: %s", len(cells))
    try:
        sim = Simulation(cells, celsius)
    except Exception as e:
        logger.error("Error creating simulation: %s", e)
        traceback.print_exc(file=sys.stdout)
        message.error.append(f"Error creating simulation: {e}")

    # Create Connections
    logger.info("Creating connections")
    connections = post.get('connections', [])
    for connection in connections:
        logger.debug("connection: %s", connection)
        source_gid = connection['source']
        target_gid = connection['target']
        delay = connection['delay']
        weight = connection['weight']
        threshold = connection['threshold']
        section = connection['section']
        loc = connection['loc']
        tau = connection['tau']
        e = connection['e']

        if source_gid and target_gid:
            source = cells[source_gid]
            target = cells[target_gid]
            sim.add_connection(source, target, delay, weight, threshold,
                               section, loc, tau, e)
        else:
            msg = "Invalid source or target in connection {}"
            msg = msg.format(connection.get('gid', 'noGid'))
            logger.warning(msg)
            message.warning.append(f"Error creating connection: {msg}")

    logger.info("Running simulation")
    try:
        sim.run(runtime=time, potential=potential)
        out = sim.output
    except Exception as e:
        logger.error("Error running simulation: %s", e)
        traceback.print_exc(file=sys.stdout)
        message.error.append(f"Error running simulation: {e}")
        out = {}

    t_1 = tz.datetime.now()
    tdelta = (t_1 - t0).total_seconds()

    # Create message for user
    message.message = f'Simulation complete in {tdelta:.1g}s'
    message.level = 'success'
    out['message'] = message.messages

    # Return results as JSON
    logger.info("Returning response")
    return JsonResponse(out)


def interface(request):
    """Main interface view"""
    logger.info("Request recieved at views.interface")
    return render(request, 'spyke/interface.html')


def save_simulation(request):
    """Save simulation config"""
    logger.info("Request recieved at views.save_simulation")
    post = json.loads(request.body.decode('utf-8'), object_hook=_decode)

    filename = post.pop('filename')
    sim, created = SimConfig.objects.get_or_create(name=filename)
    if created:
        sim.set_datafile()
    sim.save_config(post)
    sim.save()

    message = {'title': "Simulation Saved", 'subtitle': "Save",
               'message': f'Simulation successfully saved as "{filename}"',
               'level': "success"}

    return JsonResponse(message)


def load_simulation(request):
    """Save simulation config"""
    logger.info("Request recieved at views.load_simulation")
    post = json.loads(request.body.decode('utf-8'), object_hook=_decode)

    filename = post.pop('filename')
    sim = SimConfig.objects.get(name=filename)
    data = sim.load_config()

    message = {'title': "Simulation Loaded", 'subtitle': "Load",
               'message': f'Simulation "{filename}" successfully loaded.',
               'level': "success"}

    data['message'] = message

    return JsonResponse(data)


def saved_files(request):
    """Return a list of saved file names"""
    logger.info("Request recieved at views.saved_files")
    sims = SimConfig.objects.all().order_by('-created')
    out = {"savedFiles": [{'name': sim.name} for sim in sims]}

    return JsonResponse(out)
