"""
General Utilities
"""


def dthandler(obj):
    """To encode datetime objects in json"""
    if hasattr(obj, "isoformat"):
        return obj.isoformat()
    else:
        raise TypeError('Object of type %s with value of '
                        '%s is not JSON serializable' % (type(Obj), repr(Obj)))
