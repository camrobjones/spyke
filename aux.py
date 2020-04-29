"""
Auxiliary Function
------------------
Mostly web/django stuff
"""


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


class Message():
    """Helper class to keep track of errors & messages"""
    def __init__(self, title="", subtitle="", message="", level="info"):
        self.info = []
        self.warning = []
        self.error = []
        self.title = title
        self.level = level
        self.subtitle = subtitle
        self.message = message


    @property
    def strings(self):
        return {"Error": self.error,
                "Warning": self.warning,
                "Message": self.info}

    def count_attribute(self, att_name):
        """Return string summary of attribute count"""
        att = self.strings[att_name]
        len_att = len(att)
        out = f"{len_att} {att_name}"
        if len_att > 1 or len_att == 0:
            out += 's'
        return out

    @property
    def messages(self):
        out = {}
        summary = []
        messages = {}
        total = 0

        if self.info:
            heading = self.count_attribute('Message')
            messages[heading] = self.info
            summary.insert(0, heading)
            total += len(self.info)
        if self.warning:
            heading = self.count_attribute('Warning')
            messages[heading] = self.warning
            self.level = "warning"
            summary.insert(0, heading)
            total += len(self.warning)
        if self.error:
            heading = self.count_attribute('Error')
            messages[heading] = self.error
            self.level = "error"
            summary.insert(0, heading)
            total += len(self.error)

        summary = ", ".join(summary)

        if total:
            out['title'] = summary
            out['subtitle'] = self.level.title()

        else:
            out['title'] = self.title or summary
            out['subtitle'] = self.subtitle or self.level.title()

        out['message'] = self.message
        out['messages'] = messages
        out['level'] = self.level

        return out