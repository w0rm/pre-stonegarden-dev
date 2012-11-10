# coding: utf-8
# Query class for quering database
import web


class Query(object):

    queries = dict()

    def __init__(self, db, auth):
        self.db, self.auth = db, auth

    def __getattr__(self, name):
        if name in self.queries:

            def q(where="", joins="", limit="", vars=None,
                  with_context=True):

                prefix = web.ctx.prefix

                if vars is None:
                    query_vars = dict()
                else:
                    query_vars = dict(vars)

                result = self.db.query(self.queries[name] % locals(),
                                       vars=query_vars)

                if with_context:
                    return ContextIterator(result)
                else:
                    return result
            return q
        else:
            raise AttributeError("No query for " + name)


class ContextIterator(web.IterBetter):

    def __init__(self, iterator):
        self.__len__ = iterator.__len__
        self.i, self.c = iter(iterator), 0

    def list(self):
        return list(self)

    def contextify(self, obj):
        if "obj_type" in obj:
            obj[str(obj.obj_type[:-1])] = web.storage(
                [("id", obj.obj_id)] +
                [(web.lstrips(k, obj.obj_type + "_"), obj.pop(k))
                 for k in obj.keys() if k.startswith(obj.obj_type)])
        for photo in ("tile_photo", "location_photo"):
            if photo + "_id" in obj:
                obj[photo] = web.storage(
                    id=obj.pop(photo + "_id"),
                    filename=obj.pop(photo + "_filename"),
                    sizes=obj.pop(photo + "_sizes"),
                )
        return obj

    def __iter__(self):
        if hasattr(self, "_head"):
            yield self.contextify(self._head)

        while 1:
            yield self.contextify(self.i.next())
            self.c += 1

    def __getitem__(self, i):
        #todo: slices
        if i < self.c:
            raise IndexError("already passed " + str(i))
        try:
            while i > self.c:
                self.i.next()
                self.c += 1
            # now self.c == i
            self.c += 1
            return self.contextify(self.i.next())
        except StopIteration:
            raise IndexError(str(i))

    def __nonzero__(self):
        if hasattr(self, "__len__"):
            return len(self) != 0
        elif hasattr(self, "_head"):
            return True
        else:
            try:
                self._head = self.i.next()
            except StopIteration:
                return False
            else:
                return True
