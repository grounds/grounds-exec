FROM ruby:latest

RUN gem install rails --version 4.1.7

ENV DEV /home/dev

# We also need sync.rb file to capture output in real time
COPY . $DEV

ENV RUBYOPT -r $DEV/sync.rb

RUN useradd dev
RUN chown -R dev: $DEV

USER dev
WORKDIR $DEV

ENTRYPOINT ["./run.sh"]
