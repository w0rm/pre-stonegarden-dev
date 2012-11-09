{spawn, exec} = require 'child_process'
fs = require 'fs'

runCommand = (name, args...) ->
  proc = spawn name, args
  proc.stderr.on 'data', (buffer) -> console.log buffer.toString()
  proc.stdout.on 'data', (buffer) -> console.log buffer.toString()
  proc.on 'exit', (status) -> process.exit(1) if status isnt 0

endsWith = (str, suffix) ->
  str.indexOf(suffix, str.length - suffix.length) isnt -1

task 'watch', 'Watches for changed source files and builds them (scss to css, coffee to js)', (options) ->
  runCommand 'compass', 'watch', 'templates/scss'
  runCommand 'coffee', '-b', '-o', 'static/js', '-wc', 'templates/coffee'

task 'compile', 'Builds source files (scss to css, coffee to js)', (options) ->
  runCommand 'compass', 'compile', 'templates/scss'
  runCommand 'coffee', '-b', '-o', 'static/js', '-c', 'templates/coffee'

task 'i18n:extract', 'Exctracts messages for translation', (options) ->
  runCommand 'python', 'i18n/extract-messages.py'

task 'i18n:update', 'Updates dictionary files with new messages', (options) ->
  runCommand 'pybabel', 'update', '-i', 'i18n/messages.pot', '-d', 'i18n/'

task 'i18n:compile', 'Compiles dictionary files', (options) ->
  runCommand 'pybabel', 'compile', '-d', 'i18n/', '-f', '--statistics'
