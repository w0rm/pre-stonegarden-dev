define ["jquery", "jquery-ui"], ($) ->

$.datepicker.regional["ru"] =
  closeText: "Закрыть"
  prevText: "&#x3c;Пред"
  nextText: "След&#x3e;"
  currentText: "Сегодня"
  monthNames: [ "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь" ]
  monthNamesShort: [ "января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря" ]
  dayNames: [ "Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота" ]
  dayNamesShort: [ "вск", "пнд", "втр", "срд", "чтв", "птн", "сбт" ]
  dayNamesMin: [ "Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб" ]
  weekHeader: "Не"
  dateFormat: "yy.mm.dd"
  firstDay: 1
  isRTL: false
  showMonthAfterYear: false
  yearSuffix: ""

$ ->
  $.datepicker.setDefaults $.datepicker.regional[$("body").data("lang")]

$.fn.dateInput = ->
  this.each ->
    name = $(this).attr("name")
    value = $(this).val()
    altField = $("""<input type="text" readonly />""")
      .attr("size", $(this).attr("size"))
      .click(-> dateinput.datepicker "show")
    dateinput = $("<input />").attr(
      type: "hidden"
      name: name
    ).val(value).datepicker(
      altField: altField
      altFormat: "d M, yy"
    )
    $(this).before(dateinput).replaceWith altField
    dateinput.datepicker "setDate", utils.dateFromString(value)

$.fn.datetimeInput = ->
  this.each ->
    name = $(this).attr("name")
    value = $(this).val()

    altField = $("""<input type="text" readonly />""")
      .attr("size", $(this).attr("size"))
      .click(-> dateinput.datepicker "show")

    dateinput = $("<input />").attr(
      type: "hidden"
      name: name
    ).val(value).datepicker(
      altField: altField
      altFormat: "d M, yy"
      onSelect: (year, month, inst) ->
        changevalue()
    ).replaceAll(this)

    changevalue = (e) ->
      hours = parseInt(hoursinput.val())
      minutes = parseInt(minutesinput.val())
      hours = 0 unless hours
      minutes = 0 unless minutes
      hours = 0 if hours < 0
      hours = 23 if hours > 23
      minutes = 0 if minutes < 0
      minutes = 59 if minutes > 59
      datestring = $.datepicker.formatDate('yy-mm-dd', dateinput.datepicker("getDate"));
      dateinput.val datestring + " "+ utils.timify(hours)  + ":" + utils.timify(minutes) + ":00"
      hoursinput.val utils.timify(hours)
      minutesinput.val utils.timify(minutes)
      true

    hoursinput = $( """<input size="2" maxlength="2" class="sg-datetime-hours" type="text" />""" ).change(changevalue)
    minutesinput = $( """<input size="2" maxlength="2" class="sg-datetime-minutes" type="text" />""" ).change(changevalue)

    dateinput.after(
      $("""<span class="sg-datetime" />""").append(
        altField,
        hoursinput,
        $("<span>:</span>"),
        minutesinput
      )
    )

    if value
      date = utils.dateFromString( value )
      hoursinput.val date.getHours()
      minutesinput.val date.getMinutes()
      dateinput.datepicker "setDate", date


