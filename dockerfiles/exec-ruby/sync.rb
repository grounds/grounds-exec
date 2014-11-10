# Output should be flushed immediately to the underlying operating system
# and is not buffered internally.
#
# e.g.
#
# 5.times do
#   putc('.')
#   sleep(2)
# end
#
# Per default, output will get nothing for the first 10 seconds, then have
# five dots in one shot.
#
# We want that output will get a dot after every two seconds.

$stdout.sync = true
$stderr.sync = true
