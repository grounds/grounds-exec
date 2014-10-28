FROM ubuntu:14.04

RUN apt-get update -q && \
    apt-get -qy install \
    mono-mcs

COPY run.sh /home/dev/run.sh

RUN useradd dev
RUN chown -R dev: /home/dev

USER dev
WORKDIR /home/dev

ENTRYPOINT ["/home/dev/run.sh"]
