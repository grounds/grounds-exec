FROM ubuntu:14.04

RUN apt-get update -qq && \
    apt-get install -qy \
    curl \
    gcc

RUN curl -s https://static.rust-lang.org/rustup.sh | sudo sh

ENV DEV /home/dev

COPY run.sh $DEV/run.sh

RUN useradd dev
RUN chown -R dev: $DEV

USER dev
WORKDIR $DEV

ENTRYPOINT ["./run.sh"]
