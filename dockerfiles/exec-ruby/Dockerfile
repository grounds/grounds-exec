FROM ruby:latest 

COPY run.sh /home/dev/run.sh

RUN useradd dev
RUN chown -R dev: /home/dev

USER dev
WORKDIR /home/dev

ENV RUBYOPT "-r /home/dev/sync.rb"

ENTRYPOINT ["/home/dev/run.sh"]
