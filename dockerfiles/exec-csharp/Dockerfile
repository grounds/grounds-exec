FROM ubuntu:14.04

RUN apt-get update -q && \
    apt-get -qy install \
    mono-mcs

ENV DEV /home/dev

COPY run.sh $DEV/run.sh

RUN useradd dev
RUN chown -R dev: $DEV

USER dev
WORKDIR $DEV

ENTRYPOINT ["./run.sh"]
