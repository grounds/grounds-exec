# Output should be flushed immediately to the underlying operating system
# and not buffered internally.
#
# e.g. With this code:
#
# 5.times do
#   putc('.')
#   sleep(2)
# end
#
# Per default, this will get nothing on the output for the first 10 seconds,
# then have five dots in one shot.
#
# We want to get a dot after every two seconds, we need to capture output
# in real time with:
$stdout.sync = true
$stderr.sync = true
