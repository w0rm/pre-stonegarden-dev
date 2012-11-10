define ["jquery"], ($) ->


  timify: (time) ->

    if time < 10
      "0" + time
    else
      time

  dateFromString: (dateAsString) ->
    pattern = new RegExp "(\\d{4})-(\\d{2})-(\\d{2}) (\\d{2}):(\\d{2}):(\\d{2})"
    parts = dateAsString.match pattern
    if parts
      new Date(
        parseInt(parts[1], 10),
        parseInt(parts[2], 10) - 1,
        parseInt(parts[3], 10),
        parseInt(parts[4], 10),
        parseInt(parts[5], 10),
        parseInt(parts[6], 10),
        0
      )
    else
      null
