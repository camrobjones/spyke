"""
Spyke Django Views
------------------
Functions to return HTML and JSON data to clients
"""

import json
import logging

from django.shortcuts import render
from django.http import JsonResponse

from spyke.models import BallAndStick, Simulation, h

"""
Constants
---------
"""
logger = logging.getLogger('django')


def _decode(o):
    """Helper function to decode JSON floats and ints as numeric"""
    if isinstance(o, str):
        # First attempt to parse as float
        try:
            return float(o)
        except ValueError:
            # Then try int
            try:
                return int(o)
            except ValueError:
                # Then accept string
                return o
    elif isinstance(o, dict):
        return {k: _decode(v) for k, v in o.items()}
    elif isinstance(o, list):
        return [_decode(v) for v in o]
    else:
        return o


# Asynchronous data views


def simulation(request):
    """
    Run a simulation and return results as a JSON
    """
    post = json.loads(request.body.decode('utf-8'), object_hook=_decode)

    # Retrieve simulation parameters
    time = post.get('time', 25)
    potential = post.get('potential', -65)

    # Create neuron
    parameters = post['neurons']
    logger.info("Parameters: %s", parameters)
    cells = {}
    for neuron in parameters:
        logger.info("Neuron: %s", neuron)
        gid = neuron['gid']
        x = neuron['x']
        y = neuron['y']
        cell = BallAndStick(gid, x, y, 0, 0, neuron)

        cells[gid] = cell

    # Create stimuli
    stimuli = post.get('stimuli', [])
    for stimulus in stimuli:
        cell_gid = stimulus.pop('neuron')
        cell = cells[cell_gid]
        cell.add_stimulus(**stimulus)

    # Run simulation
    logger.info("cells length: %s", len(cells))
    sim = Simulation(cells)

    # Create Connections
    connections = post.get('connections', [])
    for connection in connections:
        print(connection)
        source_gid = connection['source']
        target_gid = connection['target']
        delay = connection['delay']
        weight = connection['weight']
        threshold = connection['threshold']
        section = connection['section']
        loc = connection['loc']
        tau = connection['tau']

        if source_gid and target_gid:
            source = cells[source_gid]
            target = cells[target_gid]
            sim.add_connection(source, target, delay, weight, threshold,
                               section, loc, tau)
        else:
            logger.warning("Invalid source or target in connection %s",
                           connection.get('gid', 'noGid'))

    sim.run(runtime=time, potential=potential)

    # Return results as JSON
    return JsonResponse(sim.output)


def interface(request):
    """Main interface view"""
    return render(request, 'spyke/interface.html')
