FROM ruby:latest

RUN gem install rails --version 4.1.7

# We also need sync.rb file to capture output in real time
COPY . /home/dev/

ENV RUBYOPT -r /home/dev/sync.rb

RUN useradd dev
RUN chown -R dev: /home/dev

USER dev
WORKDIR /home/dev

ENTRYPOINT ["/home/dev/run.sh"]
